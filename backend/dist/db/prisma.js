"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
let prisma;
try {
    exports.prisma = prisma = new client_1.PrismaClient();
}
catch (error) {
    console.warn('Prisma client not yet generated, using fallback mode');
}
