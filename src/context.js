const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get user from token
const getUserFromToken = async (token) => {
  if (!token) return null;
  
  try {
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch (error) {
    return null;
  }
};

// Create context for HTTP requests
const createContext = async ({ req }) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const user = await getUserFromToken(token);
  
  // Track login attempts for security
  const clientIp = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
  
  return {
    prisma,
    user,
    userId: user?.id,
    req, // Include the request object for IP tracking and rate limiting
    clientIp, // Add the client IP for easier access
  };
};

// Create context for WebSocket connections (subscriptions)
const createSubscriptionContext = async (ctx) => {
  const token = ctx.connectionParams?.authToken;
  const user = await getUserFromToken(token);
  
  return {
    prisma,
    user,
    userId: user?.id,
    // For WebSocket connections, we can't access the original request,
    // but we can add connectionInfo for logging purposes
    connectionInfo: {
      ip: ctx.extra?.request?.socket?.remoteAddress || 'unknown',
      userAgent: ctx.extra?.request?.headers['user-agent'] || 'unknown',
    }
  };
};

module.exports = {
  prisma,
  createContext,
  createSubscriptionContext,
}; 