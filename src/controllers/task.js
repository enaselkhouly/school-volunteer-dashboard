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
  Task.findOne({_id: req.params.task_id}).populate('author.id', 'displayName email').populate('project', '_id name isPTA').exec( (err, task) => {

    if(err || !task){
      req.flash("error", "Task is not found");
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
    req.flash("error", "Task deadline/date could not be left empty");
    res.redirect(`/users/${req.user._id}`);
    return;
  }

  // Read new task information
  let newTask = new Task (req.body.task);

  // link the task with the user
  newTask.author = {
      id : req.user._id
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
    if (err || !task) {
      req.flash("error", "Task is not found!");
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

      Task.findByIdAndUpdate(req.params.task_id, req.body.task, {new: true}).populate('author.id', '_id displayName email secondaryEmail').populate('assignedTo.id', '_id displayName email secondaryEmail').populate('project', '_id name isPTA').exec( (err, task) => {
        if (err || !task) {
          let error = new Error("Task is not found!");
          return callback(error);
        }

        if (!req.query.Approve && !req.query.Complete) {
          task.sendTaskEditNotification();
        }
        callback(null, task, "Task is successfully edited!");
      });

    },
    function approveTask(task, msg, callback){
      if (req.query.Approve) {
        task.approveTask( (err) => {
          if (!err) {
            msg = `Thank you for reviewing and approving the task! You approved ${task.volunteerTime} mins.` ;
            callback(null, task, msg);
          } else {
            return callback(new Error("The task could not be approved!"));
          }
        });
      } else {
          callback(null, task, msg);
      }
    },
    function completeTask(task, msg, callback){
      if (req.query.Complete) {
        task.completeTask(req.user._id, (err) => {
          if (!err) {
            msg = "Thank you for completing the task :). Keep up the good work!";
            callback(null, msg);
          } else {
            return callback(new Error("The task could not be changed to completed!"));
          }
        });
      } else {
        callback(null, msg);
      }
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

        if(err || !task) {
          let error  = new Error('Task is not found!');
          return callback(error);
        }

        // Copy task information
        let newTask = new Task ({
          name: task.name,
          description: task.description,
          "author.id": task.author.id,
          "project": task.project,
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
      Task.findById(req.params.task_id).populate('author.id', 'displayName email secondaryEmail').populate('project', '_id name isPTA').exec( (err, task) => {
        if (err || !task) {
          let error = new Error("Task is not found!");
          return callback(error);
        }
        callback(null, task);
      });
    },
    function signupForTask(task, callback){
        // signup
        task.signUp(req.user._id, req.user.displayName, req.user.email, (err) => {
        callback(err, task);
        });
      },
    function addProjectToUser(task, callback){
      helpers.addProjectToUser(req.user._id, task.project, (err) => {
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
      res.redirect(`/projects`);
    } else {
      req.flash("success", "Thanks for signing up for this task!")	;
      res.redirect('back');
    }
  });
} // signupTask

function cancelTask (req, res) {

  async.waterfall ([
    function findTask (callback) {
      Task.findById(req.params.task_id).populate('author.id', 'displayName email secondaryEmail').populate('assignedTo.id', 'displayName email').populate('project', '_id name isPTA').exec( (err, task) => {
        if(err || !task) {
          let error = new Error("Task is not found!");
          return callback(error);
        }
        callback(null, task);
      });
    },
    function cancelTask (task, callback) {
      task.cancelTask( (err) => {
        if (err) {
          return callback(err);
        } else {
          return callback(null, task);
        }
      });
    },
    function removeProjectFromUser (task, callback) {
      helpers.removeEmptyProjectFromAssignee( req.user._id, task.project._id, (err) => {
        callback(err);
      });
    }
  ],
    function (err) {
      if (err){
        req.flash("error", err.message)	;
        res.redirect(`/projects`);
      } else {
        req.flash("success", "The Task assign is cancelled!")	;
        res.redirect(`/users/${req.user._id}`);
      }
  });
} // cancelTask

function unapproveTask (req, res) {

    Task.findById(req.params.task_id).populate('author.id', 'displayName email').populate('assignedTo.id', 'displayName email secondaryEmail').populate('project', '_id name isPTA').exec( (err, task) => {
        if (err || !task){
          req.flash("error", "Task is not found!")	;
          return res.redirect(`back`);
        }

        // Change task status
        task.unapproveTask( (err) => {
          if (!err) {
            req.flash("success", "The task is unapproved!")	;
            return res.redirect('back');
          } else {
            req.flash("error", "The task could not be unapproved!")	;
            return res.redirect(`/projects`);
          }
        });
      });
} // unapproveTask


// Delete task
function deleteTask (req, res) {

  async.waterfall ([
    function findTask (callback) {
      Task.findById(req.params.task_id).populate('author.id', 'displayName email').populate('assignedTo.id', 'displayName email secondaryEmail').populate('project', 'name').exec( (err, task) => {
        if (err || !task) {
          callback ( new Error ("Task is not found!"));
        } else {
          callback(null, task);
        }
      });
    },
    function cleanup (task, callback) {

      task.cleanup( (err) => {
        callback (err, task);
      });
    },
    function removeEmptyProject (task, callback) {
      helpers.removeEmptyProjectFromAssignee( task.assignedTo.id, task.project._id, (err) => {
        callback(err);
      });
    },
    function deleteTask (callback) {

      Task.deleteOne({_id: req.params.task_id}, (err) => {

        callback ( err );

      });
    }
  ],
  function (err) {
    if (err) {
      req.flash("error", err.message);
      res.redirect(`/projects`);
      return;
    } else {
      req.flash("success", "The task is successfully deleted!");
      res.redirect("/projects");
      return;
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
  duplicateTask : duplicateTask,
  signupTask    : signupTask,
  cancelTask    : cancelTask,
  unapproveTask : unapproveTask,
  deleteTask    : deleteTask
};
