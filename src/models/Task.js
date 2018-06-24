'use-strict'

var mongoose          = require("mongoose");
    mongoose.promise  = require('bluebird');

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
	INCAMPUS: "In-campus",
	OUTDOORS: "Outdoors"
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
var taskSchema = mongoose.Schema({
	name: String,
  author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		displayName: String
	},
	assignedTo: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		displayName: String
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
              enum: [Category.UNCATEGORIZED, Category.ATHOME,Category.INCAMPUS, Category.OUTDOORS],
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

taskSchema.methods.assignTask = function(userId, userName) {
	var success = false;
	if (this.status === Status.OPEN) {
		this.assignedTo = {
			id: userId,
			displayName: userName
		}
		this.status	= Status.ASSIGNED;

		this.save();

		success = true;
	}
	return success;
}

/*
* Methods
*/

// Sign up for a task
taskSchema.methods.signUp = function(userId, userName) {
	var success = false;
	if (this.status === Status.OPEN) {
		this.assignedTo = {
			id: userId,
			displayName: userName
		}
		this.status	= Status.INPROGRESS;

		this.save();

		success = true;
	}
	return success;
}//signup

// Cancel Task
taskSchema.methods.cancelTask = function( ) {
	var success = false;

	if (this.status === Status.INPROGRESS) {
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
	var success = false;
	if ( (this.status === Status.INPROGRESS)
			&& (this.assignedTo) && (this.assignedTo.id) && (this.assignedTo.id.toString() == userId.toString()) ) {
		this.status	= Status.PENDING;
		this.save();
		success = true;
	}
	return success;
} // completeTask

// Approve task
taskSchema.methods.approveTask = function( ) {
	var success = false;

	if (this.status === Status.PENDING) {
		this.status	= Status.CLOSED;

		this.save();

		success = true;
	}
	return success;
} // approveTask

// Unapprove Task
taskSchema.methods.unapproveTask = function( ) {
	var success = false;

	if (this.status === Status.PENDING) {
		this.status	= Status.INPROGRESS;

		this.save();

		success = true;
	}
	return success;
} //unapproveTask

module.exports = mongoose.model("Task", taskSchema);
