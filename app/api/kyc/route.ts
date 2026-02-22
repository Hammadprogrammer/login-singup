// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { KycStatus } from "@prisma/client";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET!;

// export async function GET(req: NextRequest) {
//   try {
//     const token = req.cookies.get("token")?.value;
    
//     // Agar token nahi hai to 401 Unauthorized bhejien
//     if (!token) {
//       return NextResponse.json({ authenticated: false, error: "Unauthorized" }, { status: 401 });
//     }

//     const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
//     const kyc = await prisma.kYC.findUnique({
//       where: { userId: decoded.id },
//       select: { status: true }
//     });

//     return NextResponse.json({ 
//       authenticated: true,
//       status: kyc?.status || "NOT_STARTED",
//       userId: decoded.id 
//     });
//   } catch (error) {
//     return NextResponse.json({ authenticated: false, error: "Invalid Session" }, { status: 401 });
//   }
// }

// export async function POST(req: NextRequest) {
//   try {
//     const token = req.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
//     const body = await req.json();

//     const kyc = await prisma.kYC.upsert({
//       where: { userId: decoded.id },
//       update: {
//         fullName: body.fullName,
//         fatherName: body.fatherName,
//         documentType: body.documentType,
//         documentNumber: body.documentNumber,
//         documentExpiry: body.documentExpiry ? new Date(body.documentExpiry) : null,
//         documentFront: body.documentFront, 
//         documentBack: body.documentBack,
//         faceImage: body.faceImage,
//         status: KycStatus.PENDING,
//       },
//       create: {
//         userId: decoded.id,
//         fullName: body.fullName,
//         fatherName: body.fatherName,
//         documentType: body.documentType,
//         documentNumber: body.documentNumber,
//         documentExpiry: body.documentExpiry ? new Date(body.documentExpiry) : null,
//         documentFront: body.documentFront,
//         documentBack: body.documentBack,
//         faceImage: body.faceImage,
//         status: KycStatus.PENDING,
//       },
//     });

//     return NextResponse.json({ success: true, data: kyc });
//   } catch (error) {
//     return NextResponse.json({ error: "Database saving failed" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { KycStatus, KycDocumentType } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

// GET: User ka status aur ID check karne ke liye
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const userId = Number(decoded.id);

    const kyc = await prisma.kYC.findUnique({
      where: { userId: userId },
    });

    return NextResponse.json({ 
      userId: userId, 
      status: kyc?.status || null, 
      reason: kyc?.rejectionReason || "" 
    });
  } catch (error) {
    return NextResponse.json({ error: "Auth failed" }, { status: 401 });
  }
}

// POST: KYC submit ya update karne ke liye
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const body = await req.json();
    const userId = Number(decoded.id);

    if (isNaN(userId)) throw new Error("Invalid User ID");

    // Date Parsing: DD-MM-YYYY -> DateTime object
    let parsedDate: Date | null = null;
    if (body.documentExpiry && body.documentExpiry.includes("-")) {
      const [d, m, y] = body.documentExpiry.split("-");
      parsedDate = new Date(`${y}-${m}-${d}T00:00:00Z`);
    }

    // Upsert logic according to your Schema
    const kyc = await prisma.kYC.upsert({
      where: { userId: userId },
      update: {
        fullName: body.fullName,
        fatherName: body.fatherName || null,
        documentType: body.documentType as KycDocumentType,
        documentNumber: body.documentNumber,
        documentExpiry: parsedDate,
        documentFront: body.documentFront,
        documentBack: body.documentBack,
        faceImage: body.faceImage,
        status: KycStatus.PENDING,
      },
      create: {
        userId: userId,
        fullName: body.fullName,
        fatherName: body.fatherName || null,
        documentType: body.documentType as KycDocumentType,
        documentNumber: body.documentNumber,
        documentExpiry: parsedDate,
        documentFront: body.documentFront,
        documentBack: body.documentBack,
        faceImage: body.faceImage,
        status: KycStatus.PENDING,
      },
    });

    return NextResponse.json({ success: true, data: kyc });
  } catch (error: any) {
    console.error("PRISMA_POST_ERROR:", error.message);
    return NextResponse.json({ error: "Submission failed", details: error.message }, { status: 500 });
  }
}