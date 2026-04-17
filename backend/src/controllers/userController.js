const prisma = require('../lib/prisma');
const { z } = require('zod');

exports.getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canAssignTasks: true,
      },
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

const updateUserPermissionsSchema = z.object({
  role: z.enum(['manager', 'contributor']),
  canCreateTasks: z.boolean(),
  canEditTasks: z.boolean(),
  canDeleteTasks: z.boolean(),
  canAssignTasks: z.boolean(),
});

exports.updateUserPermissions = async (req, res, next) => {
  try {
    // Admin-only access
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can edit user permissions.' });
    }

    const userId = parseInt(req.params.id, 10);

    if (Number.isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const validatedData = updateUserPermissionsSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Managers should not edit admins
    if (existingUser.role === 'admin') {
      return res.status(403).json({ message: 'Managers cannot edit admin users.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: validatedData.role,
        canCreateTasks: validatedData.canCreateTasks,
        canEditTasks: validatedData.canEditTasks,
        canDeleteTasks: validatedData.canDeleteTasks,
        canAssignTasks: validatedData.canAssignTasks,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        canCreateTasks: true,
        canEditTasks: true,
        canDeleteTasks: true,
        canAssignTasks: true,
      },
    });

    res.json(updatedUser);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors });
    }
    next(error);
  }
};