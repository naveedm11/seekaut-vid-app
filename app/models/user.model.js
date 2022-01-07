const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    fullName:{type: String},
    email: {type: String, required : true, unique: true},
    phone: {type: String},
    gender: {type: String},
    dob: {type: String},
    bio: {type: String},
    nationality: {type: String},
    profilePic: {type: String},
    username:{type: String, required : true},
    password: {type: String},
    is_active:  { type: Boolean, default: false },
    is_verified:  { type: Boolean, default: false },
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