'user-strict'

const User    = require('../models/User');
const Project = require('../models/Project');
const Task    = require('../models/Task');

/*
* User helper functions.
*/

function allUsers ( callback ) {

  User.find({}, function(err, allUsers){
      callback(err, allUsers);
  });
}

/*
* Project helper functions
*/

function getUserProjects ( user, callback ) {

  let info;

  if (user.isFamily()) {

    User.findById(user._id).populate(
      {  path: "projects",
         populate: {
           path: 'tasks',
           model: 'Task',
           match: {'assignedTo.id': user._id}
         } }).exec( (err, user) => {
        callback(err, user.projects, info);
    });
  } else {

    User.findById(user._id).populate(
      {  path: "projects",
         populate: {
           path: 'tasks',
           model: 'Task',
           match: {'author.id': user._id}
         } }).exec( (err, user) => {
        callback(err, user.projects, info);
    });
  }

}

function addProjectToUser (userId, projectId, callback){

  var conditions = {
      _id: userId,
      'projects.id': { $ne: projectId }
  };

  var update = {
      $addToSet: { projects: { _id: projectId } }
  }

  User.findOneAndUpdate(conditions, update, function(err, user) {
    callback(err, user);
  });
}

function removeProjectFromUser ( userId, projectId, callback ) {
  User.findById(userId, (err, user) => {
    if (!err && user) {
      user.projects.pull({_id: projectId});
      user.save();
    }

    callback(err);
  });
}

function allProjects (user, callback ) {

  Project.find().populate({path: "tasks"}).exec( (err, allProjects) => {
      callback(err, allProjects);
  });

}

function getProject ( projectId, callback ) {

  Project.findById(projectId).populate({path: "tasks"}).exec( (err, project) => {
      callback(err, project);
  });
}

function createProject( project, callback) {
  Project.create(project, (err, project) => {
    callback(err, project);
  });
}

function addTaskToProject (projectId, taskId, callback){

  Project.findByIdAndUpdate(projectId,
                        {$push: {"tasks": taskId}},
                        (err, project) => {
      callback (err, project);
  });
}

function removeTaskFromProject (projectId, taskId, callback) {

    Project.findByIdAndUpdate(projectId,
                          {$pull: {"tasks": taskId}},
                          (err, project) => {
        callback (err);
    });
  //
  // Project.findById(projectId, (err, project) => {
  //   if (!err && project) {
  //   project.tasks.pull({_id:taskId});
  //   project.save();
  //   }
  //
  //   callback (err);
  // });
}


function removeAllTasksFromProject (projectId, callback) {

  Project.findById(projectId).populate('path: tasks').exec( (err, project) => {
    if (!err && project) {
    project.tasks.forEach( (task) => {
      project.tasks.pull({id: task._id});
      project.save();
    });
    }

    callback (err);
  });
}

function deleteProject (project, callback) {

    project.remove( (err) => {
      callback (err);
    });
}

/*
* Tasks helper functions
*/

function getUserTasks ( user, query, callback ) {

  let info;

  if (query != 'All') {
    User.findById(user._id).populate({path: "tasks", match: {status: query} }).exec( (err, user) => {
        callback(err, user.tasks, info);
    });
  } else {
    User.findById(user._id).populate({path: "tasks"}).exec( (err, user) => {
        callback(err, user.tasks, info);
    });
  }

}

function addTaskToUser (userId, taskId, callback){

  var conditions = {
      _id: userId,
      'tasks.id': { $ne: taskId }
  };

  var update = {
      $addToSet: { tasks: { _id: taskId } }
  }

  User.findOneAndUpdate(conditions, update, function(err, user) {
      callback (err, user);
  });
}

function removeTaskFromUser ( userId, taskId, callback ) {

  User.findByIdAndUpdate(userId,
                        {$pull: {"tasks": taskId}},
                        (err, user) => {
      callback (err, user);
  });
}
//
// function cancelTaskAssign (userId, taskId, callback) {
//
//   User.findById(userId, (err, user) => {
//     if (!err && user) {
//     user.tasks.pull({_id:taskId});
//     user.save();
//     }
//
//     callback (err);
//   });
// }

function allTasks (query, callback ) {

  if (query != 'All') {
    Task.find( {status: query}, (err, allTasks) => {
        callback(err, allTasks);
    });
  } else {
    Task.find((err, allTasks) => {
        callback(err, allTasks);
    });
  }

}

function getTask ( taskId, callback ) {

  Task.findById(taskId, (err, task) => {
      callback(err, task);
  });
}

function createTask( task, callback) {

  Task.create(task, (err, task) => {
    callback(err, task);
  });
}

function deleteTask (task, callback) {

    task.remove( (err) => {
      callback (err);
    });
}

function statusQuery (statusQuery) {

  let options = ['All', 'Open', 'In-progress', 'Pending Approval', 'Closed'];

  let status = (!statusQuery)? 'All' : statusQuery;

  for (var i = 0; i < options.length; i++) {
    let option = options[i].toLowerCase();
    option = option.replace(/ /g,'');
    if (option == status) {
      return status = options[i]
    }
  }

  return status;
}


function categoryQuery (categoryQuery) {

  let options = ['Uncategorized', 'At Home', 'In-campus', 'Outdoors'];

  let category = (!categoryQuery)? 'Uncategorized' : categoryQuery;

  for (var i = 0; i < options.length; i++) {
    let option = options[i].toLowerCase();
    option = option.replace(/ /g,'');
    if (option == category) {
      return category = options[i]
    }
  }

  return category;
}

module.exports = {
  allUsers              : allUsers,
  getUserTasks          : getUserTasks,
  getUserProjects       : getUserProjects,
  addProjectToUser      : addProjectToUser,
  removeProjectFromUser   : removeProjectFromUser,
  allProjects           : allProjects,
  getProject            : getProject,
  createProject         : createProject,
  addTaskToProject      : addTaskToProject,
  removeTaskFromProject : removeTaskFromProject,
  removeAllTasksFromProject : removeAllTasksFromProject,
  deleteProject         : deleteProject,
  addTaskToUser         : addTaskToUser,
  removeTaskFromUser      : removeTaskFromUser,
  // cancelTaskAssign      : cancelTaskAssign,
  allTasks              : allTasks,
  getTask               : getTask,
  createTask            : createTask,
  statusQuery           : statusQuery,
  categoryQuery         : categoryQuery
}
