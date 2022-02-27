const VideoCount = require("../models/videoCount.model");
const UserVideo = require("../models/uservideo.model");
const User = require("../models/user.model")
const ObjectId = require('mongodb').ObjectId;

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

const mediaParams = {
  Bucket: BUCKET_NAME,
  Key: "", // pass key
  Body: null, // pass file body
};

const fetchParams = {
  Bucket: BUCKET_NAME,
  Key: "", //pass key
};

exports.like = async(req, res) => {
    video_id = req.params.vid_id
    if (!video_id) {
        res.status(400).send({ success: false, message: "please provide the video id" })
    }
    const videoCount = await VideoCount.findOne({ video: video_id })
    if (!videoCount) {
        res.status(404).send({ success: false, message: 'Video Not Found' })
    }
    
    let user_id = req.params.user_id;
    if (!user_id) {
        res.status(400).send({ success: false , message: "please provide the user id" })
    }

    const user = await User.findById(user_id)
    if (!user) {
        res.status(404).send({ success: false , message: 'User with the given id  Not Found' })
    }

    const index_of_like = videoCount.likedBy.indexOf(String(user_id));
    const already_liked_by_me = index_of_like !== -1;

    if(already_liked_by_me){

        await VideoCount.findOneAndUpdate(
            {
                _id: ObjectId(videoCount._id)
            },
            {
                $pull: { likedBy: user_id}
            },
            {
                new: true
            });
       
            videoCount.likesCount = videoCount.likesCount--;
            await videoCount.save();

        res.status(400).send({ success: true , message: "unliked successfully"});
    }

    else{

        await VideoCount.findOneAndUpdate(
            {
                _id: ObjectId(videoCount._id)
            },
            {
                $push: { likedBy: user_id}
            },
            {
                new: true
            });

            videoCount.likesCount = videoCount.likesCount++;
           await videoCount.save();

      res.status(400).send({ success: true , message: "liked successfully"});
  }
}

exports.comment = async(req, res) => {

        video_id = req.body.video_id
        if (!video_id) {
            res.status(400).send({ success: false , message: "please provide the video id" })
        }

        let comment = req.body.comment
        if (!comment) {
            res.status(400).send({ success: false , message: "please provide the Comment" })
        }
        let user_id = req.body.user_id;
        if (!user_id) {
            res.status(400).send({ success: false , message: "please provide the user id" })
        }
        const videoCount = await VideoCount.findOne({ video: video_id })
        if (!videoCount) {
            res.status(404).send({ success: false , message: 'Video with the given id Not Found' })
        }
        const user = await User.findById(user_id)
        if (!user) {
            res.status(404).send({ success: false , message: 'User with the given id  Not Found' })
        }

        if (req.file) {
            try {
              let media_params = mediaParams;
        
              const _media = req.file;
        
              media_params.Key = Date.now() + "--" + _media.originalname;
              media_params.Body = _media.buffer;
              
              s3Client.upload(media_params, async (err, data) => {
                if (err) {
                  res.status(500).json({ error: "Error -> " + err });
                }

                let media = data.Location;
      
                videoCount.commentCount++;
                videoCount.comments.push({ user, comment, media })
                await videoCount.save()
                
                 res.status(201).send({ success: true })
              });
    } 
    catch (error) {
        console.log(error);
        res.status(500).send({ error })
    }
}

else {
    let _media = "";
      
    videoCount.commentCount++;
    videoCount.comments.push({ user, comment, _media })
    await videoCount.save()

     res.status(201).send({ success: true })

}
}