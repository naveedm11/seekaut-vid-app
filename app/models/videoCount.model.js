const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VideoCount = mongoose.model(
    "VideoCount",
    new Schema({
        likesCount: { type: Number, default: 0 },
        likedBy: [],
        commentCount: { type: Number, default: 0 },
        comments: [{
            user: { type: Schema.Types.ObjectId, ref: 'User' },
            comment: String,
            media : {type: String, default: ""},
        }],
        is_active: { type: Boolean, default: false },
        is_deleted: { type: Boolean, default: false },
        video: { type: Schema.Types.ObjectId, ref: 'UserVideo' },
    })
);

module.exports = VideoCount;