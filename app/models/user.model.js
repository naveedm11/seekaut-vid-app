const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    firstName: {type: String, required : true},
    lastName: {type: String, required : true},
    fullName:{type: String},
    email: {type: String, required : true},
    phone: {type: String, required : true},
    gender: {type: String, required : true},
    dob: {type: String, required : true},
    bio: {type: String, required : true},
    nationality: {type: String, required : true},
    profilePic: {type: String},
    username:{type: String, required : true},
    password: {type: String, required : true},
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