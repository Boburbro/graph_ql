const { PubSub, withFilter } = require('graphql-subscriptions');
const { GraphQLError } = require('graphql');

const pubsub = new PubSub();
const NEW_MESSAGE = 'NEW_MESSAGE';

const chatResolvers = {
    Query: {
        // Get all chat rooms
        async chatRooms(_, __, { prisma, userId }) {
            if (!userId) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            return prisma.chatRoom.findMany({
                orderBy: { createdAt: 'desc' },
            });
        },

        // Get a single chat room by ID
        async chatRoom(_, { id }, { prisma, userId }) {
            if (!userId) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            const room = await prisma.chatRoom.findUnique({
                where: { id: parseInt(id) },
            });

            if (!room) {
                throw new GraphQLError('Chat room not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                    },
                });
            }

            return room;
        },

        // Get messages for a chat room
        async messages(_, { roomId }, { prisma, userId }) {
            if (!userId) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            // Check if room exists
            const room = await prisma.chatRoom.findUnique({
                where: { id: parseInt(roomId) },
            });

            if (!room) {
                throw new GraphQLError('Chat room not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                    },
                });
            }

            return prisma.message.findMany({
                where: { roomId: parseInt(roomId) },
                orderBy: { createdAt: 'asc' },
            });
        },
    },

    Mutation: {
        // Create a new chat room
        async createChatRoom(_, { name }, { prisma, userId }) {
            if (!userId) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            return prisma.chatRoom.create({
                data: { name },
            });
        },

        // Send a message
        async sendMessage(_, { content, roomId }, { prisma, userId }) {
            if (!userId) {
                throw new GraphQLError('Authentication required', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                    },
                });
            }

            // Check if room exists
            const room = await prisma.chatRoom.findUnique({
                where: { id: parseInt(roomId) },
            });

            if (!room) {
                throw new GraphQLError('Chat room not found', {
                    extensions: {
                        code: 'NOT_FOUND',
                    },
                });
            }

            // Create the message
            const message = await prisma.message.create({
                data: {
                    content,
                    user: { connect: { id: userId } },
                    room: { connect: { id: parseInt(roomId) } },
                },
                include: {
                    user: true,
                    room: true,
                },
            });

            // Publish to subscription
            pubsub.publish(NEW_MESSAGE, { newMessage: message });

            return message;
        },
    },

    Subscription: {
        // Subscribe to new messages in a room
        newMessage: {
            subscribe: withFilter(
                () => pubsub.asyncIterator([NEW_MESSAGE]),
                (payload, variables) => {
                    // Only send to clients subscribed to the specific room
                    return payload.newMessage.roomId === parseInt(variables.roomId);
                }
            ),
        },
    },

    // Field resolvers
    ChatRoom: {
        // Resolve the messages field
        messages: (parent, _, { prisma }) => {
            return prisma.message.findMany({
                where: { roomId: parent.id },
                orderBy: { createdAt: 'asc' },
            });
        },
    },

    Message: {
        // Resolve the user field
        user: (parent, _, { prisma }) => {
            return prisma.user.findUnique({
                where: { id: parent.userId },
            });
        },
        // Resolve the room field
        room: (parent, _, { prisma }) => {
            return prisma.chatRoom.findUnique({
                where: { id: parent.roomId },
            });
        },
    },
};

module.exports = chatResolvers; 