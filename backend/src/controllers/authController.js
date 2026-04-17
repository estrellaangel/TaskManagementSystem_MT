const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
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

    res.json({
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
    });
  } catch (error) {
    next(error);
  }
};