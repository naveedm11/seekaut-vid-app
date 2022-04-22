const Sound = require("../models/sound.model");
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

exports.uploadSound = async(req, res) => {
    if (req.file) {
        try {
          let params = uploadParams;
    
          params.Key = Date.now() + "--" + req.file.originalname;
          params.Body = req.file.buffer;
    
          s3Client.upload(params, async (err, data) => {
            if (err) {
              res.status(500).json({ error: "Error -> " + err });
            }

    const videoSound = await Sound.create({
        soundUrl: data.Location,
        soundName:params.Key,
        soundTags: req.body.soundTags
      });
 
 if (videoSound) {
    await videoSound.save()
    res.json({
        message: "File uploaded successfully",
        filename: params.Key,
        location: data.Location,
      });
    }
    else {
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

exports.fetchSound = async (req, res) => {
    try {
      const sound = await Sound.find({})
       
  
      if (!sound) {
        return res
          .status(404)
          .send({ status: "Failed", message: "Video Not Found" });
      }
      res.status(200).send({
        status: "success",
        message: "sound fetched",
        data: sound,
      });
  
    } catch (error) {
      console.log(error);
      res.status(500).send({ status: "failed", message: error });
    }
  };
