const authResolvers = require('./auth');
const todoResolvers = require('./todo');
const userResolvers = require('./user');
const chatResolvers = require('./chat');
const adminResolvers = require('./admin');

// Merge all resolvers
const resolvers = {
    Query: {
        ...userResolvers.Query,
        ...todoResolvers.Query,
        ...chatResolvers.Query,
        ...adminResolvers.Query,
    },
    Mutation: {
        ...authResolvers.Mutation,
        ...todoResolvers.Mutation,
        ...chatResolvers.Mutation,
        ...adminResolvers.Mutation,
    },
    Subscription: {
        ...chatResolvers.Subscription,
    },
    User: {
        ...userResolvers.User,
    },
    Todo: {
        ...todoResolvers.Todo,
    },
    ChatRoom: {
        ...chatResolvers.ChatRoom,
    },
    Message: {
        ...chatResolvers.Message,
    },
};

module.exports = resolvers; 