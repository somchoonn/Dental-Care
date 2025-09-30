const express = require('express');
const router = express.Router();
const { authenticateToken, allowRoles } = require('../utils/auth');

router.get('/', authenticateToken, allowRoles('staff'), (req, res) => {
  res.render('staff');
});
router.get('/show', authenticateToken, allowRoles('staff'), (req, res) => {
  res.render('staff2');
});
module.exports = router;
