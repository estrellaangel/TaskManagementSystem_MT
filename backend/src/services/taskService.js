const { z } = require('zod');
const taskData = require('../data/taskData');

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['Todo', 'In Progress', 'Done']),
  assignedUserId: z.number().nullable().optional(),
});

function makeError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

exports.getTasks = async (query, user) => {
  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 5;

  const filters = {
    status: query.status,
    assignedUserId: query.assignedUserId,
    search: query.search,
    canViewAllTasks: Boolean(user.canAssignTasks),
    userId: user.userId,
    page,
    limit,
  };

  return taskData.getTasks(filters);
};

exports.createTask = async (body, user) => {
  if (!user.canCreateTasks) {
    throw makeError('You do not have permission to create tasks', 403);
  }

  const requestData = {
    ...body,
    assignedUserId:
      body.assignedUserId === '' ||
      body.assignedUserId === null ||
      body.assignedUserId === undefined
        ? null
        : Number(body.assignedUserId),
  };

  const validatedData = taskSchema.parse(requestData);

  if (validatedData.assignedUserId !== null) {
    if (!user.canAssignTasks) {
      throw makeError('You do not have permission to assign tasks', 403);
    }

    const assignedUser = await taskData.findAssignableUser(validatedData.assignedUserId);
    if (!assignedUser) {
      throw makeError('Assigned user must be a valid employee', 400);
    }
  }

  return taskData.createTask(validatedData);
};

exports.updateTask = async (idParam, body, user) => {
  if (!user.canEditTasks) {
    throw makeError('You do not have permission to edit tasks', 403);
  }

  const id = parseInt(idParam, 10);
  const existingTask = await taskData.findActiveTaskById(id);

  if (!existingTask) {
    throw makeError('Task not found', 404);
  }

  const requestData = {
    title: body.title,
    description: body.description,
    status: body.status,
  };

  if (Object.prototype.hasOwnProperty.call(body, 'assignedUserId')) {
    requestData.assignedUserId =
      body.assignedUserId === '' || body.assignedUserId === null
        ? null
        : Number(body.assignedUserId);
  }

  const validatedData = taskSchema.partial({ assignedUserId: true }).parse(requestData);

  if (Object.prototype.hasOwnProperty.call(validatedData, 'assignedUserId')) {
    if (validatedData.assignedUserId !== null) {
      if (!user.canAssignTasks) {
        throw makeError('You do not have permission to assign tasks', 403);
      }

      const assignedUser = await taskData.findAssignableUser(validatedData.assignedUserId);
      if (!assignedUser) {
        throw makeError('Assigned user must be a valid employee', 400);
      }
    } else if (!user.canAssignTasks) {
      throw makeError('You do not have permission to unassign tasks', 403);
    }
  }

  return taskData.updateTask(id, validatedData);
};

exports.deleteTask = async (idParam, user) => {
  if (!user.canDeleteTasks) {
    throw makeError('You do not have permission to delete tasks', 403);
  }

  const id = parseInt(idParam, 10);
  const existingTask = await taskData.findActiveTaskById(id);

  if (!existingTask) {
    throw makeError('Task not found', 404);
  }

  await taskData.softDeleteTask(id);
  return { message: 'Task deleted successfully' };
};