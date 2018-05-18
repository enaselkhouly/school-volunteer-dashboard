'use strict';

const User = require('../models/User'),
      Task = require('../models/Task'),
      Project = require('../models/Project'),
      passport = require('passport'),
      helpers = require("../helpers");

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

  var newUser = new User(req.body.user);

  User.register(newUser, req.body.password, (err, user) => {
      if(err){
        req.flash("error", err.message);
        res.redirect("/register");
        return;
      }

      res.redirect(`/users`);

  });
} // postRegister

/* User login form. */
function getLogin (req, res, next){

  res.render('user/login', {
              title: 'Login'
            });
} // getLogin

/* User login.*/
function postLogin (req, res, next) {

  passport.authenticate('local', function(err, user, info) {

    if (err) {
      return next(err);
    }
    if (!user) {
      return res.redirect('/login');
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err);
      }
      return res.redirect('/users/' + user._id);
    });
  })(req, res, next); // passport.authenticate
} // postLogin

/* User logout. */
function getLogout (req, res){

  req.logout();
  req.flash("success", "Successfuly logged out!");
  res.redirect("/");

} // getLogout

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

  helpers.getUserProjects( req.user, (err, projects) => {
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
        page: 'show'
      });
    }
  });

} // getUser

/* GET user profile*/
function getUserProfile (req, res) {

  let userDir = req.user.userType.toLowerCase();

  res.render(`user/${userDir}`, {
              user: req.user,
              title: 'Profile',
              page: 'profile'
            });
}

/* Show form to update user */
function getEditUser (req, res) {

  let userDir = req.user.userType.toLowerCase();

  res.render( `user/${userDir}`, {
              title: 'Edit User',
              user: req.user,
              page: "user/edit"
            });
} // getEditUser

/* Update user */
function putUser (req, res){
  let user = req.body.user;

  User.findByIdAndUpdate(req.params.id, user, (err, updatedUser) => {

      if(err){
         req.flash("error", err.message);
         res.redirect("/users");
      } else {
        res.redirect(`/users/${updatedUser._id}`);
      }
  });
} // putUser

/* Delete user */
function deleteUser (req, res) {

  User.findByIdAndRemove(req.params.id, function(err){

    if(err){
       req.flash("error", err.message);
       res.redirect("/users");
    } else {
        req.flash("success", "Successfully deleted the User!");
        res.redirect("/users");
    }
  });
} // deleteUser

module.exports = {
  getRegister     : getRegister,
  postRegister    : postRegister,
  getLogin        : getLogin,
  postLogin       : postLogin,
  getLogout       : getLogout,
  getUsers        : getUsers,
  getUser         : getUser,
  getUserProfile  : getUserProfile,
  getEditUser     : getEditUser,
  putUser         : putUser,
  deleteUser      : deleteUser
};
