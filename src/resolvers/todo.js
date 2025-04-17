const { GraphQLError } = require('graphql');

const todoResolvers = {
    Query: {
        // Get all todos for the authenticated user
        async todos(_, __, { prisma, userId }) {
            if (!userId) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            return prisma.todo.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
        },

        // Get a single todo by ID
        async todo(_, { id }, { prisma, userId }) {
            if (!userId) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            const todo = await prisma.todo.findUnique({
                where: { id: parseInt(id) },
            });

            // Check if todo exists and belongs to user
            if (!todo) {
                throw new GraphQLError('Todo not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                    },
                });
            }

            if (todo.userId !== userId) {
                throw new GraphQLError('You do not have permission to access this todo', {
                    extensions: {
                        code: 'FORBIDDEN',
                    },
                });
            }

            return todo;
        },
    },

    Mutation: {
        // Create a new todo
        async createTodo(_, { title, description }, { prisma, userId }) {
            if (!userId) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            return prisma.todo.create({
                data: {
                    title,
                    description,
                    user: { connect: { id: userId } },
                },
            });
        },

        // Update a todo
        async updateTodo(_, { id, title, description, completed }, { prisma, userId }) {
            if (!userId) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            // Get the todo
            const todo = await prisma.todo.findUnique({
                where: { id: parseInt(id) },
            });

            // Check if todo exists
            if (!todo) {
                throw new GraphQLError('Todo not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                    },
                });
            }

            // Check if todo belongs to user
            if (todo.userId !== userId) {
                throw new GraphQLError('You do not have permission to update this todo', {
                    extensions: {
                        code: 'FORBIDDEN',
                    },
                });
            }

            // Update the todo
            return prisma.todo.update({
                where: { id: parseInt(id) },
                data: {
                    ...(title !== undefined && { title }),
                    ...(description !== undefined && { description }),
                    ...(completed !== undefined && { completed }),
                },
            });
        },

        // Delete a todo
        async deleteTodo(_, { id }, { prisma, userId }) {
            if (!userId) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            // Get the todo
            const todo = await prisma.todo.findUnique({
                where: { id: parseInt(id) },
            });

            // Check if todo exists
            if (!todo) {
                throw new GraphQLError('Todo not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                    },
                });
            }

            // Check if todo belongs to user
            if (todo.userId !== userId) {
                throw new GraphQLError('You do not have permission to delete this todo', {
                    extensions: {
                        code: 'FORBIDDEN',
                    },
                });
            }

            // Delete the todo
            await prisma.todo.delete({
                where: { id: parseInt(id) },
            });

            return true;
        },
    },

    // Field resolvers
    Todo: {
        // Resolve the user field
        user: (parent, _, { prisma }) => {
            return prisma.user.findUnique({
                where: { id: parent.userId },
            });
        },
    },
};

module.exports = todoResolvers; 