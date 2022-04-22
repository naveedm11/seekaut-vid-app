const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    fullName:{type: String},
    email: {type: String,
      required: true,
      trim: true,
      minlength: 1,
      unique: true,
     },
    public_or_private: Boolean,
    phone: {type: String, unique: true},
    gender: {type: String, default : ""},
    dob: {type: String, default : ""},
    nationality: {type: String, default : ""},
    location: {type: String, default : ""},
    bio : {type: String, default : ""},
    profilePic: {type: String},
    username:{type: String},
    password: { type: String,
      require: true,
      minlength: 5},
    is_active:  { type: Boolean, default: false },
    is_verified:  { type: Boolean, default: false },
    social_links:[],
    followed_by:[],
    followers_count: Number, 
    following_count : Number,
    favourites: [],
    likes_count : Number,
    following: [],
    is_deleted:  { type: Boolean, default: false },
    roles: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Role"
        }
      ]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);