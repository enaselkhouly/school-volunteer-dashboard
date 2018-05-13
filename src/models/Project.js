'use-strict'

var mongoose          = require("mongoose");
    mongoose.promise  = require('bluebird');

// Task Schema definition
var projectSchema = mongoose.Schema({
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
  created: {
            type: Date,
            default: Date.now
          }
}); // projectSchema


module.exports = mongoose.model("Project", projectSchema);
