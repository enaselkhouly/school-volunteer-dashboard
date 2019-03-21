'use strict';

const Task = require('../models/Task'),
      helpers = require("../helpers"),
      async = require('async');

/* Show all tasks */
function getTasks (req, res) {
  return res.redirect(`/projects/${req.params.id}`);
} //getTasks

/* Show a specific task */
function getTask (req, res) {
  let user = req.user;
  let userDir = req.user.userType.toLowerCase();

  // Find task and populate project name
  Task.findOne({_id: req.params.task_id}).populate('project', '_id name isPTA').exec( (err, task) => {

    if(err || !task){
      const error = new Error ('Task not found');
      req.flash("error", error.message);
      return res.redirect(`/projects`);
    }
    res.render(`user/${userDir}`, {
      user: user,
      task: task,
      page: 'task/show'
    });

  });
} //getTask


/* Show for for a new Task */
function getNewTask (req, res) {

  let userDir = req.user.userType.toLowerCase();
  let projectId = req.params.id;

  res.render(`user/${userDir}`, {
    projectId: projectId,
    page :'task/new'
  });
} // getNewTask

/* Post form for a new Task */
function postNewTask (req, res) {

  // Validate
  if (!req.body.task.deadline) {
    const err = new Error('Task deadline/date could not be left empty.');
    req.flash("error", err.message);
    res.redirect(`/users/${req.user._id}`);
    return;
  }

  // Read new task information
  let newTask = new Task (req.body.task);

  // link the task with the user
  newTask.author = {
      id : req.user._id,
      displayName: req.user.displayName,
      email: req.user.email
    }

  // TODO
  // Update the estimated time
  req.body.task.estimatedTime = req.body.task.volunteerTime;

  let time ="";
  if (req.body.startTime) {
    let startTime = req.body.startTime;
    time = startTime.split ( ":" );
    if (time[0]) {
      newTask.deadline.setHours(time[0].trim());
    }
    if (time[1]) {
      newTask.deadline.setMinutes(time[1].trim());
    }
  }

  // Initialize and update the end time if exists
  if (req.body.endTime) {
    let endTime = req.body.endTime;
    newTask.endTime = new Date(newTask.deadline.getTime());
    let time = endTime.split ( ":" );
    if (time[0]) {
      newTask.endTime.setHours(time[0].trim());
    }
    if (time[1]) {
      newTask.endTime.setMinutes(time[1].trim());
    }
  }

  // Set the project id
  newTask.project = {
    _id: req.params.id
  }

  Task.create(newTask, (err) => {
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

      // Initialize and update the end time if exists
      if (req.body.endTime) {
        req.body.task.endTime = new Date(req.body.task.deadline);
        let endTime = req.body.endTime;
        let time = endTime.split ( ":" );
        if (time[0]) {
          req.body.task.endTime.setHours(time[0].trim());
        }
        if (time[1]) {
          req.body.task.endTime.setMinutes(time[1].trim());
        }
      }

      Task.findByIdAndUpdate(req.params.task_id, req.body.task, {new: true}, (err, task) => {
        if (err) {
          return callback(err);
        }

        if (!req.query.Approve && !req.query.Complete) {
          task.sendTaskEditNotification();
        }

        callback(null, task, "Task is successfully edited!");
      });

    },
    function approveTask(task, msg, callback){

      if (req.query.Approve) {

          if (task.approveTask()) {
            msg = `Thank you for reviewing and approving the task! You approved ${task.volunteerTime} mins.` ;
          } else {
            return callback(new Error("The task could not be approved!"));
          }
        }

      callback(null, task, msg);
    },
    function completeTask(task, msg, callback){

      if (req.query.Complete) {

          if (task.completeTask(req.user._id)) {
            msg = "Thank you for completing the task :). Keep up the good work!";
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

function duplicateTask (req, res) {

    async.waterfall([
      // Fill task parameters
      function fillTaskParams (callback){

      Task.findById(req.params.task_id, (err, task) => {

        if(err) {
          return callback(err);
        }

        // Copy task information
        let newTask = new Task ({
          name: task.name,
          description: task.description,
          "author.id": task.author.id,
          "author.displayName": task.author.displayName,
          "author.email": task.author.email,
          "project": task.project,
          "project.name": task.project.name,
          category: task.category,
          estimatedTime: task.estimatedTime,
          isFixedTime: task.isFixedTime,
          volunteerTime: task.volunteerTime,
          deadline: task.deadline,
          endTime: task.endTime
        });

        // Reset status
        newTask.resetStatus();

        return callback(null, newTask);
      });
    },
    // Create Task
    function (task, callback){
      Task.create(task, callback);
    }
  ], function (err) {

      if (err) {
        req.flash("error", err.message);
        res.redirect(`/users/${req.user._id}`);
      } else {
        req.flash("success", "The task is duplicated successfully! Make sure to update the task deadline based on your needs.")	;
        // res.redirect(`/projects/${task.project}/tasks/${task._id}/edit`);
        res.redirect(`/users/${req.user._id}`);
      }
    });
}

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
    function signupForTask(task, callback){
        // signup
        if (!task.signUp(req.user._id, req.user.displayName, req.user.email)) {
          return callback(new Error("You can not sign up for this task!"));
        }

        callback(null, task);
      },
    function addProjectToUser(task, callback){
      helpers.addProjectToUser(req.user.id, task.project, (err) => {
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
      req.flash("success", "Thanks for signing up for this task!")	;
      res.redirect('back');
    }
  });
} // signupTask

function cancelTask (req, res) {

  async.waterfall ([
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
    // TODO remove Project from user
  ],
    function (err) {
      if (err){
        req.flash("error", err.message)	;
        res.redirect(`back`);
      } else {
        req.flash("success", "The Task assign is cancelled!")	;
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
      req.flash("success", "Thank you for completing the task :). Keep up the good work!!")	;
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


// Delete task
function deleteTask (req, res) {

    Task.findOneAndRemove({_id: req.params.task_id}, (err, task) => {
      if (err) {
        req.flash("error", err.message);
        res.redirect(`/projects`);
        return;
      }
      // Call the remove hook
      task.remove();

      req.flash("success", "The task is successfully deleted!");
      res.redirect("/projects");
    });
} // deleteTask

module.exports = {
  getTasks      : getTasks,
  getTask       : getTask,
  getNewTask    : getNewTask,
  postNewTask   : postNewTask,
  getEditTask   : getEditTask,
  putTask       : putTask,
  duplicateTask : duplicateTask,
  signupTask    : signupTask,
  cancelTask    : cancelTask,
  completeTask  : completeTask,
  approveTask   : approveTask,
  postApproveTask : postApproveTask,
  unapproveTask : unapproveTask,
  deleteTask    : deleteTask
};
