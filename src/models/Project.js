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

/*
* Hooks
*/

// Remove project tasks
//Note: ES6 arrow funtion doesn't work with Mongoose hooks
projectSchema.pre('remove', function(next) {

  // This will remove the Task without calling the Task remove hooks which
  // is the required behaviour. The  remove hook is linked with doc.remove by default.
  Task.remove ({_id: this.tasks}, next);
});

// Remove project from author user's projects
projectSchema.post('remove', (project, next) => {

  project.model('User').findByIdAndUpdate( project.author.id, // Condition
                            { $pull: { projects: project._id  } }, // Update
                        (err) => {
      next(err);
  });
});

module.exports = mongoose.model("Project", projectSchema);
