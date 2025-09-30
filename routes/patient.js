const express = require('express');
const router = express.Router();
const { authenticateToken, allowRoles } = require('../utils/auth');

router.get('/', authenticateToken, allowRoles('patient'), (req, res) => {
  res.render('patient');
});

module.exports = router;
