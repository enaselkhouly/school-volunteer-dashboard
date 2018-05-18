'use strict';

const User = require('../models/User'),
      Task = require('../models/Task'),
      Project = require('../models/Project'),
      helpers = require("../helpers");

/* Show all tasks */
function getTasks (req, res) {

  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  let status = helpers.statusQuery(req.query.status);
  let category = helpers.categoryQuery(req.query.category);

  helpers.allTasks(status, function(err, allTasks){

    if(err){
      req.flash("error", err.message);
      res.redirect(`/`);
    } else {
      res.render(`user/${userDir}`, {
        user: user,
        tasks: allTasks,
        status: status,
        category: category,
        page: 'task/index'
      });
    }
  });
} //getTasks

/* Show all tasks */
function getTask (req, res) {
  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  console.log('get task taskId', req.params.id);
  helpers.getTask(req.params.id, function (err, task) {

    if(err){
      req.flash("error", err.message);
      res.redirect(`back`);
    } else {
      res.render(`user/${userDir}`, {
        user: user,
        task: task,
        page: 'task/show'
      });
    }
  });
} //getTask

function getNewTask (req, res) {
  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  let projectId = req.query.project;
  console.log('GEt projectId', projectId);
  Project.findById(projectId, (err, project) => {

    if (err) {
      req.flash("error", err.message);
      res.redirect(`back`);
    } else {
      res.render(`user/${userDir}`, {
        project: project,
        page :'task/new'
      });
    }
  })

} // getNewTask

function postNewTask (req, res) {

  // Read new task information
  var newTask = new Task (req.body.task);

  var projectId = req.query.project;

  // link the task with the user
  newTask.author = {
    id : req.user._id,
    displayName: req.user.displayName
  };

  if (newTask.isFixedTime) {
    newTask.actualTime = newTask.estimatedTime;
  }

  // link the task with the project
  helpers.getProject(projectId, (err, project) => {
    console.log(project);
    newTask.project = {
      id: project._id,
      name: project.name
    }

    helpers.createTask( newTask, (err, task) => {
      // Error in creating task
      if(err){
        req.flash("error", err.message);
        res.redirect(`back`);
      } else {

        helpers.addTaskToProject(project._id, task._id, (err, project) => {
          // Error in updating user
          if(err){
            req.flash("error", err.message);
            return res.redirect(`/tasks/new?project=${project._id}`);
          }
        });

        helpers.addTaskToUser(req.user._id, task._id, (err, user) => {
          // Error in updating user
          if(err){
            req.flash("error", err.message);
            return res.redirect(`/tasks/new?project=${project._id}`);
          }
          // New task created Successfully
          req.flash("success", "Successfully created a new Task!");
          res.redirect(`/projects`);
        });

      }

    });

  });
} // postNewTask

function getEditTask (req, res) {

  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  res.render(`user/${userDir}`, {
    page: 'task/edit'
  });
} // getEditTask

function postEditTask (req, res) {
  // todo
  res.redirect('tasks');
} // postEditTask

function signupTask (req, res) {

  Task.findById(req.params.id, (err, task) => {

      if (err){
        req.flash("error", err.message)	;
        res.redirect(`back`);
      } else {

        helpers.addTaskToUser(req.user, task, (err, user) => {

          if (err){
            req.flash("error", err.message)	;
            res.redirect(`back`);
          } else {

            if (!task.signUp(user._id, user.displayName)) {
              req.flash("error", "You can not sign up for this task!")	;
              res.redirect(`back`);
            }
          }
        });

        Project.findById(task.project.id, (err, project) => {

          if (err) {
            req.flash("error", message.err)	;
            res.redirect(`back`);
          }

          if (!project) {
            helpers.addProjectToUser(user._id, project, (err, user) => {
              if (err) {
                req.flash("error", message.err)	;
                res.redirect(`back`);
              }
            });
          }

          req.flash("success", "You are successfully signed up for the task!")	;
          res.redirect('back');
        });
      }
    });
} // signupTask

function cancelTask (req, res) {

  Task.findById(req.params.id, (err, task) => {
      if (err){
        req.flash("error", err.message)	;
        res.redirect(`back`);
      } else {

          helpers.cancelTaskAssign(req.user._id, task._id, (err) => {
            if(err) {
              req.flash("error", "The task could not be canceled!")	;
              res.redirect(`back`);
            } else {
              req.flash("success", "The Task assign is successfully cancelled!")	;
              res.redirect('/tasks');
            }
          });
        }
  });

} // cancelTask

function completeTask (req, res) {

  Task.findById(req.params.id, (err, task) => {
    if(err){
      req.flash("error", err.message);
      res.redirect("/tasks");
      return;
    } else {

      // Change task status
      if (task.completeTask(req.user._id)) {
        req.flash("success", "The Task status is changed to completed!")	;
        res.redirect('/tasks');
      } else {
        req.flash("error", "The task status could not be changed to completed!")	;
        res.redirect(`back`);
      }
    }
  });
} // completeTask

function approveTask (req, res) {

  Task.findById(req.params.id, (err, task) => {
      if (err){
        req.flash("error", err.message)	;
        res.redirect(`back`);
      } else {
        // Change task status
        if (task.approveTask()) {
          req.flash("success", "The task is approved!")	;
          res.redirect('/tasks');
        } else {
          req.flash("error", "The task could not be approved!")	;
          res.redirect(`back`);
        }
      }
    });
} // approveTask

function unapproveTask (req, res) {

    Task.findById(req.params.id, (err, task) => {
        if (err){
          req.flash("error", err.message)	;
          res.redirect(`back`);
        } else {
          // Change task status
          if (task.unapproveTask()) {
            req.flash("success", "The task is unapproved!")	;
            res.redirect('/tasks');
          } else {
            req.flash("error", "The task could not be unapproved!")	;
            res.redirect(`back`);
          }
        }
      });
} // unapproveTask

function deleteTask (req, res) {

  // Find the task to be deleted
  Task.findById (req.params.id, (err, task) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect(`back`);
      return;
    }

    if (!task) {
      req.flash("error", 'Task does not exists or already deleted!');
      res.redirect(`back`);
      return;
    }

    // remove Task from Author user
    if (task.author) {
      helpers.removeTaskAuthor (task.author.id, task._id, function (err) {
        if (err) {
          req.flash("error", err.message);
          res.redirect(`back`);
          return;
        }
      });
    }

    // remove Task from Assigned user
    if (task.assignedTo) {
      helpers.cancelTaskAssign (task.assignedTo.id, task._id, function (err) {
        if (err) {
          req.flash("error", err.message);
          res.redirect(`back`);
          return;
        }
      });
    }

    if (task.project) {
      helpers.removeTaskFromProject(task.project.id, task._id, function (err) {
        if (err) {
          req.flash("error", err.message);
          res.redirect(`back`);
          return;
        }
      });

    }
    // Delete task
    task.remove(task._id, function (err) {
      if (err) {
        req.flash("error", err.message);
        res.redirect(`back`);
      } else {
        req.flash("success", "Successfully deleted the Task!");
        res.redirect("back");
      }
    });
  });

} // deleteTask

module.exports = {
  getTasks      : getTasks,
  getTask       : getTask,
  getNewTask    : getNewTask,
  postNewTask   : postNewTask,
  getEditTask   : getEditTask,
  postEditTask  : postEditTask,
  signupTask    : signupTask,
  cancelTask    : cancelTask,
  completeTask  : completeTask,
  approveTask   : approveTask,
  unapproveTask : unapproveTask,
  deleteTask    : deleteTask
};
