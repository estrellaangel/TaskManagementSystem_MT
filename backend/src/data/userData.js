const prisma = require('../lib/prisma');

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isLockedAdmin: true,
  canCreateTasks: true,
  canEditTasks: true,
  canDeleteTasks: true,
  canAssignTasks: true,
};

exports.getUsers = async () => {
  return prisma.user.findMany({
    select: userSelect,
  });
};

exports.findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

exports.findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

exports.updateUserPermissions = async (id, data) => {
  return prisma.user.update({
    where: { id },
    data: {
      role: data.role,
      isLockedAdmin: data.isLockedAdmin,
      canCreateTasks: data.canCreateTasks,
      canEditTasks: data.canEditTasks,
      canDeleteTasks: data.canDeleteTasks,
      canAssignTasks: data.canAssignTasks,
    },
    select: userSelect,
  });
};