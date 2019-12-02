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
      res.redirect("/projects");
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
      res.redirect("/projects");
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
      res.redirect("/projects");
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

function isTaskAssignee (req, res, next) {
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

      if ( task.assignedTo && task.assignedTo.id && task.assignedTo.id.equals(req.user._id)){
        next();
      } else {
        req.flash("error", "You don't have permission!");
        res.redirect("/projects");
      }
    });
  } // if: isLoggedIn
} //  isTaskAssignee


function isTaskEditAllowed (req, res, next) {
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

      // 3. Complete
      if (req.query.Complete) {
        if ( task.assignedTo && task.assignedTo.id && task.assignedTo.id.equals(req.user._id)){
          next();
        } else {
          req.flash("error", "You don't have permission!");
          res.redirect("/projects");
        }
      }
      // 2. Aprrove OR 3. Edit
      else if ( task.author && task.author.id && task.author.id.equals(req.user._id)){
        next();
      } else {
        req.flash("error", "You don't have permission!");
        res.redirect("/projects");
      }
    });
  } // if: isLoggedIn
} // isTaskEditAllowed


module.exports = {
  isLoggedIn                : isLoggedIn,
  isAdmin                   : isAdmin,
  isTeacher                 : isTeacher,
  isFamily                  : isFamily,
  isAdminOrTeacher          : isAdminOrTeacher,
  isAdminOrTaskOwner        : isAdminOrTaskOwner,
  isAdminOrProjectOwner     : isAdminOrProjectOwner,
  isTaskOwner               : isTaskOwner,
  isProjectOwner            : isProjectOwner,
  isTaskAssignee            : isTaskAssignee,
  isTaskEditAllowed         : isTaskEditAllowed

}
