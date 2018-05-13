'use-strict'

function isLoggedInLocal (req, res) {
  let status = true;

  // Check if user is authonticated
  if(!req.isAuthenticated()){

    status = false;

    req.flash("error", "You need to be logged in!");
    res.redirect("/login");
  }

  return status;
}

/**
 * Login Required middleware.
 */
function isLoggedIn (req, res, next) {

  if (isLoggedInLocal(req, res)) {
      return next();
  }
} //isLoggedIn

function isAdmin (req, res, next) {

  if (isLoggedInLocal(req, res)) {

    let user = req.user;
    if (user && user.isAdmin()) {
      next();
    } else {
      req.flash("error", "You don't have permission!");
      res.redirect("back");
    }

  } // if: isLoggedIn
}// isAdmin

function isTeacher (req, res, next) {
  if (isLoggedInLocal(req, res)) {

    let user = req.user;
    if (user && user.isTeacher()) {
      next();
    } else {
      req.flash("error", "You don't have permission!");
      res.redirect("back");
    }

  } // if: isLoggedIn
} // isTeacher

function isFamily (req, res, next) {
  if (isLoggedInLocal(req, res)) {

    let user = req.user;
    if (user && user.isFamily()) {
      next();
    } else {
      req.flash("error", "You don't have permission!");
      res.redirect("back");
    }

  } // if: isLoggedIn
}// isFamily


function isAdminOrTeacher (req, res, next) {
  if (isLoggedInLocal(req, res)) {

    let user = req.user;
    if (user && (user.isAdmin() || user.isTeacher()) ) {
      next();
    } else {
      req.flash("error", "You don't have permission!");
      res.redirect("back");
    }
  } // if: isLoggedIn
} // isAdminOrTeacher


module.exports = {
  isLoggedIn        : isLoggedIn,
  isAdmin           : isAdmin,
  isTeacher         : isTeacher,
  isFamily          : isFamily,
  isAdminOrTeacher  : isAdminOrTeacher
}
