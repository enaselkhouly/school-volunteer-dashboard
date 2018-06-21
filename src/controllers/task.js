'use strict';

const User = require('../models/User'),
      Task = require('../models/Task'),
      Project = require('../models/Project'),
      helpers = require("../helpers"),
      async = require('async');

/* Show all tasks */
function getTasks (req, res) {

  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  let status = helpers.statusQuery(req.query.status);
  let category = helpers.categoryQuery(req.query.category);

  helpers.allTasks(status, function(err, allTasks){

    if(err){
      req.flash("error", err.message);
      return res.redirect(`/`);
    }

    res.render(`user/${userDir}`, {
      user: user,
      tasks: allTasks,
      status: status,
      category: category,
      page: 'task/index'
    });

  });
} //getTasks

/* Show all tasks */
function getTask (req, res) {
  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  helpers.getTask(req.params.task_id, function (err, task) {

    if(err){
      req.flash("error", err.message);
      return res.redirect(`back`);
    }

    res.render(`user/${userDir}`, {
      user: user,
      task: task,
      page: 'task/show'
    });

  });
} //getTask

function getNewTask (req, res) {
  let user = req.user;
  let userDir = req.user.userType.toLowerCase();
  let projectId = req.params.id;

  res.render(`user/${userDir}`, {
    projectId: projectId,
    page :'task/new'
  });


} // getNewTask

function postNewTask (req, res) {

  async.waterfall([
    // Fill task parameters
    function fillTaskParams (callback){

      // Read new task information
      var newTask = new Task (req.body.task);

      // link the task with the user
      newTask.author = {
          id : req.user._id,
          displayName: req.user.displayName
        }

      // Update the estimated time
      req.body.task.estimatedTime = req.body.task.volunteerTime;

      if (!newTask.deadline || !req.body.task.endTime) {
        return callback(new Error('Task date, start and end time could not be left empty.'));
      }

      // Initialize and update the end time if exists
      let endTime = req.body.task.endTime;
      newTask.endTime = new Date(newTask.deadline.getTime());
      let time = endTime.split ( ":" );
      if (time[0]) {
        newTask.endTime.setHours(time[0].trim());
      }
      if (time[1]) {
        newTask.endTime.setMinutes(time[1].trim());
      }

      // Get project name
      helpers.getProject(req.params.id, (err, project) => {

        if (err) {
          return callback(err);
        }
        // Set the project id and name
        newTask.project = {
          id: project._id,
          name: project.name
        }

        callback(null, newTask);
    });
  },
  // Create Task
  function (task, callback){
    helpers.createTask(task, callback);
  },
  // Add task to the project model
  function addTaskToProject(task, callback) {
    helpers.addTaskToProject(task.project.id, task._id, (err, project) => {
      if (err) {
        return callback(err);
      }
      callback(null, task, project);
    });
  },
  // Add Task to user
  function addTaskToUser(task, project, callback){
    helpers.addTaskToUser(req.user._id, task._id, (err, user) => {
      if (err) {
        return callback(err);
      }
      callback(null, task, project);
    });
  },
  // Add the task'project to the user projects
  function addTaskProjectToUser(task, project, callback){
    helpers.addProjectToUser(req.user._id, project._id, (err, user) => {
      if (err) {
        return callback(err);
      }

      callback(null);
    });
  }
  ], function (err) {

    if (err) {
      req.flash("error", err.message);
      res.redirect(`/users/${req.user._id}`);
    } else {
      req.flash("success", "The task is created successfully!")	;
      res.redirect(`/users/${req.user._id}`);
    }
  });
} // postNewTask

function getEditTask (req, res) {

  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  Task.findById(req.params.task_id, (err, task) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect(`/users/${req.user._id}`);
    } else {
      res.render(`user/${userDir}`, {
        task: task,
        page: 'task/edit'
      });
    }
  });
} // getEditTask

function putTask (req, res) {

  async.waterfall([
    function updateTask(callback){
      // TODO: update volunteer time only incase of task complete

      // Update the estimated time
      if (!req.query.Approve && !req.query.Complete) {
        req.body.task.estimatedTime = req.body.task.volunteerTime;
      }

      Task.findByIdAndUpdate(req.params.task_id, req.body.task, (err, task) => {
        if (err) {
          return callback(err);
        }

        callback(null, task, "Task is successfully edited!");
      });
    },
    function approveTask(task, msg, callback){

      if (req.query.Approve) {

          if (task.approveTask()) {
            msg = "The task is successfully approved!";
          } else {
            return callback(new Error("The task could not be approved!"));
          }
        }

      callback(null, task, msg);
    },
    function completeTask(task, msg, callback){

      if (req.query.Complete) {

          if (task.completeTask(req.user._id)) {
            msg = "The task is successfully completed!";
          } else {
            return callback(new Error("The task could not be changed to completed!"));
          }
        }

      callback(null, msg);
    }
  ], function(err, msg){
    if (err) {
      req.flash("error", err.message);
    } else {
      req.flash("success", msg);
    }
    res.redirect(`/users/${req.user._id}`);
  });
} // postEditTask

function signupTask (req, res) {

  async.waterfall([
    function getTaskInfo (callback){
      Task.findById(req.params.task_id, (err, task) => {
        if (err) {
          return callback(err);
        }
        callback(null, task);
      });
    },
    function addTaskToUser(task, callback){
      helpers.addTaskToUser(req.user._id, task._id, (err, user) => {
        if (err) {
          return callback(err);
        }
        // signup
        if (!task.signUp(user._id, user.displayName)) {
          return callback(new Error("You can not sign up for this task!"));
        }

        callback(null, task);
        });
      },
    function addProjectToUser(task, callback){
      helpers.addProjectToUser(req.user.id, task.project.id, (err, user) => {
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    }
  ],
  function (err) {

    if (err) {
      req.flash("error", err.message)	;
      res.redirect(`back`);
    } else {
      req.flash("success", "You are successfully signed up for the task!")	;
      res.redirect('back');
    }
  });
} // signupTask

function cancelTask (req, res) {

  async.waterfall ([
    function removeTaskFromUser (callback) {
      helpers.removeTaskFromUser(req.user._id, req.params.task_id, (err) => {
        if (err) {
            return callback(err);
        }
        callback(null);
      });
    },
    function cancelTask (callback) {
      Task.findById(req.params.task_id, (err, task) => {
        if(err) {
          return callback(err);
        }
        // change task state
        task.cancelTask();

        callback(null);
      });
    }
  ],
    function (err) {
      if (err){
        req.flash("error", err.message)	;
        res.redirect(`back`);
      } else {
        req.flash("success", "The Task assign is successfully cancelled!")	;
        res.redirect('back');
      }
  });
} // cancelTask

function completeTask (req, res) {

  Task.findById(req.params.task_id, (err, task) => {
    if(err){
      req.flash("error", err.message);
      return res.redirect("back");
    }
    // Change task status
    if (task.completeTask(req.user._id)) {
      req.flash("success", "The Task status is changed to completed!")	;
      res.redirect('back');
    } else {
      req.flash("error", "The task status could not be changed to completed!")	;
      res.redirect(`back`);
    }
  });
} // completeTask

function approveTask (req, res) {

  Task.findById(req.params.task_id, (err, task) => {
      if (err){
        req.flash("error", err.message)	;
        return res.redirect(`back`);
      }
      // Change task status
      if (task.approveTask()) {
        req.flash("success", "The task is approved!")	;
        res.redirect('back');
      } else {
        req.flash("error", "The task could not be approved!")	;
        res.redirect(`back`);
      }
    });
} // approveTask

function postApproveTask (req, res) {
  res.redirect('back');
}
function unapproveTask (req, res) {

    Task.findById(req.params.task_id, (err, task) => {
        if (err){
          req.flash("error", err.message)	;
          return res.redirect(`back`);
        }

        // Change task status
        if (task.unapproveTask()) {
          req.flash("success", "The task is unapproved!")	;
          res.redirect('back');
        } else {
          req.flash("error", "The task could not be unapproved!")	;
          res.redirect(`back`);
        }
      });
} // unapproveTask

function deleteTask (req, res) {

  async.waterfall([
    // Get Task info
    function getTaskinfo (callback) {

      Task.findById (req.params.task_id, (err, task) => {
        if (err) {
          return callback(err);
        }

        callback(null, task);
      });
    },
    // remove Task from Author user
    function removeTaskFromUser(task, callback) {

      if (task && task.author) {
        helpers.removeTaskFromUser (task.author.id, task._id, function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, task);
        });
      }
    },
    // remove Task from Assigned user
    function removeTaskFromAssigneeUser(task, callback) {

      if (task && task.assignedTo) {
        helpers.removeTaskFromUser (task.assignedTo.id, task._id, function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, task);
        });
      }
    },
    // remove task from project
    function removeTaskFromProject (task, callback) {

      if (task.project) {
        helpers.removeTaskFromProject(req.user._id, task.project.id, task._id, function (err) {
          if (err) {
            return callback(err);
          }
          callback(null, task);

        });
      }
    },
    function removeTask (task, callback) {

      // Delete task
      task.remove(task._id, function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, task);
      });
    }
  ], function (err) {
    if (err) {
      req.flash("error", err.message);
      res.redirect(`/projects`);
    } else {
      req.flash("success", "The task is successfully deleted!");
      res.redirect("/projects");
    }
  });
} // deleteTask

module.exports = {
  getTasks      : getTasks,
  getTask       : getTask,
  getNewTask    : getNewTask,
  postNewTask   : postNewTask,
  getEditTask   : getEditTask,
  putTask       : putTask,
  signupTask    : signupTask,
  cancelTask    : cancelTask,
  completeTask  : completeTask,
  approveTask   : approveTask,
  postApproveTask : postApproveTask,
  unapproveTask : unapproveTask,
  deleteTask    : deleteTask
};
