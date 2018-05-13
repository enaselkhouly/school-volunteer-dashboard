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

  helpers.getTask(req.params.id, function (err, task) {

    if(err){
      req.flash("error", err.message);
      res.redirect(`/tasks`);
    } else {
      res.render(`user/${userDir}`, {
        user: user,
        task: task,
        Status: Task.Status,
        page: 'task/show'
      });
    }
  });
} //getTask

function getNewTask (req, res) {
  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  res.render(`user/${userDir}`, {
    page :'task/new'
  });
} // getNewTask

function postNewTask (req, res) {

  // Read new task information
  let newTask = new Task (req.body.task);

  newTask.author = {
    id : req.user._id,
    displayName: req.user.displayName
  };
  if (newTask.isFixedTime) {
    newTask.actualTime = newTask.estimatedTime;
  }

  helpers.createTask( newTask, (err, task) => {

    // Error in creating task
    if(err){
      req.flash("error", err.message);
      res.redirect(`/tasks`);
    } else {

      helpers.addTaskToUser(req.user, task, (err, user) => {
        // Error in updating user
        if(err){
          req.flash("error", err.message);
          return res.redirect(`/tasks/new`);
        }

        // New task created Successfully
        req.flash("success", "Successfully created a new Task!");
        res.redirect(`/tasks/${task._id}`);
      });

    }

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
        res.redirect(`/tasks`);
      } else {

        helpers.addTaskToUser(req.user, task, (err, user) => {

          if (err){
            req.flash("error", err.message)	;
            res.redirect(`/tasks`);
          } else {

            if (task.signUp(user._id, user.displayName)) {
              req.flash("success", "You are successfully assigned the workorder!")	;
              res.redirect('/tasks');
            } else {
              req.flash("error", "The workorder could not be assigned!")	;
              res.redirect(`/tasks`);
            }
          }
        });
      }
    });
} // signupTask

function cancelTask (req, res) {

  Task.findById(req.params.id, (err, task) => {
      if (err){
        req.flash("error", err.message)	;
        res.redirect(`/tasks`);
      } else {

          helpers.cancelTaskAssign(req.user._id, task._id, (err) => {
            if(err) {
              req.flash("error", "The task could not be canceled!")	;
              res.redirect(`/tasks`);
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
        res.redirect(`/tasks`);
      }
    }
  });
} // completeTask

function approveTask (req, res) {

  Task.findById(req.params.id, (err, task) => {
      if (err){
        req.flash("error", err.message)	;
        res.redirect(`/tasks`);
      } else {
        // Change task status
        if (task.approveTask()) {
          req.flash("success", "The task is approved!")	;
          res.redirect('/tasks');
        } else {
          req.flash("error", "The task could not be approved!")	;
          res.redirect(`/tasks`);
        }
      }
    });
} // approveTask

function unapproveTask (req, res) {

    Task.findById(req.params.id, (err, task) => {
        if (err){
          req.flash("error", err.message)	;
          res.redirect(`/tasks`);
        } else {
          // Change task status
          if (task.unapproveTask()) {
            req.flash("success", "The task is unapproved!")	;
            res.redirect('/tasks');
          } else {
            req.flash("error", "The task could not be unapproved!")	;
            res.redirect(`/tasks`);
          }
        }
      });
} // unapproveTask

function deleteTask (req, res) {

  // Find the task to be deleted
  Task.findById (req.params.id, (err, task) => {
    if (err) {
      req.flash("error", err.message);
      res.redirect(`/tasks`);
      return;
    }

    // remove Task from Author user
    helpers.removeTaskAuthor (task.author.id, task._id, function (err) {
      if (err) {
        req.flash("error", err.message);
        res.redirect(`/tasks`);
        return;
      }
    });

    // remove Task from Assigned user
    helpers.cancelTaskAssign (task.assignedTo.id, task._id, function (err) {
      if (err) {
        req.flash("error", err.message);
        res.redirect(`/tasks`);
        return;
      }
    });

    // Delete task
    task.remove(task._id, function (err) {
      if (err) {
        req.flash("error", err.message);
        res.redirect(`/tasks`);
      } else {
        req.flash("success", "Successfully deleted the Task!");
        res.redirect("/tasks");
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
