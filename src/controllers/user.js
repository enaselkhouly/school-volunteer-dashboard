'use strict';

const User        = require('../models/User'),
      passport    = require('passport'),
      helpers     = require("../helpers"),
      async       = require("async"),
      crypto      = require("crypto"),
      mailer      = require("../services/mailer"),
      config      = require("../../configs");

/* Show the registeration form for new User.*/
function getRegister ( req, res) {

  let userDir = req.user.userType.toLowerCase();

  res.render(`user/${userDir}`, {
            title: 'Register',
            currentUser: req.user,
            page: "register"
          });

} // getRegister

/* Register new User.*/
function postRegister (req, res) {

  let newUser = new User(req.body.user);

  // newUser.requiredVolunteerTime *= 60; // Convert from hrs to mins
  // newUser.requiredPtaVolunteerTime *= 60; // Convert from hrs to mins

  User.register(newUser, req.body.password, (err, user) => {
    if(err){
      req.flash("error", err.message);
      res.redirect("/register");
      return;
    }
    // send email notification to the added user
   user.newUserNotification(user.email, user.secondaryEmail, user.username, req.body.password, config.app.url);
   req.flash("success", "New user is created successfully!");
   res.redirect(`/users`);

  });

} // postRegister

/* User login form. */
function getLogin (req, res){
  if (!req.user) {
    res.render('user/login', {
                title: 'Login'
              });
  } else {
    return res.redirect(`/users/${req.user._id}`);
  }
} // getLogin

/* User login.*/
function postLogin (req, res, next) {
  passport.authenticate('local', function(err, user) {

    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("error", "No user with those credentials is found!");
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      let redirectTo = (req.session.redirectTo)? req.session.redirectTo : `/users/${user._id}`;
      return res.redirect(redirectTo);
    });
  })(req, res, next); // passport.authenticate
} // postLogin

/* User logout. */
function getLogout (req, res){

  req.logout();
  // req.flash("success", "Successfuly logged out!");
  req.session.destroy();
  res.redirect("/login");

} // getLogout

/* User forgot password form. */
function getForgot (req, res){

  res.render('user/forgot', {
              title: 'forgot'
            });
} // getForgot

/* User forgot password. */
function postForgot (req, res){

  async.waterfall([
    function generateToken (callback) {
      crypto.randomBytes(20, function(err, buf) {
        if (err) {
          return callback (err);
        } else {
          let token = buf.toString('hex');
          callback(null, token);
        }
      });
    },
    function findUser (token, callback) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          return callback(new Error('No account with that email address exists.'));
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          if (err) {
            return callback(err);
          }
          callback(null, token, user);
        });
      });
    },
    function sendResetEmailToUser(token, user, callback) {

        let subject = `✔ Reset your password on ${config.app.title}`;

        res.render("mail/passwordReset", {
					name: user.fullName,
					resetLink: "http://" + req.headers.host + "/reset/" + token
				}, function(err, html) {

					if (err) {
            return callback(err);
          }

					mailer.send(user.email, subject, html, function(err) {

            if (err) {
              callback(err);
            } else {

              // Preview only available when sending through an Ethereal account
              //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

              callback(null);
            }
					});
				});
			}
  ], function(err) {
    if (err) {
      req.flash('error', err.message);
      res.redirect('/forgot');
    } else {
      req.flash('success', "An email has been sent to you with further instructions.");
      res.redirect('/login');
    }

  });
} // postForgot

/* User reset password form. */
function getReset (req, res){

User.findById(req.params.id, (err, user) => {
  if (err || !user) {
    req.flash('error', 'User is not found!');
    res.redirect('back');
  } else if (!req.user.isAdmin()) {
    req.flash('error', 'You don\'t have credentials to reset a password');
    res.redirect('back');
  } else {
    res.render('user/admin', {
              title: 'reset',
              page: 'reset',
              user: user
            });
  }
});

} // getReset


function postReset (req, res) {

async.waterfall([
  function checkCredentialls (callback) {
    // Make sure the request is from Admin user
    if (!req.user.isAdmin()) {
      return callback(new Error("Invalid credentials, you must be admin to request a reset"));
    }
    // Compare the admin password with the saved password
    req.user.authenticate(req.body.adminPassword, (err, result) => {

      if (err) {
        return callback(err);
      }

      if (result === false) {
        return callback(new Error("Wrong Admin password!"));
      }

      return callback(null);
    });
  },
  function findUser(callback){

    //find the user
    User.findById(req.params.id, function (err, user) {
      if (err || ! user){
        const error = new Error('User is not found');
        return callback(error);
      }

      return callback(null, user);
    });
  },
  function resetPassword(user, callback){
    user.setPassword(req.body.newUserPassword, function (err) {
        if (err){
          return callback(err);
        }
        user.save( (err) => {
          if (err){
            return callback(err);
          }
          return callback(null, user);
        });

      });
  }], function(err, user) {
    if (err) {
      req.flash('error', err.message);
      res.redirect(`back`);
    } else {
      // send password reset notification to primary email
     user.passwordResetNotification(user.email, user.secondaryEmail, user.username, req.body.newUserPassword, config.app.url);

      req.flash('success', 'Password is successfully reset!');
      res.redirect(`/users`);
    }
  });
} // postReset

/* User change password form. */
function getChangePassword (req, res){

  let userDir = req.user.userType.toLowerCase();

  res.render(`user/${userDir}`, {
          title: 'change password',
          page: 'changepassword',
          user: req.user
        });

} // getChangePassword

/* Post Password Change*/
function postChangePassword (req, res) {

  async.waterfall([
    function checkCredentialls (callback) {
      // Make sure the request is from the same user
      if (req.user._id.toString() !== req.params.id.toString()) {
        return callback(new Error("Invalid credentials, you can't change someone else's password"));
      }
      // Compare the old password with the saved password
      req.user.authenticate(req.body.oldPassword, (err, result) => {

        if (err) {
          return callback(err);
        }

        if (result === false) {
          return callback(new Error("Current password doesn't match database!"));
        }

        return callback(null);
      });
    },
    function compareTwoPasswords (callback) {
      if (req.body.newPassword !== req.body.reNewPassword) {
        return callback(new Error("Password and re-entered password don't match"));
      }
      return callback(null);
    },
    function findUser(callback){

      //find the user
      User.findById(req.params.id, function (err, user) {
        if (err || ! user){
          const error = new Error('User is not found');
          return callback(error);
        }

        return callback(null, user);
      });
    },
    function changePassword(user, callback){

      user.setPassword(req.body.newPassword, function (err) {
          if (err){
            return callback(err);
          }
          user.save( (err) => {
            return callback(err);
          });
        });
  }], function(err) {
    if (err) {
      req.flash('error', err.message);
      res.redirect(`back`);
    } else {

      req.flash('success', 'Password is successfully changed!');
      res.redirect(`/users/${req.user._id}/profile`);
    }
  });
} // postChangePassword


/* Get all users */
function getUsers (req, res){

  let user = req.user;

  helpers.allUsers(function(err, allUsers){

    if(err){
      req.flash("error", err.message);
      res.redirect(`/`);
    } else {

      let userDir = user.userType.toLowerCase();

      res.render(`user/${userDir}`, {
                users: allUsers,
                currentUser: user,
                page: "index"
              });
    }
  });
} // getUsers

/* GET show user.*/
function getUser (req, res) {

  let status = helpers.statusQuery(req.query.status);
  let category = helpers.categoryQuery(req.query.category);
  let pta = helpers.ptaQuery(req.query.pta);

  let isFiltered = false;

  if (helpers.isFilterByStatus(status) ||
      helpers.isFilterByCategory(category) ||
      helpers.isFilterByPTA(pta)) {
        isFiltered = true;
      }

  helpers.getUserProjects( req.user, status, category, pta, (err, projects) => {
    if(err){
      req.flash("error", err.message);
      res.redirect(`/`);
    } else {
      let userDir = req.user.userType.toLowerCase();

      res.render(`user/${userDir}`, {
        user: req.user,
        projects: projects,
        status: status,
        category: category,
        pta: pta,
        isFiltered: isFiltered,
        page: 'show'
      });
    }
  });

} // getUser

/* GET user profile*/
function getUserProfile (req, res) {

  let userDir = req.user.userType.toLowerCase();

  async.waterfall([
    function getUser (callback) {
      User.findById(req.params.id, (err, user) => {
        if (err || !user) {
          const error = new Error ('User is not found');
          return callback(error);
        }

        callback(null, user);
      });
    },
    function getVolunteerTime (user, callback) {
      helpers.getVolunteerTime(user, false/*isPTA*/, (err, volunteerTime) => {
        if (err) {
          return callback(err);
        }

        callback(null, user, volunteerTime);
      });
    },
    function getPtaVolunteerTime (user, volunteerTime, callback) {
      helpers.getVolunteerTime(user, true/*isPTA*/, (err, ptaVolunteerTime) => {
        if (err) {
          return callback(err);
        }

        callback(null, user, volunteerTime, ptaVolunteerTime);
      });
    }
  ], function (err, user, volunteerTime, ptaVolunteerTime) {
    if (err) {
      req.flash("error", err.message);
      res.redirect(`/users/${req.params.id}`);
    } else {
      res.render(`user/${userDir}`, {
                  user: user,
                  volunteerTime: volunteerTime,
                  ptaVolunteerTime: ptaVolunteerTime,
                  title: 'Profile',
                  page: 'profile'
                });
    }
  }
  );
}

/* Show form to update user */
function getEditUser (req, res) {

  let userDir = req.user.userType.toLowerCase();

  User.findById(req.params.id, (err, user) => {

    if(err || !user){
       req.flash("error", "User is not found");
       res.redirect("/users");
    } else {
      res.render( `user/${userDir}`, {
                  title: 'Edit User',
                  user: user,
                  page: "edit"
                });
    }
  });
} // getEditUser

/* Update user */
function putUser (req, res){
  let user = req.body.user;

  // user.requiredVolunteerTime *= 60; // Convert from hrs to mins
  // user.requiredPtaVolunteerTime *= 60; // Convert from hrs to mins

  User.findByIdAndUpdate(req.params.id, user, {multi: true}, (err, user) => {

      if (!user) {
        req.flash("error", "User is not found");
      }
      else if(err || !user){
         req.flash("error", err.message);
      } else {
         req.flash("success", "User is edited successfully!");
      }

      res.redirect(`/users`);
  });
} // putUser

/* Delete user */
function deleteUser (req, res) {

  if (req.user._id.equals(req.params.id)){
      let error = new Error("You can not delete your own account!");
      req.flash("error", error.message);
      res.redirect("/users");
   }

   req.flash("error", (new Error("User delete is not currently supported!")).message);
   res.redirect("/users");

   // else {
   //   //TODO do not remove if a teacher or admin with projects with closed tasks
   //   User.findByIdAndRemove(req.params.id, function(err, user){
   //
   //     if(err){
   //        req.flash("error", err.message);
   //        res.redirect("/users");
   //     } else {
   //
   //        // Call the remove hooks
   //        user.remove();
   //
   //         req.flash("success", "Successfully deleted the User!");
   //         res.redirect("/users");
   //     }
   //   });
   // }
} // deleteUser

// Get Users Report
function getUsersReport (req, res) {

  helpers.allUsersReport(function(err, users){

    if(err){
      req.flash("error", err.message);
      res.redirect(`/users/${req.params.id}`);
    } else {

      res.render(`user/admin`, {
          users: users,
          title: 'Users Report',
          page: "report"
        });
    }
  });
}

module.exports = {
  getRegister       : getRegister,
  postRegister      : postRegister,
  getLogin          : getLogin,
  postLogin         : postLogin,
  getLogout         : getLogout,
  getForgot         : getForgot,
  postForgot        : postForgot,
  getReset          : getReset,
  postReset         : postReset,
  getChangePassword : getChangePassword,
  postChangePassword : postChangePassword,
  getUsers          : getUsers,
  getUser           : getUser,
  getUserProfile    : getUserProfile,
  getEditUser       : getEditUser,
  putUser           : putUser,
  deleteUser        : deleteUser,
  getUsersReport    : getUsersReport
};
