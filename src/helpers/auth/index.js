'use-strict'
const Project = require('../../models/Project');
const Task = require('../../models/Task');

function isLoggedInLocal (req, res) {
  let status = true;

  // Check if user is authonticated
  if(!req.isAuthenticated()){

    status = false;
    req.session.redirectTo = req.path;
    req.flash("error", "You need to be logged in!");
    res.redirect("/login");
  }
  return status;
}

/**
 * Login Required middleware.
 */
function isLoggedIn (req, res, next) {

  if (isLoggedInLocal(req, res)) {
      return next();
  }
} //isLoggedIn

function isAdmin (req, res, next) {

  if (isLoggedInLocal(req, res)) {

    let user = req.user;
    if (user && user.isAdmin()) {
      next();
    } else {
      req.flash("error", "You don't have permission!");
      res.redirect("back");
    }

  } // if: isLoggedIn
}// isAdmin

function isTeacher (req, res, next) {
  if (isLoggedInLocal(req, res)) {

    let user = req.user;
    if (user && user.isTeacher()) {
      next();
    } else {
      req.flash("error", "You don't have permission!");
      res.redirect("back");
    }

  } // if: isLoggedIn
} // isTeacher

function isFamily (req, res, next) {
  if (isLoggedInLocal(req, res)) {

    let user = req.user;
    if (user && user.isFamily()) {
      next();
    } else {
      req.flash("error", "You don't have permission!");
      res.redirect("back");
    }

  } // if: isLoggedIn
}// isFamily


function isAdminOrTeacher (req, res, next) {
  if (isLoggedInLocal(req, res)) {

    let user = req.user;
    if (user && (user.isAdmin() || user.isTeacher()) ) {
      next();
    } else {
      req.flash("error", "You don't have permission!");
      res.redirect("back");
    }
  } // if: isLoggedIn
} // isAdminOrTeacher

function isAdminOrProjectOwner (req, res, next) {
  if (isLoggedInLocal(req, res)) {

    // Check if the objectID is valid
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Project not found! Make sure you are using the right path!");
      res.redirect("/projects");
      return;
    }

    Project.findById(req.params.id, (err, project) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("/projects");
        return;
      }

      if (!project) {
        req.flash("error", "Project not found or deleted!");
        res.redirect("/projects");
        return;
      }

      if ( req.user && (req.user.isAdmin() || (project.author && project.author.id && project.author.id.equals(req.user._id))) ){
        next();
      } else {
        req.flash("error", "You don't have permission!");
        res.redirect("/projects");
      }
    });
  } // if: isLoggedIn
} // isAdminOrProjectOwner

function isAdminOrTaskOwner (req, res, next) {
  if (isLoggedInLocal(req, res)) {


    // Check if the objectID is valid
    if (!req.params.task_id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Task not found! Make sure you are using the right path!");
      res.redirect("/projects");
      return;
    }

    Task.findById(req.params.task_id, (err, task) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("/projects");
        return;
      }

      if (!task) {
        req.flash("error", "Task not found or deleted!");
        res.redirect("/projects");
        return;
      }

      if ( req.user && (req.user.isAdmin() || (task.author && task.author.id && task.author.id.equals(req.user._id))) ){
        next();
      } else {
        req.flash("error", "You don't have permission!");
        res.redirect("/projects");
      }
    });
  } // if: isLoggedIn
} // isAdminOrTaskOwner

function isProjectOwner (req, res, next) {
  if (isLoggedInLocal(req, res)) {

    // Check if the objectID is valid
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Project not found! Make sure you are using the right path!");
      res.redirect("/projects");
      return;
    }

    Project.findById(req.params.id, (err, project) => {

      if (err) {
        req.flash("error", err.message);
        res.redirect("/projects");
        return;
      }

      if (!project) {
        req.flash("error", "Project not found or deleted!");
        res.redirect("/projects");
        return;
      }

      if ( project.author && project.author.id && project.author.id.equals(req.user._id)){
        next();
      } else {
        req.flash("error", "You don't have permission!");
        res.redirect("/projects");
      }
    });
  } // if: isLoggedIn
} // isProjectOwner

function isTaskOwner (req, res, next) {
  if (isLoggedInLocal(req, res)) {


    // Check if the objectID is valid
    if (!req.params.task_id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Task not found! Make sure you are using the right path!");
      res.redirect("/projects");
      return;
    }

    Task.findById(req.params.task_id, (err, task) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect("/projects");
        return;
      }

      if (!task) {
        let error = new Error('Task not found or deleted!');
        req.flash("error", error.message);
        res.redirect("/projects");
        return;
      }

      if ( task.author && task.author.id && task.author.id.equals(req.user._id)){
        next();
      } else {
        req.flash("error", "You don't have permission!");
        res.redirect("/projects");
      }
    });
  } // if: isLoggedIn
} // isTaskOwner
//
// import mongoose from 'mongoose';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import { UserSchema } from '../models/userModel';
//
// const User = mongoose.model('User', UserSchema);
//
//
// export const login = (req, res) => {
//    User.findOne({
//        email: req.body.email
//    }, (err, user) => {
//        if (err) throw err;
//        if (!user) {
//            res.status(401).json({ message: 'Authentication failed. No user found!'});
//        } else if (user) {
//            if (!user.comparePassword(req.body.password, user.hashPassword)) {
//                 res.status(401).json({ message: 'Authentication failed. Wrong password!'});
//        } else {
//            return res.json({token: jwt.sign({ email: user.email, username: user.username, _id: user.id}, 'RESTFULAPIs')});
//        }
//     }
//    });
// }
//
// export const loginRequired = (req, res, next) => {
//     if (req.user) {
//         next();
//     } else {
//         return res.status(401).json({ message: 'Unauthorized user!'});
//     }
// }

module.exports = {
  isLoggedIn                : isLoggedIn,
  isAdmin                   : isAdmin,
  isTeacher                 : isTeacher,
  isFamily                  : isFamily,
  isAdminOrTeacher          : isAdminOrTeacher,
  isAdminOrTaskOwner        : isAdminOrTaskOwner,
  isAdminOrProjectOwner     : isAdminOrProjectOwner,
  isTaskOwner               : isTaskOwner,
  isProjectOwner            : isProjectOwner

}
