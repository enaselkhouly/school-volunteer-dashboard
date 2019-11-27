'use-strict'

const mongoose          = require("mongoose");
    mongoose.promise  = require('bluebird');
const Task = require('./Task');

// Project Schema definition
let projectSchema = mongoose.Schema({
	name: String,
  author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		displayName: String
	},
	description: String,
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    }
  ],
  isPTA: {
    type: Boolean,
    default: false
  },
  assignedTo: [
    {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
    }
  ],
  created: {
            type: Date,
            default: Date.now
          }
}); // projectSchema

module.exports = mongoose.model("Project", projectSchema);
