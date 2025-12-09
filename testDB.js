"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function test() {
    try {
        const users = await prisma.user.findMany();
        console.log("Users:", users);
        const sliders = await prisma.homeSlider.findMany();
        console.log("Home Sliders:", sliders);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        await prisma.$disconnect();
    }
}
test();
