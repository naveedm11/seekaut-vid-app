const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Sound = mongoose.model(
    "Sound",
    new Schema({
        soundUrl:String,

        soundName:  String,
        soundTags: {
            type: Array,
          },
    })
);

module.exports = Sound;