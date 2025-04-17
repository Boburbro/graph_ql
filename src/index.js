require('dotenv').config();
const http = require('http');
const { createServer } = require('http');
const express = require('express');
const path = require('path');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginLandingPageLocalDefault } = require('@apollo/server/plugin/landingPage/default');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { GraphQLError } = require('graphql');

// Import schema and resolvers
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const { createContext, createSubscriptionContext } = require('./context');
const emailService = require('./services/emailService');

// Custom error formatting function
const formatError = (formattedError, error) => {
    // Check for authentication errors
    if (
        formattedError.message.includes('Authentication required') ||
        formattedError.message.includes('Not authenticated')
    ) {
        return {
            message: 'You must be logged in to perform this action',
            extensions: {
                code: 'UNAUTHENTICATED',
                http: { status: 401 }
            }
        };
    }

    // Check for authorization errors
    if (
        formattedError.message.includes('access denied') ||
        formattedError.message.includes('not authorized')
    ) {
        return {
            message: 'You do not have permission to perform this action',
            extensions: {
                code: 'FORBIDDEN',
                http: { status: 403 }
            }
        };
    }

    // Remove internal server details from other errors in production
    if (process.env.NODE_ENV === 'production') {
        delete formattedError.extensions?.stacktrace;

        // Keep only relevant error information
        return {
            message: formattedError.message,
            extensions: {
                code: formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR'
            }
        };
    }

    // Return the original formatted error
    return formattedError;
};

async function startServer() {
    // Create Express app
    const app = express();
    const httpServer = createServer(app);

    // Initialize email service
    try {
        await emailService.setupTransporter();
        console.log('Email service initialized successfully');
    } catch (error) {
        console.error('Failed to initialize email service:', error);
        console.log('Server will continue without email functionality');
    }

    // Serve static files from the public directory
    app.use(express.static(path.join(__dirname, '../public')));

    // Create schema from TypeDefs and Resolvers
    const schema = makeExecutableSchema({ typeDefs, resolvers });

    // Create WebSocket server
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    // Create WebSocket server for GraphQL subscriptions
    const serverCleanup = useServer(
        {
            schema,
            context: createSubscriptionContext,
        },
        wsServer
    );

    // Create Apollo Server
    const server = new ApolloServer({
        schema,
        formatError,
        plugins: [
            // Proper shutdown for the HTTP server
            ApolloServerPluginDrainHttpServer({ httpServer }),
            // Proper shutdown for the WebSocket server
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
            // Add Apollo Explorer as a UI
            ApolloServerPluginLandingPageLocalDefault({
                embed: true,
                includeCookies: false,
            }),
        ],
        introspection: true,
    });

    // Start Apollo Server
    await server.start();

    // Apply Express middleware
    app.use(
        '/graphql',
        express.json(),
        expressMiddleware(server, {
            context: createContext,
        })
    );

    // Add documentation route
    app.get('/docs', (req, res) => {
        res.sendFile(path.join(__dirname, '../public/docs.html'));
    });

    // Root route redirects to admin page
    app.get('/', (req, res) => {
        res.redirect('/admin.html');
    });

    // Start the server
    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}/graphql`);
        console.log(`GraphQL Documentation UI available at http://localhost:${PORT}/graphql`);
        console.log(`API Documentation available at http://localhost:${PORT}/docs`);
        console.log(`Admin panel available at http://localhost:${PORT}/admin.html`);
        console.log(`Subscriptions are available at ws://localhost:${PORT}/graphql`);
    });
}

startServer().catch((err) => {
    console.error('Error starting server:', err);
}); 