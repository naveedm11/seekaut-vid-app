const User = require('../models/user.model')

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.searchUsersByName = async (req, res) => {
  try {
    let name = req.body.name
    if(!name){
      res.status(400).send({status:"failed",message:"please enter the name"})
    }
    const users = await User.find({ "fullName": { $regex: '.*' + name + '.*',$options: 'i' } })
    if (!users) {
      res.status(404).send({
        status: "Failed",
        message: "No Users Found"
      });
    }
    console.log(users);

    res.status(201).send({
      status: "success",
      message: "users fetched",
      data: users
    })

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: error });
  }

}
