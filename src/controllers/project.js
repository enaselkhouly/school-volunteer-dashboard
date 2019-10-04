'use strict';

const Project = require('../models/Project'),
      helpers = require("../helpers"),
      async  = require("async");

/* Show all projects */
function getProjects (req, res) {

  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  let status = helpers.statusQuery(req.query.status);
  let category = helpers.categoryQuery(req.query.category);
  let pta = helpers.ptaQuery(req.query.pta);
  let isFiltered = false;

  if (helpers.isFilterByStatus(status) ||
      helpers.isFilterByCategory(category) ||
      helpers.isFilterByPTA(pta)) {
        isFiltered = true;
      }

  if (req.user.isFamily()) {
    status = 'Open';
    isFiltered = true;
  }

  helpers.allProjects(req.user, status, category, pta, (err, allProjects) => {

    if(err){
      req.flash("error", err.message);
      res.redirect(`/`);
    } else {
      res.render(`user/${userDir}`, {
        user: user,
        projects: allProjects,
        status: status,
        category: category,
        pta: pta,
        isFiltered: isFiltered,
        page: 'project/index'
      });
    }
  });
} //getProjects

/* Show all projects */
function getProject (req, res) {
  let user = req.user;
  let userDir = req.user.userType.toLowerCase();
  let status = helpers.statusQuery(req.query.status);

  if (req.user.isFamily()) {
    status = 'Open';
  }


  helpers.getProject(req.params.id, status , (err, project) => {

    if(err || !project){
      req.flash("error", "Project is not found");
      res.redirect(`/projects`);
      return;
    } else {
      res.render(`user/${userDir}`, {
        user: user,
        project: project,
        page: 'project/show'
      });
      return;
    }
  });
} //getProject

function getNewProject (req, res) {

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
        helpers.addProjectToUser(req.user, project._id, (err) => {
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

  let userDir = req.user.userType.toLowerCase();

  Project.findById(req.params.id, (err, project) => {
    if (err || !project) {
      req.flash("error", "Project is not found");
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

      if(err || !project){
         req.flash("error", "Project is not found");
      } else {
         req.flash("success", 'The project is successfully edited!');
      }

      res.redirect(`/users/${req.user._id}`);

  });
} // postEditProject

// Delete project
function deleteProject (req, res) {

  // Disable delete if the project has closed or pending approval tasks.
  helpers.getProject(req.params.id, ['Closed', 'Pending Approval'], (err, project) => {

    if (err || !project) {
      req.flash("error", "Project is not found!");
      res.redirect(`/users/${req.user._id}`);

    } else if (project.tasks && project.tasks.length > 0){

      let error = new Error('The project has closed or pending approval tasks and can not be deleted!');

      req.flash("error", error.message);
      res.redirect(`/users/${req.user._id}`);

    } else {
      // TODO: use DeleteOne instead of remove
      // TODO: send email notification to assignees of inprogress tasks
      Project.findOneAndRemove({_id: req.params.id}, (err, project) => {

        if (err) {
          req.flash("error", err.message);
          res.redirect(`/users/${req.user._id}`);
        } else {

          // Call the remove hooks
          project.remove();

          req.flash("success", "The project is deleted successfully!");
          res.redirect(`/users/${req.user._id}`);
        }
      });
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
