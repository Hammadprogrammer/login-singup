import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { KycStatus } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const body = await req.json();

    const { 
      fullName, fatherName, documentType, documentNumber, 
      documentExpiry, documentFront, documentBack, faceImage 
    } = body;

    // Simple Validation
    if (!fullName || !documentFront || !faceImage) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const kyc = await prisma.kYC.upsert({
      where: { userId: decoded.id },
      update: {
        fullName,
        fatherName,
        documentType,
        documentNumber,
        documentExpiry: documentExpiry ? new Date(documentExpiry) : null,
        documentFront, 
        documentBack,
        faceImage,
        status: KycStatus.PENDING,
      },
      create: {
        userId: decoded.id,
        fullName,
        fatherName,
        documentType,
        documentNumber,
        documentExpiry: documentExpiry ? new Date(documentExpiry) : null,
        documentFront,
        documentBack,
        faceImage,
        status: KycStatus.PENDING,
      },
    });

    return NextResponse.json({ success: true, data: kyc });
  } catch (error) {
    console.error("KYC_API_ERROR:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}