'use strict';

const User = require('../models/User'),
      Task = require('../models/Task'),
      Project = require('../models/Project'),
      helpers = require("../helpers"),
      async  = require("async");

/* Show all projects */
function getProjects (req, res) {

  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  let status = helpers.statusQuery(req.query.status);
  let category = helpers.categoryQuery(req.query.category);

  if (req.user.isFamily()) {
    status = 'Open';
  }

  helpers.allProjects(req.user, status, category, (err, allProjects) => {

    if(err){
      req.flash("error", err.message);
      res.redirect(`/`);
    } else {
      res.render(`user/${userDir}`, {
        user: user,
        projects: allProjects,
        status: status,
        category: category,
        page: 'project/index'
      });
    }
  });
} //getProjects

/* Show all projects */
function getProject (req, res) {
  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  helpers.getProject(req.params.id, function (err, project) {

    if(err){
      req.flash("error", err.message);
      res.redirect(`back`);
    } else {
      res.render(`user/${userDir}`, {
        user: user,
        project: project,
        page: 'project/show'
      });
    }
  });
} //getProject

function getNewProject (req, res) {
  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  res.render(`user/${userDir}`, {
    page :'project/new'
  });
} // getNewProject

function postNewProject (req, res) {

  // Read new project information
  let newProject = new Project (req.body.project);

  newProject.author = {
    id : req.user._id,
    displayName: req.user.displayName
  };

  async.waterfall([
      function createProject (callback) {
        helpers.createProject( newProject, (err, project) => {
          if (err) {
            return callback(err);
          }
          return callback(null, project);
        });
      },
      function addProjectToUser(project, callback) {
        helpers.addProjectToUser(req.user, project._id, (err, user) => {
          if (err) {
            return callback(err);
          }
          return callback(null);
        });
      }
  ], function (err) {
    // Error in updating user
    if(err){
      req.flash("error", err.message);
      return res.redirect(`/projects/new`);
    }
    // New project created Successfully
    req.flash("success", "Successfully created a new Project!");
    res.redirect(`/users/${req.user._id}`);
  });
} // postNewProject

function getEditProject (req, res) {

  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  Project.findById(req.params.id, (err, project) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect("back");
    } else {
      res.render(`user/${userDir}`, {
        project: project,
        page: 'project/edit'
      });
    }
  });
} // getEditProject

function putProject (req, res) {

  Project.findByIdAndUpdate(req.params.id, req.body.project, (err, project) => {

      if(err){
         req.flash("error", err.message);
      } else {
         req.flash("success", 'The project is successfully edited!');
      }

      res.redirect(`/users/${req.user._id}`);

  });
} // postEditProject

function deleteProject (req, res) {

  async.waterfall([
      function findProject (callback) {
        Project.findById (req.params.id, (err, project) => {
          if (err) {
            return callback(err);
          }

          return callback(null, project);
        });
      },
      function removeProjectFromUser(project, callback) {
        // remove Project from Author user
        helpers.removeProjectFromUser (project.author.id, project._id, function (err) {
          if (err) { return callback(err) }

           return callback(null, project);
        });
      },
      function removeAllProjectTasks (project, callback) {
        // remove project tasks
        helpers.removeAllProjectTasks (project, function (err) {
          if (err) { return callback(err) }

          return callback(null, project);
        });
      },
      function removeProject (project, callback){
        //Delete project
        project.remove(project._id, function (err) {
          if (err) { return callback(err) }

          return callback(null);
        });
      }
  ], function (err) {
    if (err) {
      req.flash("error", err.message);
      res.redirect(`/users/${req.user._id}`);
    } else {
      req.flash("success", "Successfully deleted the Project!");
      res.redirect(`/users/${req.user._id}`);
    }
  });
} // deleteProject

module.exports = {
  getProjects      : getProjects,
  getProject       : getProject,
  getNewProject    : getNewProject,
  postNewProject   : postNewProject,
  getEditProject   : getEditProject,
  putProject       : putProject,
  deleteProject    : deleteProject
};
