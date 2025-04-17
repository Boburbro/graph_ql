const { GraphQLError } = require('graphql');

// Simple rate limiter for security code attempts
const securityCodeAttempts = {};
const MAX_CODE_ATTEMPTS = 3;
const CODE_BLOCK_DURATION = 60 * 60 * 1000; // 1 hour

// Check if user is admin middleware with rate limiting
const isAdmin = (resolver) => {
    // Simple in-memory rate limiting
    const loginAttempts = {};
    const MAX_ATTEMPTS = 5;
    const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes

    return async (parent, args, context, info) => {
        const { userId, user, prisma, req } = context;

        // Get client IP for rate limiting
        const clientIp = req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || 'unknown';

        // Check rate limiting
        if (loginAttempts[clientIp]) {
            const { count, timestamp } = loginAttempts[clientIp];
            const timeElapsed = Date.now() - timestamp;

            if (count >= MAX_ATTEMPTS && timeElapsed < BLOCK_DURATION) {
                throw new GraphQLError('Too many access attempts, please try again later', {
                    extensions: { code: 'TOO_MANY_REQUESTS' },
                });
            }

            // Reset counter after block duration
            if (timeElapsed >= BLOCK_DURATION) {
                loginAttempts[clientIp] = { count: 1, timestamp: Date.now() };
            } else {
                loginAttempts[clientIp].count += 1;
            }
        } else {
            loginAttempts[clientIp] = { count: 1, timestamp: Date.now() };
        }

        if (!userId) {
            throw new GraphQLError('You must be logged in', {
                extensions: { code: 'UNAUTHENTICATED' },
            });
        }

        if (!user.isAdmin) {
            console.warn(`Unauthorized admin access attempt by user ID: ${userId}, Email: ${user.email}`);
            throw new GraphQLError('Requires admin access', {
                extensions: { code: 'FORBIDDEN' },
            });
        }

        // Log successful admin operation
        console.log(`Admin operation by: ${user.email}, IP: ${clientIp}, Operation: ${info.fieldName}`);

        return resolver(parent, args, context, info);
    };
};

const adminResolvers = {
    Query: {
        // Get statistics for admin dashboard
        adminStats: isAdmin(async (_, __, { prisma }) => {
            const [
                totalUsers,
                verifiedUsers,
                totalTodos,
                completedTodos,
                totalChatRooms,
                totalMessages
            ] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { isVerified: true } }),
                prisma.todo.count(),
                prisma.todo.count({ where: { completed: true } }),
                prisma.chatRoom.count(),
                prisma.message.count()
            ]);

            return {
                totalUsers,
                verifiedUsers,
                totalTodos,
                completedTodos,
                totalChatRooms,
                totalMessages
            };
        }),

        // Get all users for admin management
        allUsers: isAdmin(async (_, __, { prisma }) => {
            return prisma.user.findMany({
                orderBy: { createdAt: 'desc' }
            });
        }),
    },

    Mutation: {
        // Verify admin security code
        verifyAdminSecurityCode: async (_, { code }, { req }) => {
            // Get client IP for rate limiting
            const clientIp = req?.headers['x-forwarded-for'] || req?.connection?.remoteAddress || 'unknown';

            // Check rate limiting for security code attempts
            if (securityCodeAttempts[clientIp]) {
                const { count, timestamp } = securityCodeAttempts[clientIp];
                const timeElapsed = Date.now() - timestamp;

                if (count >= MAX_CODE_ATTEMPTS && timeElapsed < CODE_BLOCK_DURATION) {
                    console.warn(`Security code verification blocked due to too many attempts from IP: ${clientIp}`);
                    throw new GraphQLError('Too many verification attempts, please try again later', {
                        extensions: { code: 'TOO_MANY_REQUESTS' },
                    });
                }

                // Reset counter after block duration
                if (timeElapsed >= CODE_BLOCK_DURATION) {
                    securityCodeAttempts[clientIp] = { count: 1, timestamp: Date.now() };
                } else {
                    securityCodeAttempts[clientIp].count += 1;
                }
            } else {
                securityCodeAttempts[clientIp] = { count: 1, timestamp: Date.now() };
            }

            // Verify the security code against environment variable
            const correctCode = process.env.ADMIN_SECURITY_CODE;

            if (!correctCode) {
                console.error('ADMIN_SECURITY_CODE not set in environment variables');
                throw new GraphQLError('Server configuration error', {
                    extensions: { code: 'INTERNAL_SERVER_ERROR' },
                });
            }

            if (code !== correctCode) {
                console.warn(`Invalid security code attempt from IP: ${clientIp}`);
                throw new GraphQLError('Invalid security code', {
                    extensions: { code: 'UNAUTHENTICATED' },
                });
            }

            return true;
        },

        // Set admin status for a user
        setAdminStatus: isAdmin(async (_, { userId, isAdmin }, { prisma, user }) => {
            const id = parseInt(userId);

            // Prevent removing admin privileges from yourself
            if (user.id === id && !isAdmin) {
                throw new GraphQLError('You cannot remove your own admin privileges', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }

            const targetUser = await prisma.user.findUnique({
                where: { id }
            });

            if (!targetUser) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            return prisma.user.update({
                where: { id },
                data: { isAdmin }
            });
        }),

        // Delete a user and all their data
        deleteUser: isAdmin(async (_, { userId }, { prisma, user }) => {
            const id = parseInt(userId);

            // Prevent deleting yourself
            if (user.id === id) {
                throw new GraphQLError('You cannot delete your own account', {
                    extensions: { code: 'BAD_USER_INPUT' },
                });
            }

            const targetUser = await prisma.user.findUnique({
                where: { id }
            });

            if (!targetUser) {
                throw new GraphQLError('User not found', {
                    extensions: { code: 'NOT_FOUND' },
                });
            }

            // Delete associated data first
            await prisma.message.deleteMany({ where: { userId: id } });
            await prisma.todo.deleteMany({ where: { userId: id } });

            // Delete the user
            await prisma.user.delete({ where: { id } });

            return true;
        }),
    }
};

module.exports = adminResolvers; 