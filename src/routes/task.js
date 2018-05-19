'use-strict'

const taskController = require('../controllers/task'),
      auth           = require('../helpers/auth'),
      express        = require('express');

let router = express.Router();

/* GET: all Tasks*/
// router.get("/tasks", auth.isLoggedIn, taskController.getTasks);

/* GET: show form to add new task*/
router.get("/tasks/new", auth.isAdminOrTeacher, taskController.getNewTask);

/* GET: Show more details about a task*/
router.get("/tasks/:id", auth.isLoggedIn, taskController.getTask);

/* POST: add new task*/
router.post("/tasks", auth.isAdminOrTeacher, taskController.postNewTask);

/* GET: show form to edit task*/
router.get("/tasks/:id/edit", auth.isAdminOrTeacher, taskController.getEditTask);

/* POST: edit task*/
router.post("/tasks/:id/edit", auth.isAdminOrTeacher, taskController.postEditTask);

/* Signup for a Task*/
router.get("/tasks/:id/signup", auth.isFamily, taskController.signupTask);

/* Cancel Task*/
router.get("/tasks/:id/cancel", auth.isFamily, taskController.cancelTask);

/* Complete Task*/
router.get("/tasks/:id/complete", auth.isFamily, taskController.completeTask);

/* Approve Task*/
router.get("/tasks/:id/approve", auth.isAdminOrTeacher, taskController.approveTask);

/* Unapprove Task*/
router.get("/tasks/:id/unapprove", auth.isAdminOrTeacher, taskController.unapproveTask);

/* Delete: delete task*/
router.delete("/tasks/:id", auth.isAdminOrTeacher, taskController.deleteTask);

module.exports = router;
