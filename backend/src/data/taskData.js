const prisma = require('../lib/prisma');

exports.getTasks = async ({
  status,
  assignedUserId,
  search,
  canViewAllTasks,
  userId,
  page,
  limit,
}) => {
  const skip = (page - 1) * limit;

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

  if (!canViewAllTasks) {
    where.assignedUserId = userId;
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

  return {
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

exports.findAssignableUser = async (id) => {
  return prisma.user.findFirst({
    where: {
      id,
      role: { in: ['manager', 'contributor'] },
    },
  });
};

exports.findActiveTaskById = async (id) => {
  return prisma.task.findFirst({
    where: { id, deletedAt: null },
  });
};

exports.createTask = async (data) => {
  return prisma.task.create({
    data,
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
};

exports.updateTask = async (id, data) => {
  return prisma.task.update({
    where: { id },
    data,
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
};

exports.softDeleteTask = async (id) => {
  return prisma.task.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
};