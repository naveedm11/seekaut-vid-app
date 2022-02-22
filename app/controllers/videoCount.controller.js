const VideoCount = require("../models/videoCount.model");
const UserVideo = require("../models/uservideo.model");
const User = require("../models/user.model")
const ObjectId = require('mongodb').ObjectId;

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
        videoCount.likesCount--;
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

        res.status(400).send({ success: true , message: "unliked successfully"});
    }

    else{

        videoCount.likesCount++;
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

      res.status(400).send({ success: true , message: "liked successfully"});
  }
}

exports.comment = async(req, res) => {
    try {
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

        videoCount.commentCount++;
        videoCount.comments.push({ user, comment })
        await videoCount.save()
        await UserVideo.findOneAndUpdate({ _id: ObjectId(video_id)}, 
        {$set: {"videodetail": videoCount._id}} , {new : true});

        res.status(201).send({ success: true })
    } 
    catch (error) {
        console.log(error);
        res.status(500).send({ error })
    }
}