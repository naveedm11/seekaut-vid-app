const VideoCount = require("../models/videoCount.model");
const User = require("../models/user.model")

exports.like = async(req, res) => {
    video_id = req.params.id
    if (!video_id) {
        res.status(400).send({ status: "failed", message: "please provide the video id" })
    }
    const videoCount = await VideoCount.findOne({ video: video_id })
    if (!videoCount) {
        res.status(404).send({ status: "Failed", message: 'Video Not Found' })
    }
    
    videoCount.likesCount++;
    await videoCount.save()
    res.status(201).send({ status: "success" })
}

exports.comment = async(req, res) => {
    try {
        video_id = req.body.video_id
        if (!video_id) {
            res.status(400).send({ status: "failed", message: "please provide the video id" })
        }

        let comment = req.body.comment
        if (!comment) {
            res.status(400).send({ status: "failed", message: "please provide the Comment" })

        }
        let user_id = req.body.user_id
        if (!user_id) {
            res.status(400).send({ status: "failed", message: "please provide the user id" })

        }
        const videoCount = await VideoCount.findOne({ video: video_id })
        if (!videoCount) {
            res.status(404).send({ status: "Failed", message: 'Video with the given id Not Found' })
        }
        const user = await User.findById(user_id)
        if (!user) {
            res.status(404).send({ status: "Failed", message: 'User with the given id  Not Found' })

        }
        videoCount.commentCount++;
        videoCount.comments.push({ user, comment })
        await videoCount.save()
        res.status(201).send({ status: "success" })

    } catch (error) {
        console.log(error);
        res.status(500).send({ error })
    }


}