var fs = require("fs");
const UserVideo = require("../models/uservideo.model");
const VideoCount = require("../models/videoCount.model");
const S3 = require("aws-sdk/clients/s3");
const AWS = require("aws-sdk");
const wasabiEndpoint = new AWS.Endpoint("s3.eu-central-1.wasabisys.com ");

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

exports.upload = async (req, res) => {
  console.log(req.file);
  if (req.file) {
    try {
      let params = uploadParams;

      params.Key = Date.now() + "--" + req.file.originalname;
      params.Body = req.file.buffer;

      s3Client.upload(params, async (err, data) => {
        if (err) {
          res.status(500).json({ error: "Error -> " + err });
        }

        const userVideo = await UserVideo.create({
          user: req.userId,
          videoUrl: data.Location,
          videoName: params.Key,
          tags: req.body.tags,
          soundId: req.body.soundId,
          description: req.body.description
        });

        if (userVideo) {
          const videoCount = await VideoCount.create({
            video: userVideo._id,
          });
          if (videoCount) {
            userVideo.count = videoCount._id;
          }
          userVideo.save();
          res.json({
            message: "File uploaded successfully",
            filename: params.Key,
            location: data.Location,
          });
        } else {
          res
            .status(500)
            .send({ status: "failed", message: "video not uploaded" });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", error: error });
    }
  }
};
exports.fetchVideo = async (req, res) => {
  try {
    const userVideo = await UserVideo.findOne({ _id: req.params.id })
      .populate("user", "-password -roles")
      .populate("count", "-_id");

    if (!userVideo) {
      return res
        .status(404)
        .send({ status: "Failed", message: "Video Not Found" });
    }
    res
      .status(200)
      .send({ status: "success", message: "video fetched", data: userVideo });

    // let params = fetchParams;
    // params.Key = userVideo.videoName;
    // s3Client.getObject(params, function (err, data) {
    //   if (err) {
    //     res.status(500).json({ error: "Error -> " + err });
    //   } else
    //   res.status(200).send({ status: "success", message: "video fetched", video_Url: userVideo.videoUrl, userInfo: userVideo.user, counts: userVideo.count });
    // });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: error });
  }
};

exports.fetchAllVideo = async (req, res) => {
  try {

    var page = parseInt(req.query.page)
    var size = parseInt(req.query.size)
    var query = {}
    if (page < 0 || page === 0) {
      response = { "error": true, "message": "invalid page number, should start with 1" };
      return res.json(response)
    }
    query.skip = size * (page - 1)
    query.limit = size

    const userVideo = await UserVideo.find({}, {}, query)
      .populate("user", "-password -roles")
      .populate("count", "-_id")
      .populate("soundId");

    if (!userVideo) {
      return res
        .status(404)
        .send({ status: "Failed", message: "Video Not Found" });
    }
    res.status(200).send({
      status: "success",
      message: "video fetched",
      page,
      size,
      data: userVideo,
    });

    // let params = fetchParams
    // params.Key = userVideo.videoName
    // s3Client.getObject(params, function (err, data) {
    //     if (err) {
    //         res.status(500).json({ error: "Error -> " + err });
    //     }
    //     else
    //         res.status(200).send({ status: "success", message: "video fetched", video_Url: userVideo.videoUrl, userInfo: userVideo.user, counts: userVideo.count })

    // });
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

    // let params = fetchParams;
    // params.Key = userVideo.videoName;
    // s3Client.getObject(params, function (err, data) {
    //   if (err) {
    //     res.status(500).json({ error: "Error -> " + err });
    //   } else
    //   res.status(200).send({ status: "success", message: "video fetched", video_Url: userVideo.videoUrl, userInfo: userVideo.user, counts: userVideo.count });
    // });
  } catch (error) {
    console.log(error);
    res.status(500).send({ status: "failed", message: error });
  }
};

exports.SearchVideobyTag = async (req, res) => {
  try {
    const tag = req.body.tag;
    const userVideo = await UserVideo.find({ tags: { $in: [tag] } });
    console.log(userVideo);
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


