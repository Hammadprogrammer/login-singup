import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  // 1. Total users
  const totalUsers = await prisma.user.count();

  // 2. Aaj ke users
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: startOfDay,
      },
    },
  });

  // 3. Recent users
  const recentUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      resetCode: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return NextResponse.json({
    totalUsers,
    todayUsers,
    recentUsers,
  });
}
