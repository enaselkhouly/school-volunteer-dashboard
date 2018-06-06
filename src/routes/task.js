'use-strict'

const taskController = require('../controllers/task'),
      auth           = require('../helpers/auth'),
      express        = require('express');

let router = express.Router();

/* GET: all Tasks*/
// router.get("/tasks", auth.isLoggedIn, taskController.getTasks);

/* GET: show form to add new task*/
router.get("/projects/:id/tasks/new", auth.isAdminOrProjectOwner, taskController.getNewTask);

/* GET: Show more details about a task*/
router.get("/projects/:id/tasks/:task_id", auth.isLoggedIn, taskController.getTask);

/* POST: add new task*/
router.post("/projects/:id/tasks", auth.isAdminOrProjectOwner, taskController.postNewTask);

/* GET: show form to edit task*/
router.get("/projects/:id/tasks/:task_id/edit", auth.isAdminOrTaskOwner, taskController.getEditTask);

/* POST: edit task*/
router.put("/projects/:id/tasks/:task_id", auth.isLoggedIn, taskController.putTask);

/* Signup for a Task*/
router.get("/projects/:id/tasks/:task_id/signup", auth.isFamily, taskController.signupTask);

/* Cancel Task*/
router.get("/projects/:id/tasks/:task_id/cancel", auth.isFamily, taskController.cancelTask);

/* Complete Task*/
//router.get("/projects/:id/tasks/:task_id/complete", auth.isFamily, taskController.completeTask);

/* Approve Task*/
//router.get("/projects/:id/tasks/:task_id/approve", auth.isAdminOrTaskOwner, taskController.approveTask);

/* Unapprove Task*/
router.get("/projects/:id/tasks/:task_id/unapprove", auth.isAdminOrTaskOwner, taskController.unapproveTask);

/* Delete: delete task*/
router.delete("/projects/:id/tasks/:task_id", auth.isAdminOrTaskOwner, taskController.deleteTask);

module.exports = router;
