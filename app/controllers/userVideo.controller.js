var fs = require("fs");
const UserVideo = require("../models/uservideo.model");
const VideoCount = require("../models/videoCount.model");
const Category = require("../models/categories");
const S3 = require("aws-sdk/clients/s3");
const AWS = require("aws-sdk");
const wasabiEndpoint = new AWS.Endpoint("s3.eu-central-1.wasabisys.com ");
const db = require("../models");
const User = db.user;
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

const videoParams = {
  Bucket: BUCKET_NAME,
  Key: "", // pass key
  Body: null, // pass file body
};

const thumbnailParams = {
  Bucket: BUCKET_NAME,
  Key: "", // pass key
  Body: null, // pass file body
};

const fetchParams = {
  Bucket: BUCKET_NAME,
  Key: "", //pass key
};

exports.upload = async (req, res) => {

  const cat = await Category.findOne({ _id: req.body.category });
  if(!cat){
    res
              .status(500)
              .send({ status: "failed", message: "category not found" });
  }

  let user_video = {};
  let userVideo = {};

  if (req.files) {
    try {
      let video_params = videoParams;
      let thumbnail_params = thumbnailParams;

      const video = req.files.video[0];
      const thumbnail = req.files.thumbnail[0];

      video_params.Key = Date.now() + "--" + video.originalname;
      video_params.Body = video.buffer;

      thumbnail_params.Key = Date.now() + "--" + thumbnail.originalname;
      thumbnail_params.Body = thumbnail.buffer;

      s3Client.upload(video_params, async (err, data) => {
        if (err) {
          res.status(500).json({ error: "Error -> " + err });
        }
        user_video.videoUrl = data.Location;
        user_video.videoName = video_params.Key

        s3Client.upload(thumbnail_params, async (err, data) => {
          if (err) {
            res.status(500).json({ error: "Error -> " + err });
          }
          user_video.thumbnailUrl = data.Location;

          userVideo = await UserVideo.create({
            user: req.body.userId,
            allow_comments: req.body.allow_comments,
            location: req.body.location,
            videoUrl: user_video.videoUrl,
            videoName: user_video.videoName,
            videoTopic: req.body.videoTopic,
            tags: req.body.tags,
            category : req.body.category,
            soundId: req.body.soundId,
            description: req.body.description,
            thumbnailUrl : data.Location
          });
  
          if (userVideo) {
            const videoCount = await VideoCount.create({
              video: userVideo._id,
            });

            userVideo.count = videoCount._id;
            userVideo.save();
        
            res.json({
              success : true,
              message: "File uploaded successfully",
              id : userVideo._id,
              filename: video_params.Key,
              location: userVideo.videoUrl,
              thumbnail: userVideo.thumbnailUrl
            });
          } else {
            res
              .status(500)
              .send({ success: false, message: "video not uploaded" });
          }
  
        });

      });

    } catch (error) {
      console.log(error);
      res.status(500).send({ success: false, error: error });
    }
  }
  else {
  res.status(500).send({ success: false, message: "no file" });
    }
};

exports.fetchVideo = async (req, res) => {
  try {
    const userVideo = await UserVideo.findOne({ _id: req.params.id })
      .populate("user", "-password -roles")
      .populate("count", "_id")
      .populate("category", "_id title")
      .populate("soundId");
      ;

    if (!userVideo) {
      return res
        .status(404)
        .send({ status: "Failed", message: "Video Not Found" });
    }
    res
      .status(200)
      .send({ status: "success", message: "video fetched", data: userVideo });

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: error });
  }
};

exports.fetchAllVideo = async (req, res) => {
  try {

    var page = parseInt(req.query.page)
    var size = parseInt(req.query.size)
    var user_id = String(req.query.user_id)

    var query = {}
    if (page < 0 || page === 0) {
      response = { "error": true, "message": "invalid page number, should start with 1" };
      return res.json(response)
    }
    query.skip = size * (page - 1)
    query.limit = size

    const userVideo = await UserVideo.find({}, {}, query).sort({active_at:-1})
      .populate("user", "_id -password -roles")
      .populate("count", "-_id ")
      .populate("category", "_id title")
      .populate("soundId");

    if (!userVideo) {
      return res
        .status(404)
        .send({ status: "Failed", message: "Video Not Found" });
    }
    
    for(let item of userVideo)
    {
        const index_of_follower = item.user.followed_by.indexOf(user_id);
        const is_following = index_of_follower !== -1;
        
        if(is_following){
          item.status = 1;
        }
        else {
          item.status = 0;
        }
      }

    res.status(200).send({
      status: "success",
      message: "video fetched",
      page,
      size,
      data: userVideo,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: error });
  }
};

exports.deleteVideo = async (req, res) => {
  try {
    let id = req.params.id;
    const userVideo = await UserVideo.deleteOne({ _id: id });
    await VideoCount.deleteOne({ video: id });

    if (!userVideo) {
      return res
        .status(404)
        .send({ status: "Failed", message: "Video Not Found" });
    }
    res
      .status(200)
      .send({ status: "success", message: "delete Video", data: userVideo });

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: error });
  }
};

exports.SearchVideobyTag = async (req, res) => {
  try {
    const tag = req.body.tag;
    const userVideo = await UserVideo.find({ tags: { $in: [tag] } });
    if (!userVideo.length > 0) {
      return res
        .status(404)
        .send({ status: "Failed", message: "Video Not Found" });
    }
    res.status(200).send({
      status: "success",
      message: "video fetched",
      data: userVideo,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: error });
  }
};

exports.SearchVideobyTopic = async (req, res) => {
  try {
    const topic = req.body.topic;
    const userVideo = await UserVideo.find({ videoTopic: topic });
    if (!userVideo.length > 0) {
      return res
        .status(404)
        .send({ status: "Failed", message: "Video Not Found" });
    }
    res.status(200).send({
      status: "success",
      message: "video fetched",
      data: userVideo,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: error });
  }
};

exports.SearchVideobyCategory = async (req, res) => {
  try {
    const cat = req.body.category;
    const userVideo = await UserVideo.find({ category: cat });
    if (!userVideo.length > 0) {
      return res
        .status(404)
        .send({ status: "Failed", message: "Video Not Found" });
    }
    res.status(200).send({
      status: "success",
      message: "video fetched",
      data: userVideo,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: error });
  }
};

exports.SearchVideobyUser = async (req, res) => {
  try {

    var page = parseInt(req.query.page)
    var size = parseInt(req.query.size)
    var user_id = String(req.query.user_id)

    var query = {}
    if (page < 0 || page === 0) {
      response = { "error": true, "message": "invalid page number, should start with 1" };
      return res.json(response)
    }
    query.skip = size * (page - 1)
    query.limit = size

    const userVideo = await UserVideo.find({'user' : user_id }, {}, query).sort({active_at:-1})
      .populate("user", "_id -password -roles")
      .populate("count", "-_id ")
      .populate("category", "_id title")
      .populate("soundId");

    if (!userVideo) {
      return res
        .status(404)
        .send({ status: "Failed", message: "Video Not Found" });
    }
    
    for(let item of userVideo)
    {
        const index_of_follower = item.user.followed_by.indexOf(user_id);
        const is_following = index_of_follower !== -1;
        
        if(is_following){
          item.status = 1;
        }
        else {
          item.status = 0;
        }
      }

    res.status(200).send({
      status: "success",
      message: "video fetched",
      page,
      size,
      data: userVideo,
    });

  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: error });
  }
};