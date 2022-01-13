const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const S3 = require("aws-sdk/clients/s3");
const AWS = require("aws-sdk");
const wasabiEndpoint = new AWS.Endpoint("s3.eu-central-1.wasabisys.com ");

const ObjectId = require('mongodb').ObjectId;
const accessKeyId = "CW02H3YPJOCHACJRVG94";
const secretAccessKey = "AeERvP8EjaTiSiHMtteAyyH0jYEUfMkSPBlmVD4H";

const s3Client = new S3({
  endpoint: wasabiEndpoint,
  region: "eu-central-1",
  accessKeyId,
  secretAccessKey,
});
const BUCKET_NAME = "seekaut";
const uploadParams = {
  Bucket: BUCKET_NAME,
  Key: "", // pass key
  Body: null, // pass file body
};

const fetchParams = {
  Bucket: BUCKET_NAME,
  Key: "", //pass key
};

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  
  const { firstName, lastName, username, email, phone, gender, dob, bio, nationality, password, role } = req.body
  
  if (!email) {
    return res.status(500).send({ success: false , message: "Please provide email" })
  }

  if (!password) {
    return res.status(500).send({ success: false , message: "Please set password" })
  }

  let fullName = req.body.firstName + " " + req.body.lastName
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    fullName: fullName,
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    gender: req.body.gender,
    dob: req.body.dob,
    bio: req.body.bio,
    nationality: req.body.nationality,
    password: bcrypt.hashSync(req.body.password, 8)

  });

  if (req.file) {
    try {
      console.log("file is uploaded");
      let params = uploadParams;

      params.Key = Date.now() + "--" + req.file.originalname;
      params.Body = req.file.buffer;

      s3Client.upload(params, async (err, data) => {

        if (err) {
          res.status(500).json({ error: "Error -> " + err });
        }
        user.profilePic = data.Location

        user.save((err, user) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }
          console.log(role);
          if (role) {
            Role.find(
              {
                name: { $in: role }
              },
              (err, roles) => {
                if (err) {
                  res.status(500).send({ message: err });
                  return;
                }

                user.roles = roles.map(role => role._id);
                user.save(err => {
                  if (err) {
                    res.status(500).send({ message: err });
                    return;
                  }

                  res.status(200).send({ success: true, message: "User was registered successfully!" });
                });
              }
            );
          } else {
            Role.findOne({ name: "user" }, (err, role) => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }

              user.roles = [role._id];
              user.save(err => {
                if (err) {
                  res.status(500).send({ message: err });
                  return;
                }

                res.send({ success: true, message: "User was registered successfully!" });
              });
            });
          }
        });

      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ success: false , error: error });
    }
  }

  else {
    console.log("file is not uploaded");
    user.save(err => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      res.status(200).send({ success: true , message: "User was registered successfully!" });
    });
  }
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ success: false, message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          status: false,
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400 // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        accessToken: token
      });
    });
};

//update user
exports.updateUser = async (req, res) => {

 if(req.body.username){
  const doesUserNameExists = await User.findOne({ $or: [{ 'username': req.body.username }] })
  if (doesUserNameExists) {
    return res.status(500).send({
      success: false,
      message: 'Username already exists,Choose different username'
    })
  }
}

    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }

    try {

      const user = await User.findOneAndUpdate({ _id: ObjectId(req.params.id)}, {$set: req.body});

      if (req.body.hasOwnProperty('firstName') && req.body.hasOwnProperty('lastName')) {
        user.fullName = req.body.firstName + ' ' + req.body.lastName
      }
      else if (req.body.hasOwnProperty('firstName')) {
        user.fullName = req.body.firstName + user.fullName.split(' ')[1]
      }
      else if (req.body.hasOwnProperty('lastName')) {
        user.fullName = user.fullName.split(' ')[0] + ' ' + req.body.lastName
      }
      await user.save();
      console.log("user==>", user);

      res.status(200).send({ success: true , message: "User is updated successfully!"});
    } 
    catch (err) {
      return res.status(500).json(err);
    }
  // } else {
  //   return res.status(403).json("You can update only your account!");
  // }
}