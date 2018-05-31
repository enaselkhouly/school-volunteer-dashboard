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

function getUserProjects ( user, status, category, callback ) {

  var populate = {
    path: "projects",
    populate: {
       path: 'tasks',
       model: 'Task',
       match: {
                  $or: [{'assignedTo.id': user._id}, {'author.id': user._id}],
                  category: {$in: category},
                  status: {$in: status}
              }
    }
   };

    User.findById(user._id).populate(populate).exec( (err, user) => {
        callback(err, user.projects);
    });
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

function allProjects (user, status, category, callback ) {

  var populate = {
    path: "projects",
    populate: {
       path: 'tasks',
       model: 'Task',
       match: {
                  category: {$in: category},
                  status: {$in: status}
              }
    }
   };

  Project.find().populate(populate).exec( (err, allProjects) => {
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
}


function removeAllProjectTasks (project, callback) {

  var condition = {
      _id: project.tasks
  };

  Task.remove (condition, (err, tasks) => {
      callback(err);
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

  var update = {
    $pull: {"tasks": taskId}
  };

  User.findByIdAndUpdate(userId, update , (err, user) => {
      callback (err, user);
  });
}

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

  let options = ['Open', 'In-progress', 'Pending Approval', 'Closed'];

  let status = [];

  if (statusQuery) {
    for (var i = 0; i < options.length; i++) {
      let option = options[i].toLowerCase();
      option = option.replace(/ /g,'');
      if (statusQuery.indexOf(`${option}`) > -1) {
        status.push(options[i]);
      }
    }
  } else {
    status = options;
  }

  return status;
}


function categoryQuery (categories) {

  let options = ['Uncategorized', 'At Home', 'In-campus', 'Outdoors'];

  let category = [];

  if (categories) {
    for (var i = 0; i < options.length; i++) {
      let option = options[i].toLowerCase();
      option = option.replace(/ /g,'');
      if (categories.indexOf(`${option}`) > -1) {
        category.push(options[i]);
      }
    }
  } else {
      category = options;
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
  removeAllProjectTasks : removeAllProjectTasks,
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
