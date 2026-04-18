const userService = require('../services/userService');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers(req.user);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.updateUserPermissions = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateUserPermissions(
      req.params.id,
      req.body,
      req.user
    );
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};