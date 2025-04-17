const { GraphQLError } = require('graphql');

const userResolvers = {
    Query: {
        // Get the currently authenticated user
        async me(_, __, { prisma, userId }) {
            if (!userId) {
                return null; // This is fine - we allow unauthenticated access to check login status
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
            });

            if (!user) {
                throw new GraphQLError('User not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                    },
                });
            }

            return user;
        },
    },

    // Field resolvers
    User: {
        // Resolve the todos field
        todos: (parent, _, { prisma }) => {
            return prisma.todo.findMany({
                where: { userId: parent.id },
                orderBy: { createdAt: 'desc' },
            });
        },
    },
};

module.exports = userResolvers; 