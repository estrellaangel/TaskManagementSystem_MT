const prisma = require('../lib/prisma');
const { z } = require('zod');

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['Todo', 'In Progress', 'Done']),
  assignedUserId: z.number().nullable().optional(),
});

exports.getTasks = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;

    const { status, assignedUserId, search } = req.query;

    const where = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (search && search.trim()) {
      where.OR = [
        {
          title: {
            contains: search.trim(),
          },
        },
        {
          description: {
            contains: search.trim(),
          },
        },
      ];
    }

    const canViewAllTasks = Boolean(req.user.canAssignTasks);

    if (!canViewAllTasks) {
      where.assignedUserId = req.user.userId;
    } else if (assignedUserId) {
      if (assignedUserId === 'unassigned') {
        where.assignedUserId = null;
      } else {
        where.assignedUserId = parseInt(assignedUserId, 10);
      }
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedUser: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.task.count({ where }),
    ]);

    res.json({
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    if (!req.user.canCreateTasks) {
      return res.status(403).json({ message: 'You do not have permission to create tasks' });
    }

    const requestData = {
      ...req.body,
      assignedUserId:
        req.body.assignedUserId === '' ||
        req.body.assignedUserId === null ||
        req.body.assignedUserId === undefined
          ? null
          : Number(req.body.assignedUserId),
    };

    const validatedData = taskSchema.parse(requestData);

    if (validatedData.assignedUserId !== null) {
      if (!req.user.canAssignTasks) {
        return res.status(403).json({ message: 'You do not have permission to assign tasks' });
      }

      const assignedUser = await prisma.user.findFirst({
        where: {
          id: validatedData.assignedUserId,
          role: { in: ['manager', 'contributor'] },
        },
      });

      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user must be a valid employee' });
      }
    }

    const task = await prisma.task.create({
      data: validatedData,
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors });
    }
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    if (!req.user.canEditTasks) {
      return res.status(403).json({ message: 'You do not have permission to edit tasks' });
    }

    const id = parseInt(req.params.id, 10);

    const requestData = {
      ...req.body,
      assignedUserId:
        req.body.assignedUserId === '' ||
        req.body.assignedUserId === null ||
        req.body.assignedUserId === undefined
          ? null
          : Number(req.body.assignedUserId),
    };

    const validatedData = taskSchema.parse(requestData);

    const existingTask = await prisma.task.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (validatedData.assignedUserId !== null) {
      if (!req.user.canAssignTasks) {
        return res.status(403).json({ message: 'You do not have permission to assign tasks' });
      }

      const assignedUser = await prisma.user.findFirst({
        where: {
          id: validatedData.assignedUserId,
          role: { in: ['manager', 'contributor'] },
        },
      });

      if (!assignedUser) {
        return res.status(400).json({ message: 'Assigned user must be a valid employee' });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: validatedData,
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json(updatedTask);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: error.errors });
    }
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    if (!req.user.canDeleteTasks) {
      return res.status(403).json({ message: 'You do not have permission to delete tasks' });
    }

    const id = parseInt(req.params.id, 10);

    const existingTask = await prisma.task.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};