const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const ObjectId = require('mongodb').ObjectId;

exports.follow = async (req, res) => {

    try {
        const user = await User.findOne({ _id: req.params.follower })

        const index_of_like = user.following.indexOf(ObjectId(req.params.followed));
        const already_liked_by_me = index_of_like !== -1;

        if(already_liked_by_me){
            await User.findOneAndUpdate(
                {
                    _id: ObjectId(req.params.followed)
                },
                {
                    $pull: { followed_by: req.params.follower }
                },
                {
                    new: true
                });
        
            await User.findOneAndUpdate(
                    {
                        _id: ObjectId(req.params.follower)
                    },
                    {
                        $pull: { following: req.params.followed }
                    },
                    {
                        new: true
                    });
            
              res.status(200).send({ success: true , message: "unfollowed successfully", follow: 0});
        }

        else{
    await User.findOneAndUpdate(
        {
            _id: ObjectId(req.params.followed)
        },
        {
            $push: { followed_by: req.params.follower }
        },
        {
            new: true
        });

    await User.findOneAndUpdate(
            {
                _id: ObjectId(req.params.follower)
            },
            {
                $push: { following: req.params.followed }
            },
            {
                new: true
            });
    
      res.status(200).send({ success: true , message: "followed successfully", follow: 1});
    } 
}
    catch (err) {
     res.status(401).send({ success: false , message:"could not process"});
    }
}