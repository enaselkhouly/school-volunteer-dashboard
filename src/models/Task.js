'use-strict'

const mongoose          = require("mongoose");
    mongoose.promise  = require('bluebird');

const mailer  = require("../services/mailer");
const Project = require('../models/Project');
const User = require('../models/User');

// Enum defining the Task startus
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
    id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Project"
		},
		name: String
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
      _id: task.project.id,
      'tasks.id': { $ne: task._id }
    };

  const update = {
    $addToSet: { tasks: { _id: task._id } }
  };

  Project.findByIdAndUpdate( condition, // Condition
                             update, // Update
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
      `${this.assignedTo.displayName} signed up for "${this.name}" in the ${this.project.name} project! If you need to share more details you can contact him/her at ${this.assignedTo.email}`);

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
      `Unfortunately, ${this.assignedTo.displayName} cancelled his/her sign up for "${this.name}" in the ${this.project.name}.`);

		this.assignedTo.id = null;
		this.assignedTo.displayName = '';
		this.status	= Status.OPEN;
		this.save();
		success = true;
	}

	return success;
} // cancelTask

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
    `Good news! ${this.assignedTo.displayName} has completed work for "${this.name}" in the ${this.project.name}, please review and approve. Thank you!`);

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
    `Thank you for competing your work for "${this.name}" in the ${this.project.name} project, teacher ${this.author.displayName} has approved the task. ${this.volunteerTime} mins has been added to your volunteer time.`);

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
    `Unfortunately, teacher ${this.author.displayName} unapproved your work for "${this.name}" in the ${this.project.name} project, please get back to the teacher at ${this.author.email} to check what is missing. Thank you so much for your understanding!`);

	return success;
} //unapproveTask

taskSchema.methods.sendTaskEditNotification = function( ) {
  if ((this.status != Status.OPEN) && this.assignedTo.email) {
    mailer.sendTaskStatusNotification(this.assignedTo.email,
      `This is to update you that the task "${this.name}" in the ${this.project.name} project, has been updated. Please check the task <a href="http://sva-volunteer.herokuapp.com/projects/${this.project.id}/tasks/${this._id}">here</a> to check the update. Thank You!`);
  }
  return;
}

taskSchema.methods.resetStatus = function( ) {
  let success = true;

  this.status = Status.OPEN;

  return success;
}//resetStatus

module.exports = mongoose.model("Task", taskSchema);
