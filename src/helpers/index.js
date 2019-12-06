'user-strict'

const User    = require('../models/User');
const Project = require('../models/Project');
const Task    = require('../models/Task');

/*
* User helper functions.
*/

function allUsers ( callback ) {

  User.find({}, (err, allUsers) => {
      callback(err, allUsers);
  });
}


/*
* User report.
*/

function allUsersReport ( callback ) {

  let populate = {
    path: "projects",
    populate: {
       path: 'tasks',
       model: 'Task'
    }
   };

  User.find({userType: 'Family'}).populate(populate).exec( (err, allUsers) => {
      callback(err, allUsers);
  });
}


/*
* Project helper functions
*/

function getUserProjects ( user, status, category, pta, callback ) {

  let populate = {
    path: "projects",
    match: {
      isPTA: {$in: pta}
    },
    populate: [{
       path: 'tasks',
       model: 'Task',
       match: {
                $or: [{'assignedTo.id': user._id}, {'author.id': user._id}],
                category: {$in: category},
                status: {$in: status}
              },
        populate: {
          path: 'assignedTo.id',
          model: 'User'
        },
        options: { sort: { created: -1 }}
    },
    {
      path: 'author.id',
      model: 'User'
    }],
    options: { sort: { created: -1 }}
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
      user.save( (err) => {
        callback(err);
      });
    } else {
      callback(err);
    }
  });
}

function removeEmptyProjectFromAssignee (userId, projectId, callback) {

  let populate = {
       path: 'tasks',
       model: 'Task',
       match: {
                  'assignedTo.id': userId
              }
      };
  Project.findById(projectId).populate(populate).exec( (err, project) => {
    if (err) {
      callback (err);
    } else {
      if (project.tasks.length > 0) {
        // skip removing project
        callback(null);
      } else {
        // Remove project from user
        removeProjectFromUser (userId, projectId, (err) => {
          callback (err);
        });
      }
    }
  } );
}

function allProjects (user, status, category, pta, callback ) {

  let populate = {
       path: 'tasks',
       model: 'Task',
       match: {
                  category: {$in: category},
                  status: {$in: status},
                  $or: [ //remove it from the view if open and the deadline passed 7 days
                    {status: {$ne: 'Open'}},
                    {deadline: {$gte: new Date().setDate(new Date().getDate()-7)}}
                  ]
              },
      populate: {
        path: 'assignedTo.id',
        model: 'User'
      },
      options: { sort: { created: -1 }}
   };
  Project.find({isPTA: pta}).populate('author.id').populate(populate).sort( {created: -1} ).exec( (err, allProjects) => {
      callback(err, allProjects);
  });

}

function getProject ( projectId, status, callback ) {

  let populate = {
       path: 'tasks',
       model: 'Task',
       match: {
                  status: {$in: status},
                  // $or: [
                  //   {status: {$ne: 'Open'}},
                  //   {deadline: {$gte: new Date(new Date().setDate(new Date().getDate()-1))}}
                  // ]
              },
      populate: {
        path: 'assignedTo.id',
        model: 'User'
      },
      options: { sort: { created: -1 }}
   };

  Project.findById(projectId).populate('author.id').populate(populate).exec( (err, project) => {
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

function removeAllProjectTasks (project, callback) {
  Task.deleteMany ({_id: { $in: project.tasks}}, (err) => {
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

function getVolunteerTime (user, isPTA, callback) {

  Task.find({'status': 'Closed', "assignedTo.id": user._id}).populate('project', 'isPTA').exec( (err, tasks) => {
    let volunteerTime = 0;

    if (!err && tasks) {

      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].project.isPTA == isPTA) {
          volunteerTime += tasks[i].volunteerTime;
        }
      }
    }

    return callback(err, volunteerTime);
  });

  // Task.aggregate([
  //     {
  //       $unwind: '$project',
  //     },
  //     {
  //       $match: {
  //             'status': 'Closed',
  //              "assignedTo.id": user._id,
  //              "project.isPTA": isPTA
  //            }
  //   },
  //   {
  //     $group: {_id: 0,
  //              total: {$sum: "$volunteerTime"}
  //            }
  //   }], (err, results) => {
  //
  //     let volunteerTime = 0;
  //
  //     if (!err) {
  //       if (results.length > 0) {
  //         volunteerTime = results[0].total;
  //       }
  //     }
  //     return callback(err, volunteerTime);
  // });
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

function isFilterByStatus (statusQuery) {

    let options = ['Open', 'In-progress', 'Pending Approval', 'Closed'];
    let isFiltered = false;

    if (statusQuery && (options.length !== statusQuery.length)) {
      isFiltered = true;
    }

    return isFiltered;
}

function ptaQuery (ptaQuery) {

  let options = [true, false];

  let pta = [];

  if (ptaQuery) {
    for (let i = 0; i < options.length; i++) {
      let option = options[i];
      if (ptaQuery.indexOf(`${option}`) > -1) {
        pta.push(options[i]);
      }
    }
  } else {
    pta = options;
  }

  return pta;
}

function isFilterByPTA (ptaQuery) {

    let options = [true, false];
    let isFiltered = false;

    if (ptaQuery && (options.length !== ptaQuery.length)) {
      isFiltered = true;
    }

    return isFiltered;
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


function isFilterByCategory (categoryQuery) {

    let options = ['Uncategorized', 'At Home', 'On-campus', 'Off-campus'];
    let isFiltered = false;

    if (categoryQuery && (options.length !== categoryQuery.length)) {
      isFiltered = true;
    }

    return isFiltered;
}

module.exports = {
  allUsers                        : allUsers,
  allUsersReport                  : allUsersReport,
  getUserProjects                 : getUserProjects,
  addProjectToUser                : addProjectToUser,
  removeProjectFromUser           : removeProjectFromUser,
  removeEmptyProjectFromAssignee  : removeEmptyProjectFromAssignee,
  allProjects                     : allProjects,
  getProject                      : getProject,
  createProject                   : createProject,
  addTaskToProject                : addTaskToProject,
  removeAllProjectTasks           : removeAllProjectTasks,
  deleteProject                   : deleteProject,
  allTasks                        : allTasks,
  deleteTask                      : deleteTask,
  getVolunteerTime                : getVolunteerTime,
  statusQuery                     : statusQuery,
  isFilterByStatus                : isFilterByStatus,
  categoryQuery                   : categoryQuery,
  isFilterByCategory              : isFilterByCategory,
  ptaQuery                        : ptaQuery,
  isFilterByPTA                   : isFilterByPTA,
}
