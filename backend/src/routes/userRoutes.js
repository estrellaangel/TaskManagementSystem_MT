const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUserPermissions,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getUsers);
router.put('/:id/permissions', authMiddleware, updateUserPermissions);

module.exports = router;