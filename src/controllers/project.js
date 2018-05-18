'use strict';

const User = require('../models/User'),
      Task = require('../models/Task'),
      Project = require('../models/Project'),
      helpers = require("../helpers");

/* Show all projects */
function getProjects (req, res) {

  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  let status = helpers.statusQuery(req.query.status);
  let category = helpers.categoryQuery(req.query.category);

  helpers.allProjects(function(err, allProjects){

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
      res.redirect(`/projects`);
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

  helpers.createProject( newProject, (err, project) => {

    // Error in creating project
    if(err){
      req.flash("error", err.message);
      res.redirect(`/projects`);
    } else {

      helpers.addProjectToUser(req.user, project, (err, user) => {
        // Error in updating user
        if(err){
          req.flash("error", err.message);
          return res.redirect(`/projects/new`);
        }

        // New project created Successfully
        req.flash("success", "Successfully created a new Project!");
        res.redirect(`/projects`);
      });

    }

  });

} // postNewProject

function getEditProject (req, res) {

  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  res.render(`user/${userDir}`, {
    page: 'project/edit'
  });
} // getEditProject

function postEditProject (req, res) {
  // todo
  res.redirect('projects');
} // postEditProject

function deleteProject (req, res) {

  // Find the project to be deleted
  Project.findById (req.params.id, (err, project) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect(`/projects`);
      return;
    }

    // remove Project from Author user
    helpers.removeProjectAuthor (project.author.id, project._id, function (err) {
      if (err) {
        req.flash("error", err.message);
        res.redirect(`/projects`);
        return;
      }

      // remove project tasks
      helpers.removeAllTasksFromProject (project._id, function (err) {
        if (err) {
          req.flash("error", err.message);
          res.redirect(`/projects`);
          return;
        }

        // Delete project
        project.remove(project._id, function (err) {
          if (err) {
            req.flash("error", err.message);
            res.redirect(`/projects`);
          } else {
            req.flash("success", "Successfully deleted the Project!");
            res.redirect("/projects");
          }
        });
      });
      });
    });

} // deleteProject

module.exports = {
  getProjects      : getProjects,
  getProject       : getProject,
  getNewProject    : getNewProject,
  postNewProject   : postNewProject,
  getEditProject   : getEditProject,
  postEditProject  : postEditProject,
  deleteProject    : deleteProject
};
