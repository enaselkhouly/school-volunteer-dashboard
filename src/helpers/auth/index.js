'use-strict'
const Project = require('../../models/Project');
const Task = require('../../models/Task');

function isLoggedInLocal (req, res) {
  let status = true;

  // Check if user is authonticated
  if(!req.isAuthenticated()){

    status = false;

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

    Project.findById(req.params.id, (err, project) => {
      if (err) {
        req.flash("error", err.msg);
        res.redirect("/projects");
        return;
      }

      if ( req.user && (req.user.isAdmin() || project.author.id.equals(req.user._id)) ){
        next();
      } else {
        req.flash("error", "You don't have permission!");
        res.redirect("/projects");
      }
    });
  } // if: isLoggedIn
} // isAdminOrProjectOwner


/* Check if User type is admin, or owner (author) of the
   project of this task.

   In case of add new task (get/post), the project is provided as query.
   */
function isAdminOrTaskProjectOwner (req, res, next) {

  if (isLoggedInLocal(req, res)) {

    Project.findById(req.query.project, (err, project) => {
      if (err) {
        req.flash("error", err.msg);
        res.redirect("/projects");
        return;
      }

      if ( req.user && (req.user.isAdmin() || project.author.id.equals(req.user._id)) ){
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

    Task.findById(req.params.id, (err, task) => {
      if (err) {
        req.flash("error", err.msg);
        res.redirect("/projects");
        return;
      }

      if ( req.user && (req.user.isAdmin() || task.author.id.equals(req.user._id)) ){
        next();
      } else {
        req.flash("error", "You don't have permission!");
        res.redirect("/projects");
      }
    });
  } // if: isLoggedIn
} // isAdminOrTaskOwner

module.exports = {
  isLoggedIn                : isLoggedIn,
  isAdmin                   : isAdmin,
  isTeacher                 : isTeacher,
  isFamily                  : isFamily,
  isAdminOrTeacher          : isAdminOrTeacher,
  isAdminOrTaskOwner        : isAdminOrTaskOwner,
  isAdminOrProjectOwner     : isAdminOrProjectOwner,
  isAdminOrTaskProjectOwner : isAdminOrTaskProjectOwner
}