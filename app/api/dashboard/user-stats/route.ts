import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  // 3. Recent users — NEVER expose resetCode / password hashes.
  const recentUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      provider: true,
      createdAt: true,
      _count: {
        select: { products: true, orders: true },
      },
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
