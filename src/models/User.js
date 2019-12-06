'use-strict'

const mongoose    = require("mongoose");
const bcrypt      = require('bcrypt');
const passportLocalMongoose   = require("passport-local-mongoose");

mongoose.promise  = require('bluebird');

const mailer      = require("../services/mailer");

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
    secondaryEmail  : {
                    type: String
                  },
    userType    : {
                    type: String,
                    enum: [UserType.ADMIN, UserType.TEACHER, UserType.FAMILY],
                    required: true
                   },
    requiredVolunteerTime: {
      type: Number
    },
    requiredPtaVolunteerTime: {
      type: Number
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

/*
* Hooks
*/
// // Remove all projects by this author
// userSchema.pre('remove', function(next) {
//
//   if (this.isFamily()) {
//     // remove user from assigned tasks
//     Task.find({'assignedTo.id': this._id}, (err, tasks) => {
//       if (err) {
//         next(err);
//         return;
//       }
//       if (tasks) {
//         tasks.forEach( (task) => {
//
//           task.removeAssignee( (err) => {
//             next(err);
//             return;
//           });
//         });
//       }
//       next();
//     });
//   } else {
//
//     // // Delete all created Tasks
//     // Task.find().remove({'author.id': this._id}, (err) => {
//     //   if (err) {
//     //     return next(err);
//     //   }
//     // });
//     //
//     // // Delete all created projects
//     // this.model('Project').remove({'author.id': this._id}, next);
//
//     // TODO Archive project
//   }
// });

/*
* Methods
*/
userSchema.methods.isAdmin = function ( ) {
  return (this.userType === UserType.ADMIN) ? true : false;
};

userSchema.methods.isTeacher = function ( ) {
  return (this.userType === UserType.TEACHER) ? true : false;
};

userSchema.methods.isFamily = function ( ) {
  return (this.userType === UserType.FAMILY) ? true : false;
};

userSchema.plugin(passportLocalMongoose);


/**
 * Password hashing
 */
// userSchema.pre("save", function(next) {
// 	let user = this;
//   const SALT_ROUNDS = 12;
//
// 	bcrypt.genSalt(SALT_ROUNDS, function(err, salt) {
// 		bcrypt.hashSync(user.password, salt, null, function(err, hash) {
//
// 			user.password = hash;
// 			next();
//     });
// 	});
// });

/**
 * Password compare
 */
userSchema.methods.comparePassword = function(password, cb) {
	bcrypt.compare(password, this.password, function(err, isMatch) {
		cb(err, isMatch);
	});
};

userSchema.methods.newUserNotification = (email, secondaryEmail, username, password, appurl) => {

  let recipients = (secondaryEmail)? (email + ',' + secondaryEmail) : email;

  mailer.sendAccountNotification(recipients, username, password, appurl);
}

userSchema.methods.passwordResetNotification = (email, secondaryEmail, username, password, appurl) => {

  let recipients = (secondaryEmail)? (email + ',' + secondaryEmail) : email;

  mailer.sendPasswordResetNotification(recipients, username, password, appurl);
}

module.exports = mongoose.model("User", userSchema);
