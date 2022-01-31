const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserVideo = mongoose.model(
  "UserVideo",
  new Schema({
    videoUrl: String,
    videoName: String,
    description: String,
    soundId: { type: Schema.Types.ObjectId, ref: 'Sound' },
    tags: {type: Array},
    is_active: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    count: { type: Schema.Types.ObjectId, ref: 'VideoCount' },
    status : { type : String}
  })
);

module.exports = UserVideo;