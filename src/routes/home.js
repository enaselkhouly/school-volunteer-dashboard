'use-strict'

const express        = require('express');

const router = express.Router();

// GET home page.
router.get('/', (req, res) => {
  return res.redirect('/login');
});

module.exports = router;
