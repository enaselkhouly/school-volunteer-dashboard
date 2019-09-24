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

// Remove task from project
taskSchema.post('remove', (task, next) => {

  task.model('Project').findByIdAndUpdate( task.project, // Condition
                            { $pull: { tasks: task._id  } }, // Update
                        (err) => {
      next(err);
  });
});


/*
* Methods
*/

// Sign up for a task
taskSchema.methods.signUp = function(userId, userName, userEmail) {
	let success = false;
	if (this.status === Status.OPEN) {
		this.assignedTo = {
			id: userId,
			displayName: userName,
      email: userEmail
		}
		this.status	= Status.INPROGRESS;

		this.save();

    // Send email notification to task creator
    mailer.sendTaskStatusNotification(this.author.email,
      `This is to update you that, ${this.assignedTo.displayName} signed up for <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project! If you need to share more details you can contact him/her at ${this.assignedTo.email}.`);

		success = true;
	}
	return success;
}//signup

// Cancel Task
taskSchema.methods.cancelTask = function( ) {
	let success = false;

	if (this.status === Status.INPROGRESS) {

    // Send email notification to task creator
    mailer.sendTaskStatusNotification(this.author.email,
      `Unfortunately, ${this.assignedTo.displayName} cancelled his/her sign up for <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project.`);

		this.assignedTo.id = null;
		this.assignedTo.displayName = '';
		this.status	= Status.OPEN;
		this.save();
		success = true;
	}

	return success;
} // cancelTask

// Remove Task Assignee
taskSchema.methods.removeAssignee = function( ) {
	let success = true;

	if (this.assignedTo.id && (this.status !== Status.CLOSED)) {

    // Send email notification to task creator
    success = mailer.sendTaskStatusNotification(this.author.email,
      `Unfortunately, ${this.assignedTo.displayName}'s account is deleted. The "${this.name}" task in the ${this.project.name} project he signedup for is now open.`);

		this.assignedTo.id = null;
		this.assignedTo.displayName = '';
		this.status	= Status.OPEN;
		this.save();
  }

	return success;
} // removeAssignee

// Complete Task
taskSchema.methods.completeTask = function(userId) {
	let success = false;
	if ( (this.status === Status.INPROGRESS)
			&& (this.assignedTo) && (this.assignedTo.id) && (this.assignedTo.id.toString() == userId.toString()) ) {
		this.status	= Status.PENDING;
		this.save();
		success = true;
	}

  // Send email notification to task creator
  mailer.sendTaskStatusNotification(this.author.email,
    `Good news! ${this.assignedTo.displayName} has completed work for <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project, please review and approve. Thank you!`);

	return success;
} // completeTask

// Approve task
taskSchema.methods.approveTask = function( ) {
	let success = false;

	if (this.status === Status.PENDING) {
		this.status	= Status.CLOSED;

		this.save();

		success = true;
	}

  // Send email notification to task creator
  mailer.sendTaskStatusNotification(this.assignedTo.email,
    `Thank you for completing your work for <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project, ${this.author.displayName} has approved the task. ${this.volunteerTime} mins has been added to your volunteer time.`);

	return success;
} // approveTask

// Unapprove Task
taskSchema.methods.unapproveTask = function( ) {
	let success = false;

	if (this.status === Status.PENDING) {
		this.status	= Status.INPROGRESS;

		this.save();

		success = true;
	}

  // Send email notification to task creator
  mailer.sendTaskStatusNotification(this.assignedTo.email,
    `Unfortunately, ${this.author.displayName} unapproved your work for <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project, please get back to the teacher at ${this.author.email} to check what is missing. Thank you so much for your understanding!`);

	return success;
} //unapproveTask

taskSchema.methods.sendTaskEditNotification = function( ) {
  if ((this.status != Status.OPEN) && this.assignedTo.email) {
    mailer.sendTaskStatusNotification(this.assignedTo.email,
      `This is to update you that the task <a href="${config.app.url}/projects/${this.project._id}/tasks/${this._id}">"${this.name}"</a> task in the ${this.project.name} project, has been updated.`);
  }
  return;
}

taskSchema.methods.resetStatus = function( ) {
  let success = true;

  this.status = Status.OPEN;

  return success;
}//resetStatus

module.exports = mongoose.model("Task", taskSchema);
