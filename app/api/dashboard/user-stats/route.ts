import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
import { cleanText, toInt } from "@/lib/validate";

/**
 * GET /api/dashboard/user-stats — admin customer directory.
 *   ?q=<name/email>  ?role=USER|ADMIN  ?kyc=APPROVED|PENDING|REJECTED|NONE
 *   ?page=1 ?pageSize=25
 * Never exposes password hashes or reset codes.
 */
export async function GET(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();

  const sp = req.nextUrl.searchParams;
  const q = cleanText(sp.get("q"), 80);
  const role = sp.get("role");
  const kyc = sp.get("kyc");
  const page = Math.max(1, toInt(sp.get("page"), 1));
  const pageSize = Math.min(100, Math.max(5, toInt(sp.get("pageSize"), 25)));

  const where: Prisma.UserWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
    if (/^\d+$/.test(q)) where.OR.push({ id: Number(q) });
  }
  if (role === "USER" || role === "ADMIN") where.role = role;
  if (kyc === "NONE") where.kyc = null;
  else if (kyc === "APPROVED" || kyc === "PENDING" || kyc === "REJECTED") where.kyc = { status: kyc };

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalUsers, todayUsers, verifiedUsers, total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.kYC.count({ where: { status: "APPROVED" } }),
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        provider: true,
        createdAt: true,
        kyc: { select: { status: true } },
        _count: { select: { orders: true, reviews: true } },
        orders: { select: { totalAmount: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const recentUsers = users.map(({ orders, ...u }) => ({
    ...u,
    totalSpent: orders.filter((o) => o.status !== "CANCELLED").reduce((a, o) => a + o.totalAmount, 0),
  }));

  return NextResponse.json({
    totalUsers,
    todayUsers,
    verifiedUsers,
    recentUsers,
    pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
  });
}
