'use-strict'

const mongoose          = require("mongoose");
    mongoose.promise  = require('bluebird');

const mailer  = require("../services/mailer");

const config  = require("../../configs");

// Enum defining the Task status
const Status = {
		OPEN: "Open",
		INPROGRESS: "In-progress",
		PENDING: "Pending Approval",
		CLOSED: "Closed"
};

// Enum defining the task category
const Category = {
	UNCATEGORIZED: "Uncategorized",
  ATHOME: "At Home",
	ONCAMPUS: "On-campus",
	OFFCAMPUS: "Off-campus"
};

// Enum defining the action to be applied on the task to change its status
const Action = {
  SIGNUP: "Signup",
  CANCEL: "Cancel",
  COMPLETE: 'Complete',
  APPROVE: 'Approve',
  UNAPPROVE: 'Unapprove'
};

// task fixed time value
const FIXED_TIME_VALUE = 30; // in mins


// Task Schema definition
let taskSchema = mongoose.Schema({
	name: String,
  author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		displayName: String,
    email: String
	},
	assignedTo: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		displayName: String,
    email: String
	},
  project: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Project"
  },
	description: String,
  status: {
            type: String,
            enum: [Status.OPEN, Status.INPROGRESS, Status.PENDING, Status.CLOSED],
            default: Status.OPEN
          },
  category: {
              type: String,
              enum: [Category.UNCATEGORIZED, Category.ATHOME,Category.ONCAMPUS, Category.OFFCAMPUS],
              default: Category.UNCATEGORIZED
            },
  isFixedTime: {
                type: Boolean,
                default: true
              },
  estimatedTime: { type: Number,
                   default: FIXED_TIME_VALUE
              },
  volunteerTime: { type: Number,
                default: 0
              },
  created: {
            type: Date,
            default: Date.now
          },
  deadline: {
            type: Date,
            default: Date.now
          },
  endTime: {
            type: Date
          }
});

/*
* Hooks
*/
//Add task to project
taskSchema.post('validate', (task, next) => {

  const condition = {
      _id: task.project._id,
      'tasks.id': { $ne: task._id }
    };

  const update = {
    $addToSet: { tasks: { _id: task._id } }
  };

  task.model('Project').findByIdAndUpdate( condition, // Condition
                             update, // Update
                        (err) => {
      next(err);
  });
});


/*
* Methods
*/

// Remove task from project
taskSchema.methods.cleanup = function (callback) {

  if ( (this.status !== Status.OPEN) && this.assignedTo && this.assignedTo.id) {

    // Send email notification to assignee
    let recipients = (this.assignedTo.id.secondaryEmail && (this.assignedTo.id.secondaryEmail != null))? (this.assignedTo.id.email + ',' + this.assignedTo.id.secondaryEmail) : this.assignedTo.id.email;

    mailer.sendTaskStatusNotification(recipients,
      `Unfortunately, the task "${this.name}" in the ${this.project.name} project was deleted. You won't earn a credit for this task. If you think this is done by mistake or you have any questions please email the teacher at ${this.author.id.email}. Thanks for your understanding!`);

    this.model('Project').findByIdAndUpdate( this.project, // Condition
                              { $pull: { tasks: this._id  } }, // Update
                          (err) => {

        callback(err);
    });
  } else {
    callback(null);
  }
}

// Sign up for a task
taskSchema.methods.signUp = function(userId, userName, userEmail, callback) {

	if (this.status === Status.OPEN) {
		this.assignedTo = {
			id: userId
		}
		this.status	= Status.INPROGRESS;

		this.save( (err) => {

      if (err) {
          return callback(err);
      }

      // Send email notification to task creator

      let recipients = (this.author.id.secondaryEmail && (this.author.id.secondaryEmail != null))? (this.author.id.email + ',' + this.author.id.secondaryEmail) : this.author.id.email;

      mailer.sendTaskStatusNotification(recipients,
        `This is to update you that, ${userName} signed up for <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project! If you need to share more details you can contact him/her at ${userEmail}.`);

        return callback(null);
    });
	} else {
    return callback(new Error ('The task is not open, you can\'t signup!'));
  }
}//signup

// Cancel Task
taskSchema.methods.cancelTask = function( callback ) {

	if (this.status === Status.INPROGRESS) {

    let assignee = this.assignedTo.id.displayName;
		this.assignedTo.id = null;
		this.assignedTo.displayName = '';
		this.status	= Status.OPEN;
		this.save( (err) => {

      if (err) {
        return callback (err);
      }

      // Send email notification to task creator

      let recipients = (this.author.id.secondaryEmail && (this.author.id.secondaryEmail != null))? (this.author.id.email + ',' + this.author.id.secondaryEmail) : this.author.id.email;

      mailer.sendTaskStatusNotification(recipients,
        `Unfortunately, ${assignee} cancelled his/her sign up for <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project.`);

      return callback(null);
    });
	} else {
    return callback (new Error ("Can not cancel assignee!"));
  }
} // cancelTask

// Remove Task Assignee
taskSchema.methods.removeAssignee = function( callback ) {

	if (this.assignedTo.id && (this.status !== Status.CLOSED)) {

    let assignee = this.assignedTo.id.displayName;
		this.assignedTo.id = null;
		this.assignedTo.displayName = '';
    this.assignedTo.email = '';
		this.status	= Status.OPEN;
		this.save( (err) => {
      if (err) {
        return callback(err);
      }

      // Send email notification to task creator

      let recipients = (this.author.id.secondaryEmail && (this.author.id.secondaryEmail != null))? (this.author.id.email + ',' + this.author.id.secondaryEmail) : this.author.id.email;

      mailer.sendTaskStatusNotification(recipients,
        `Unfortunately, ${assignee}'s account is deleted. The "${this.name}" task in the ${this.project.name} project he signedup for is now open.`);

        return callback(null);
    });
  } else {
    return callback(new Error ('Can not remove assignee!'));
  }
} // removeAssignee

// Complete Task
taskSchema.methods.completeTask = function(userId, callback) {

	if ( (this.status === Status.INPROGRESS)
			&& (this.assignedTo) && (this.assignedTo.id) && (this.assignedTo.id._id) && (this.assignedTo.id._id.toString() == userId.toString()) ) {
		this.status	= Status.PENDING;

		this.save( (err) => {

      if (err) {
        return callback(err);
      }

      // Send email notification to task creator

      let recipients = (this.author.id.secondaryEmail && (this.author.id.secondaryEmail != null))? (this.author.id.email + ',' + this.author.id.secondaryEmail) : this.author.id.email;

      mailer.sendTaskStatusNotification(recipients,
        `Good news! ${this.assignedTo.id.displayName} has completed work for <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project, please review and approve. Thank you!`);

      return callback (null);
    });
	} else {
    return callback (new Error ('Can not set task as complete!'));
  }
} // completeTask

// Approve task
taskSchema.methods.approveTask = function(callback) {

	if (this.status === Status.PENDING) {
		this.status	= Status.CLOSED;

		this.save( (err) => {
      if (err) {
        return callback (err);
      }
      // Send email notification to assignee

      let recipients = (this.assignedTo.id.secondaryEmail && (this.assignedTo.id.secondaryEmail != null))? (this.assignedTo.id.email + ',' + this.assignedTo.id.secondaryEmail) : this.assignedTo.id.email;

      mailer.sendTaskStatusNotification(recipients,
        `Thank you for completing your work for <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project, ${this.author.id.displayName} has approved the task. ${this.volunteerTime} mins has been added to your volunteer time.`);

        return callback(null);
    });
	} else {
    return callback(new Error ('Can not approve task!'));
  }
} // approveTask

// Unapprove Task
taskSchema.methods.unapproveTask = function( callback) {

	if (this.status === Status.PENDING) {
		this.status	= Status.INPROGRESS;

		this.save( (err) => {
      if (err) {
        return callback(err);
      }

      // Send email notification to assignee

      let recipients = (this.assignedTo.id.secondaryEmail && (this.assignedTo.id.secondaryEmail != null))? (this.assignedTo.id.email + ',' + this.assignedTo.id.secondaryEmail) : this.assignedTo.id.email;

      mailer.sendTaskStatusNotification(recipients,
        `Unfortunately, ${this.author.id.displayName} unapproved your work for <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project, please get back to the teacher at ${this.author.id.email} to check what is missing. Thank you so much for your understanding!`);

      return callback(null);
    } );
	} else {
    return callback (new Error ('Can not unapprove task!'));
  }
} //unapproveTask

// Send task notification
taskSchema.methods.sendTaskEditNotification = function( ) {
  if ((this.status != Status.OPEN) && this.assignedTo && this.assignedTo.id && this.assignedTo.id.email) {

    let recipients = (this.assignedTo.id.secondaryEmail && (this.assignedTo.id.secondaryEmail != null))? (this.assignedTo.id.email + ',' + this.assignedTo.id.secondaryEmail) : this.assignedTo.id.email;

    mailer.sendTaskStatusNotification(recipients,
      `This is to update you that the task <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> in the ${this.project.name} project, has been updated.`);
  }
  return;
}

taskSchema.methods.resetStatus = function( ) {
  let success = true;

  this.status = Status.OPEN;

  return success;
}//resetStatus

module.exports = mongoose.model("Task", taskSchema);
