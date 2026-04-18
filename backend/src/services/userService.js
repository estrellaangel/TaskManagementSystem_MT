const { z } = require('zod');
const userData = require('../data/userData');

const updateUserPermissionsSchema = z.object({
  role: z.enum(['admin', 'manager', 'contributor']),
  isLockedAdmin: z.boolean(),
  canCreateTasks: z.boolean(),
  canEditTasks: z.boolean(),
  canDeleteTasks: z.boolean(),
  canAssignTasks: z.boolean(),
});

function makeError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

exports.getUsers = async (currentUser) => {
  if (currentUser.role !== 'admin') {
    throw makeError('Only admins can view users.', 403);
  }

  return userData.getUsers();
};

exports.updateUserPermissions = async (userIdParam, body, currentUser) => {
  if (currentUser.role !== 'admin') {
    throw makeError('Only admins can edit user permissions.', 403);
  }

  const userId = parseInt(userIdParam, 10);

  if (Number.isNaN(userId)) {
    throw makeError('Invalid user id.', 400);
  }

  const validatedData = updateUserPermissionsSchema.parse(body);
  const existingUser = await userData.findUserById(userId);

  if (!existingUser) {
    throw makeError('User not found.', 404);
  }

  // Once locked, never editable again
  if (existingUser.isLockedAdmin) {
    throw makeError('This locked admin account cannot be edited.', 403);
  }

  // Only admins can be marked as locked admins
  if (validatedData.isLockedAdmin && validatedData.role !== 'admin') {
    throw makeError('Only admin users can be marked as locked admins.', 400);
  }

  // Locked admin must always keep full admin access
  if (validatedData.role === 'admin' && validatedData.isLockedAdmin) {
    return userData.updateUserPermissions(userId, {
      role: 'admin',
      isLockedAdmin: true,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canAssignTasks: true,
    });
  }

  // Regular admin also keeps full fixed admin access
  if (validatedData.role === 'admin') {
    return userData.updateUserPermissions(userId, {
      role: 'admin',
      isLockedAdmin: false,
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canAssignTasks: true,
    });
  }

  // Manager / contributor can be updated normally
  return userData.updateUserPermissions(userId, {
    role: validatedData.role,
    isLockedAdmin: false,
    canCreateTasks: validatedData.canCreateTasks,
    canEditTasks: validatedData.canEditTasks,
    canDeleteTasks: validatedData.canDeleteTasks,
    canAssignTasks: validatedData.canAssignTasks,
  });
};