'use-strict'

const taskController = require('../controllers/task'),
      auth           = require('../helpers/auth'),
      express        = require('express');

const router = express.Router();

/* GET: all Tasks*/
// router.get("/tasks", auth.isLoggedIn, taskController.getTasks);

/* GET: show form to add new task*/
router.get("/projects/:id/tasks/new", auth.isProjectOwner, taskController.getNewTask);

/* GET: Show more details about a task*/
router.get("/projects/:id/tasks/:task_id", auth.isLoggedIn, taskController.getTask);

/* POST: add new task*/
router.post("/projects/:id/tasks", auth.isProjectOwner, taskController.postNewTask);

/* GET: show form to edit task*/
router.get("/projects/:id/tasks/:task_id/edit", auth.isTaskOwner, taskController.getEditTask);

/* POST: edit task*/
router.put("/projects/:id/tasks/:task_id", auth.isLoggedIn, taskController.putTask);

/* Signup for a Task*/
router.get("/projects/:id/tasks/:task_id/signup", auth.isFamily, taskController.signupTask);

/* Cancel Task*/
router.get("/projects/:id/tasks/:task_id/cancel", auth.isFamily, taskController.cancelTask);

/* Complete Task*/
//router.get("/projects/:id/tasks/:task_id/complete", auth.isFamily, taskController.completeTask);

/* Approve Task*/
//router.get("/projects/:id/tasks/:task_id/approve", auth.isTaskOwner, taskController.approveTask);

/* Unapprove Task*/
router.get("/projects/:id/tasks/:task_id/unapprove", auth.isTaskOwner, taskController.unapproveTask);

/* Delete: delete task*/
router.delete("/projects/:id/tasks/:task_id", auth.isTaskOwner, taskController.deleteTask);

module.exports = router;
