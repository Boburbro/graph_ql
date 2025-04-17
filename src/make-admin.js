require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeAdmin(email) {
    try {
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error(`User with email ${email} not found`);
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { isAdmin: true }
        });

        console.log(`User ${updatedUser.email} is now an admin`);
    } catch (error) {
        console.error('Error making user admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Pass email as command line argument
const email = process.argv[2] || 'boburotaboyev0@gmail.com';
makeAdmin(email); 