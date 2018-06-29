'use-strict'

const mongoose                = require("mongoose"),
      passportLocalMongoose   = require("passport-local-mongoose");

      mongoose.promise        = require('bluebird');

// User Type definition
const UserType = {
  ADMIN: "Admin",
  TEACHER: "Teacher",
  FAMILY: "Family"
}

// User schema definition
let userSchema = new  mongoose.Schema({
    displayName : {
                    type: String,
                    required: true
                  },
    username    : {
                    type: String,
                    unique: true,
                    required: true
                  },
    email       : {
                    type: String,
                    unique: true,
                    required: true
                  },
    userType    : {
                    type: String,
                    enum: [UserType.ADMIN, UserType.TEACHER, UserType.FAMILY],
                    required: true
                   },
    requiredVolunteerTime: {
      type: Number,
      default: 900 //mins
    },
    projects     : [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
      }
    ],
    tasks  : [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task"
      }
    ],
    created: {
                type: Date,
                default: Date.now
            },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.methods.isAdmin = function ( ) {
  let result = false;
  if (this.userType === UserType.ADMIN) {
    result = true;
  }
  return result;
};

userSchema.methods.isTeacher = function ( ) {
  let result = false;
  if (this.userType === UserType.TEACHER) {
    result = true;
  }
  return result;
};

userSchema.methods.isFamily = function ( ) {
  let result = false;
  if (this.userType === UserType.FAMILY) {
    result = true;
  }
  return result;
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
