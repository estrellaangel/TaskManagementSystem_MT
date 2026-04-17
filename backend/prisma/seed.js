const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const managerDefaults = getDefaultPermissions('manager');
  const contributorDefaults = getDefaultPermissions('contributor');
  const adminDefaults = getDefaultPermissions('admin');

  const user1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: passwordHash,
      role: 'manager',
      ...managerDefaults,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: passwordHash,
      role: 'manager',
      ...managerDefaults,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Carol Davis',
      email: 'carol@example.com',
      password: passwordHash,
      role: 'contributor',
      ...contributorDefaults,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Diana Lopez',
      email: 'diana@example.com',
      password: passwordHash,
      role: 'admin',
      ...adminDefaults,
    },
  });

  const user5 = await prisma.user.create({
    data: {
      name: 'Ethan Miller',
      email: 'ethan@example.com',
      password: passwordHash,
      role: 'manager',
      ...managerDefaults,
    },
  });

  const user6 = await prisma.user.create({
    data: {
      name: 'Faith Nguyen',
      email: 'faith@example.com',
      password: passwordHash,
      role: 'contributor',
      ...contributorDefaults,
    },
  });

  const user7 = await prisma.user.create({
    data: {
      name: 'Gabriel Torres',
      email: 'gabriel@example.com',
      password: passwordHash,
      role: 'contributor',
      ...contributorDefaults,
    },
  });

  const user8 = await prisma.user.create({
    data: {
      name: 'Hannah Brooks',
      email: 'hannah@example.com',
      password: passwordHash,
      role: 'contributor',
      ...contributorDefaults,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Set up project repo',
        description: 'Create frontend and backend folders',
        status: 'Todo',
        assignedUserId: user1.id,
      },
      {
        title: 'Build login page',
        description: 'Create mock auth UI',
        status: 'In Progress',
        assignedUserId: user2.id,
      },
      {
        title: 'Write API docs',
        description: 'Document all endpoints',
        status: 'Done',
        assignedUserId: user3.id,
      },

      {
        title: 'Design task creation modal',
        description: 'Create a modal for adding new tasks from the task page',
        status: 'Todo',
        assignedUserId: user6.id,
      },
      {
        title: 'Improve mobile responsiveness',
        description: 'Adjust task table layout for smaller screens',
        status: 'In Progress',
        assignedUserId: user7.id,
      },
      {
        title: 'Add logout handling',
        description: 'Clear local storage and redirect to login page',
        status: 'Done',
        assignedUserId: user8.id,
      },
      {
        title: 'Review contributor permissions',
        description: 'Verify contributors only see tasks assigned to them',
        status: 'Todo',
        assignedUserId: user5.id,
      },
      {
        title: 'Seed additional user accounts',
        description: 'Expand the local database with more test users',
        status: 'Done',
        assignedUserId: user4.id,
      },
      {
        title: 'Polish edit task workflow',
        description: 'Test task editing and validation errors thoroughly',
        status: 'In Progress',
        assignedUserId: user3.id,
      },
      {
        title: 'Create loading indicators',
        description: 'Show user feedback during task fetches and updates',
        status: 'Todo',
        assignedUserId: null,
      },
      {
        title: 'Audit task assignment logic',
        description: 'Double-check that managers can assign valid employees',
        status: 'In Progress',
        assignedUserId: user1.id,
      },
      {
        title: 'Draft README architecture section',
        description: 'Explain frontend, backend, and database structure',
        status: 'Todo',
        assignedUserId: null,
      },
      {
        title: 'Test pagination edge cases',
        description: 'Verify page switching works correctly with different task counts',
        status: 'Todo',
        assignedUserId: user6.id,
      },
    ],
  });

  console.log('Seeded database');
}

function getDefaultPermissions(role) {
  if (role === 'admin') {
    return {
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canAssignTasks: true,
      canViewAllTasks: true,
    };
  }

  if (role === 'manager') {
    return {
      canCreateTasks: true,
      canEditTasks: true,
      canDeleteTasks: true,
      canAssignTasks: true,
      canViewAllTasks: true,
    };
  }

  return {
    canCreateTasks: false,
    canEditTasks: true,
    canDeleteTasks: false,
    canAssignTasks: false,
    canViewAllTasks: false,
  };
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });