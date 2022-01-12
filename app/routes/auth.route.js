const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const app = require("express").Router();
var multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

app.post(
  "/signup", 
  upload.single("profilePic"), [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted], 
  controller.signup
);

app.post("/signin", controller.signin);

app.post("/update/:id", controller.updateUser);
module.exports = app;