const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userData = require('../data/userData');

exports.login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.status = 400;
    throw error;
  }

  const user = await userData.findUserByEmail(email);

  if (!user) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    const error = new Error('Invalid email or password');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      canCreateTasks: user.canCreateTasks,
      canEditTasks: user.canEditTasks,
      canDeleteTasks: user.canDeleteTasks,
      canAssignTasks: user.canAssignTasks,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      canCreateTasks: user.canCreateTasks,
      canEditTasks: user.canEditTasks,
      canDeleteTasks: user.canDeleteTasks,
      canAssignTasks: user.canAssignTasks,
    },
  };
};