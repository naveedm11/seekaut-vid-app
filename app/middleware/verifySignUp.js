const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = async (req, res, next) => {
  console.log(req.body.username);

 if(req.body.username){
  const doesUserNameExists = await User.findOne({ $or: [{ 'username': req.body.username }] })
  if (doesUserNameExists) {
    return res.status(500).send({
      success: false,
      message: 'Username already exists,Choose different username'
    })
  }
}
  const doesUserEmailExists = await User.findOne({ $or: [{ 'email': req.body.email }] })
  if (doesUserEmailExists) {
    return res.status(500).send({
      success: false,
      message: 'Email already exists,Choose different email'
    })
  }

  if(req.body.phone){
  const doesUserMobileExists = await User.findOne({ $or: [{ 'phone': req.body.phone }] })
  if (doesUserMobileExists) {
    return res.status(500).send({
      success: false,
      message: 'Phone already exists,Choose different phone'
    })
  }
}
  next();
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`
        });
        return;
      }
    }
  }

  next();
};

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted
};

module.exports = verifySignUp;