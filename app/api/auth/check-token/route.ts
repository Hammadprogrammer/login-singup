import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

/** GET /api/auth/check-token — session probe used by the navbar/account UI. */
export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) return NextResponse.json({ loggedIn: false }, { status: 401 });

  // Re-read the role from the DB so a demoted/deleted account loses access
  // immediately instead of at token expiry.
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!dbUser) return NextResponse.json({ loggedIn: false }, { status: 401 });

  return NextResponse.json({ loggedIn: true, user: dbUser });
}
