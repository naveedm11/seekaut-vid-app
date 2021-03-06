const app = require("express").Router();
const userController = require("../controllers/user.controller");
const userVideoController = require("../controllers/userVideo.controller");
const videoCountController = require("../controllers/videoCount.controller");
const { authJwt } = require("../middleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const Conversation = require("../models/conversation");
const sound = require("../controllers/soundConroller");
const user_action = require("../controllers/user_actions");
const videoTags = require("../controllers/categories");

const Message = require("../models/message");

//add

app.get("/all", userController.allAccess);

app.get("/user", [authJwt.verifyToken], userController.userBoard);

app.post('/upload',
         upload.fields([{
           name: 'video', maxCount: 1
         }, {
           name: 'thumbnail', maxCount: 1
         }]),    userVideoController.upload)

app.get("/fetch/:id",
//  [authJwt.verifyToken],
  userVideoController.fetchVideo);
app.get("/fetchAll", userVideoController.fetchAllVideo);
app.delete("/deleteVideo/:id",[authJwt.verifyToken],userVideoController.deleteVideo );

app.get(
  "/searchVideoByUser",
  // [authJwt.verifyToken],
  userVideoController.SearchVideobyUser
);

app.post(
  "/searchVideoByTopic",
  // [authJwt.verifyToken],
  userVideoController.SearchVideobyTopic
);

app.post(
  "/searchVideoByCategory",
  // [authJwt.verifyToken],
  userVideoController.SearchVideobyCategory
);

app.post(
  "/searchUsersByName",
  userController.searchUsersByName
);

//like and comment routes
app.get("/like/:vid_id/:user_id", 
// [authJwt.verifyToken], 
videoCountController.like);

app.post("/comment", 
// [authJwt.verifyToken], 
upload.single("media"),
videoCountController.comment);


app.get("/get_comment/:video_id", videoCountController.fetchComment);


app.get(
  "/admin",
  [authJwt.verifyToken, authJwt.isAdmin],
  userController.adminBoard
);

//new conv

app.post("/sendConversation", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of a user

app.get("/getConversation/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get conv includes two userId

app.get("/findUserConvo/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation)
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post("/sendMessage", async (req, res) => {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get

app.get("/getMessage/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.post(
  "/uploadSound",
  [authJwt.verifyToken],
  upload.single("sound"),
sound.uploadSound
);
app.get("/fetchSound",   [authJwt.verifyToken],  sound.fetchSound);

app.get("/follow/:follower/:followed", user_action.follow);
// app.get("/unfollow/:follower/:followed", user_action.unfollow);

app.post(
  "/creatCategory",
  videoTags.add_tag
);

app.get("/fetchCategories", videoTags.get_tags);

module.exports = app;