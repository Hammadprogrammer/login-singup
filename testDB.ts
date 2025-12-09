import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function test() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users:", users);

    const sliders = await prisma.homeSlider.findMany();
    console.log("Home Sliders:", sliders);
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
