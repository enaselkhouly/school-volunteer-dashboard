'use-strict'

const projectController = require('../controllers/project'),
      auth           = require('../helpers/auth'),
      express        = require('express');

let router = express.Router();


/* GET: all Projects*/
router.get("/projects", auth.isLoggedIn, projectController.getProjects);

/* GET: show form to add new project*/
router.get("/projects/new", auth.isAdminOrTeacher, projectController.getNewProject);

/* GET: Show more details about a project*/
router.get("/projects/:id", auth.isLoggedIn, projectController.getProject);

/* POST: add new project*/
router.post("/projects", auth.isAdminOrTeacher, projectController.postNewProject);

/* GET: show form to edit project*/
router.get("/projects/:id/edit", auth.isAdminOrProjectOwner, projectController.getEditProject);

/* POST: edit project*/
router.put("/projects/:id", auth.isAdminOrProjectOwner, projectController.putProject);

/* Delete: delete project*/
router.delete("/projects/:id", auth.isAdminOrProjectOwner, projectController.deleteProject);


module.exports = router;
