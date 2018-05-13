'user-strict'

const User = require('../models/User');
const Task = require('../models/Task');

function allUsers ( callback ) {

  User.find({}, function(err, allUsers){
      callback(err, allUsers);
  });
}

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

function addTaskToUser (user, task, callback){
  User.findByIdAndUpdate(user._id,
                        {$push: {"tasks": task._id}},
                        (err, user) => {
      callback (err, user);

  });
}

function removeTaskAuthor ( userId, taskId, callback ) {
  User.findById(userId, (err, user) => {
    if (!err && user) {
      user.tasks.pull({_id: taskId});
      user.save();
    }

    callback(err);
  });
}

function cancelTaskAssign (userId, taskId, callback) {

  User.findById(userId, (err, user) => {
    if (!err && user) {
    user.tasks.pull({_id:taskId});
    user.save();
    }

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
  allUsers          : allUsers,
  getUserTasks      : getUserTasks,
  addTaskToUser     : addTaskToUser,
  removeTaskAuthor  : removeTaskAuthor,
  cancelTaskAssign  : cancelTaskAssign,
  allTasks          : allTasks,
  getTask           : getTask,
  createTask        : createTask,
  statusQuery       : statusQuery,
  categoryQuery     : categoryQuery
}
