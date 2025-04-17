const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting to seed the database...');

    // Clean up existing data
    await prisma.message.deleteMany({});
    await prisma.chatRoom.deleteMany({});
    await prisma.todo.deleteMany({});
    await prisma.user.deleteMany({});

    // Create users
    const user1 = await prisma.user.create({
        data: {
            username: 'alice',
            email: 'alice@example.com',
            password: await bcrypt.hash('password123', 10),
        },
    });

    const user2 = await prisma.user.create({
        data: {
            username: 'bob',
            email: 'bob@example.com',
            password: await bcrypt.hash('password123', 10),
        },
    });

    console.log('Created users:', { user1, user2 });

    // Create todos for users
    const todo1 = await prisma.todo.create({
        data: {
            title: 'Learn GraphQL',
            description: 'Study Apollo Server and schema design',
            userId: user1.id,
        },
    });

    const todo2 = await prisma.todo.create({
        data: {
            title: 'Build a chat app',
            description: 'Implement real-time messaging with subscriptions',
            userId: user1.id,
        },
    });

    const todo3 = await prisma.todo.create({
        data: {
            title: 'Learn Prisma',
            description: 'Master Prisma ORM for database access',
            userId: user2.id,
        },
    });

    console.log('Created todos:', { todo1, todo2, todo3 });

    // Create chat rooms
    const generalRoom = await prisma.chatRoom.create({
        data: {
            name: 'General',
        },
    });

    const techRoom = await prisma.chatRoom.create({
        data: {
            name: 'Tech Talk',
        },
    });

    console.log('Created chat rooms:', { generalRoom, techRoom });

    // Create messages in rooms
    const message1 = await prisma.message.create({
        data: {
            content: 'Hello everyone!',
            userId: user1.id,
            roomId: generalRoom.id,
        },
    });

    const message2 = await prisma.message.create({
        data: {
            content: 'Hi Alice, welcome to the chat!',
            userId: user2.id,
            roomId: generalRoom.id,
        },
    });

    const message3 = await prisma.message.create({
        data: {
            content: 'Has anyone tried the new GraphQL features?',
            userId: user1.id,
            roomId: techRoom.id,
        },
    });

    console.log('Created messages:', { message1, message2, message3 });

    console.log('Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 