import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.warn('Prisma client not yet generated, using fallback mode');
}

export { prisma };
