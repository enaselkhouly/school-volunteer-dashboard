'user-strict'

const User    = require('../models/User');
const Project = require('../models/Project');
const Task    = require('../models/Task');
const async   = require('async');

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

  let populate = {
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

  let conditions = {
      _id: userId,
      'projects.id': { $ne: projectId }
  };

  let update = {
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

  let populate = {
       path: 'tasks',
       model: 'Task',
       match: {
                  category: {$in: category},
                  status: {$in: status}
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

function removeTaskFromProject (userId, projectId, taskId, callback) {

  async.waterfall([
  function getProjectTasks (callback) {

      let populate = {
           path: 'tasks',
           model: 'Task',
           match: { $or: [{'assignedTo.id': userId}, {'author.id': userId}]}
       };

        Project.findById(projectId).populate(populate).exec( (err, project) => {

          if (err) {
              callback(err);
          } else {
            callback(null, project)
          }
        });
  },
  function removeTask(project, callback) {
    let taskAuthorId = null;
    let taskAssigneeId = null;

    if (project.tasks && project.tasks.length == 1) {
      taskAuthorId = project.tasks[0].author.id;
      taskAssigneeId = project.tasks[0].assignedTo.id;
    }
    Project.findByIdAndUpdate(projectId,
                          {$pull: {"tasks": taskId}},
                          (err, project) => {
      if (err) {
        callback(err);
      } else {
        callback(null, project, taskAuthorId, taskAssigneeId);
      }
    });
  },
  function removeProject(project, taskAuthorId, taskAssigneeId, callback) {

    if (!project.author.id.equals(userId) && taskAuthorId) {
        // remove project from user
        removeProjectFromUser(taskAuthorId, projectId, (err) => {
          if (err) {
              callback(err);
          }
        });
      }

      if (taskAssigneeId){
        removeProjectFromUser(taskAssigneeId, projectId, (err) => {
          if (err) {
              callback(err);
          }
        });
      }

      callback(null);

  }
  ],
  function (err) {
    callback(err);
  });
}


function removeAllProjectTasks (project, callback) {

  let condition = {
      _id: project.tasks
  };

  Task.remove (condition, (err) => {
      callback(err);
  });
}

function deleteProject (project, callback) {

    project.remove( (err) => {
      callback (err);
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

function deleteTask (task, callback) {

    task.remove( (err) => {
      callback (err);
    });
}

function getVolunteerTime (user, callback) {

  Task.aggregate([
    {
      $match: {
              'status': 'Closed',
               "assignedTo.id": user._id,
             }
    },
    {
      $group: {_id: 0,
               total: {$sum: "$volunteerTime"}
             }
    }], (err, results) => {

      let volunteerTime = 0;

      if (!err) {
        if (results.length > 0) {
          volunteerTime = results[0].total;
        }
      }
      return callback(err, volunteerTime);
  });
}

function statusQuery (statusQuery) {

  let options = ['Open', 'In-progress', 'Pending Approval', 'Closed'];

  let status = [];

  if (statusQuery) {
    for (let i = 0; i < options.length; i++) {
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

  let options = ['Uncategorized', 'At Home', 'On-campus', 'Off-campus'];

  let category = [];

  if (categories) {
    for (let i = 0; i < options.length; i++) {
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
  getUserProjects       : getUserProjects,
  addProjectToUser      : addProjectToUser,
  removeProjectFromUser : removeProjectFromUser,
  allProjects           : allProjects,
  getProject            : getProject,
  createProject         : createProject,
  addTaskToProject      : addTaskToProject,
  removeTaskFromProject : removeTaskFromProject,
  removeAllProjectTasks : removeAllProjectTasks,
  deleteProject         : deleteProject,
  allTasks              : allTasks,
  deleteTask            : deleteTask,
  getVolunteerTime      : getVolunteerTime,
  statusQuery           : statusQuery,
  categoryQuery         : categoryQuery
}
