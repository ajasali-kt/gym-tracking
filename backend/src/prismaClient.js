const { PrismaClient } = require('@prisma/client');

// Singleton pattern for Prisma Client
// Prevents multiple instances in development (hot reload)
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'], // Log only errors and warnings in production
    // Uncomment below for detailed query logging in development
    // log: ['query', 'info', 'warn', 'error'],
  });
};

// Global variable to store Prisma instance
const globalForPrisma = global;

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Export the Prisma client
module.exports = prisma;

// In development, store the instance globally to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
