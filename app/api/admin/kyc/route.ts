import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/* GET ALL KYC */
export async function GET() {
  try {
    const kycs = await prisma.kYC.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(kycs);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load KYC" },
      { status: 500 }
    );
  }
}

/* APPROVE / REJECT */
export async function PATCH(req: Request) {
  try {
    const { id, status, rejectionReason } = await req.json();

    const updated = await prisma.kYC.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update KYC" },
      { status: 500 }
    );
  }
}
