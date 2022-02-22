const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserVideo = mongoose.model(
  "UserVideo",
  new Schema({
    videoUrl: String,
    videoName: String,
    thumbnailUrl : String,
    allow_comments: { type: Boolean, default: false },
    description: String,
    location: String,
    soundId: { type: Schema.Types.ObjectId, ref: 'Sound' },
    is_active: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    count: { type: Schema.Types.ObjectId, ref: 'VideoCount' },
    status : { type : String},
    category: { type: Schema.Types.ObjectId, ref: 'categories' },
    tags : [],
  })
);

module.exports = UserVideo;