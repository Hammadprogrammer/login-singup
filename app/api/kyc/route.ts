import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { KycStatus } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    
    // Agar token nahi hai to 401 Unauthorized bhejien
    if (!token) {
      return NextResponse.json({ authenticated: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const kyc = await prisma.kYC.findUnique({
      where: { userId: decoded.id },
      select: { status: true }
    });

    return NextResponse.json({ 
      authenticated: true,
      status: kyc?.status || "NOT_STARTED",
      userId: decoded.id 
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: "Invalid Session" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const body = await req.json();

    const kyc = await prisma.kYC.upsert({
      where: { userId: decoded.id },
      update: {
        fullName: body.fullName,
        fatherName: body.fatherName,
        documentType: body.documentType,
        documentNumber: body.documentNumber,
        documentExpiry: body.documentExpiry ? new Date(body.documentExpiry) : null,
        documentFront: body.documentFront, 
        documentBack: body.documentBack,
        faceImage: body.faceImage,
        status: KycStatus.PENDING,
      },
      create: {
        userId: decoded.id,
        fullName: body.fullName,
        fatherName: body.fatherName,
        documentType: body.documentType,
        documentNumber: body.documentNumber,
        documentExpiry: body.documentExpiry ? new Date(body.documentExpiry) : null,
        documentFront: body.documentFront,
        documentBack: body.documentBack,
        faceImage: body.faceImage,
        status: KycStatus.PENDING,
      },
    });

    return NextResponse.json({ success: true, data: kyc });
  } catch (error) {
    return NextResponse.json({ error: "Database saving failed" }, { status: 500 });
  }
}