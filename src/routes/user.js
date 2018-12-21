'use-strict'

const userController = require('../controllers/user'),
      auth           = require('../helpers/auth'),
      express        = require('express');

const router = express.Router();

/* Show the registeration form for new User.*/
router.get("/register", userController.getRegister);

/* Register new User.*/
router.post("/register", userController.postRegister);

/* User login form. */
router.get('/login', userController.getLogin);

/* User login.*/
router.post("/login", userController.postLogin);

/* User logout. */
router.get("/logout", auth.isLoggedIn, userController.getLogout);

/* Forgot password form.*/
router.get('/forgot', userController.getForgot);

/* Post forgot password form.*/
router.post('/forgot', userController.postForgot);

/* Reset password form.*/
router.get('/users/:id/reset', auth.isAdmin, userController.getReset);

/* Post reset password form.*/
router.post('/users/:id/reset', auth.isAdmin, userController.postReset);

/* Get all users */
router.get("/users", auth.isAdmin, userController.getUsers);

/* GET more details about user.*/
router.get("/users/:id", auth.isLoggedIn, userController.getUser);

/* GET user profile.*/
router.get("/users/:id/profile", auth.isLoggedIn, userController.getUserProfile);

/* Show form to update user */
router.get("/users/:id/edit", auth.isAdmin, userController.getEditUser);

/* Update user */
router.put("/users/:id", auth.isAdmin, userController.putUser);

/* Delete user */
router.delete("/users/:id", auth.isAdmin, userController.deleteUser);

module.exports = router;
