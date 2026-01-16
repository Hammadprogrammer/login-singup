// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/lib/prisma";
// import { v2 as cloudinary } from "cloudinary";
// import { KycStatus } from "@prisma/client";
// import jwt from "jsonwebtoken";

// const JWT_SECRET = process.env.JWT_SECRET!;

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // ✅ GET: KYC Status check karne ke liye
// export async function GET(req: NextRequest) {
//   try {
//     const token = req.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
//     const kyc = await prisma.kYC.findUnique({
//       where: { userId: decoded.id },
//       select: { status: true }
//     });

//     return NextResponse.json({ 
//       isLoggedIn: true, 
//       status: kyc?.status || "NOT_STARTED" 
//     });
//   } catch (error) {
//     return NextResponse.json({ error: "Invalid Session" }, { status: 401 });
//   }
// }

// // ✅ POST: KYC Data submit karne ke liye
// export async function POST(req: NextRequest) {
//   try {
//     const token = req.cookies.get("token")?.value;
//     if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
//     const userId = decoded.id;

//     const body = await req.json();
//     const { documentFront, documentBack, faceImage, ...rest } = body;

//     const uploadToCloudinary = async (base64: string, folder: string) => {
//       if (!base64 || !base64.startsWith("data:image")) return base64;
//       const res = await cloudinary.uploader.upload(base64, {
//         folder: `kyc/${userId}/${folder}`,
//       });
//       return res.secure_url;
//     };

//     const [frontUrl, backUrl, faceUrl] = await Promise.all([
//       uploadToCloudinary(documentFront, "documents"),
//       uploadToCloudinary(documentBack, "documents"),
//       uploadToCloudinary(faceImage, "faces"),
//     ]);

//     const kyc = await prisma.kYC.upsert({
//       where: { userId },
//       update: {
//         fullName: rest.fullName,
//         fatherName: rest.fatherName,
//         documentType: rest.docType,
//         documentNumber: rest.docNum,
//         documentExpiry: rest.docExpiry ? new Date(rest.docExpiry) : null,
//         documentFront: frontUrl,
//         documentBack: backUrl,
//         faceImage: faceUrl,
//         status: KycStatus.PENDING,
//       },
//       create: {
//         userId,
//         fullName: rest.fullName,
//         fatherName: rest.fatherName,
//         documentType: rest.docType,
//         documentNumber: rest.docNum,
//         documentExpiry: rest.docExpiry ? new Date(rest.docExpiry) : null,
//         documentFront: frontUrl,
//         documentBack: backUrl,
//         faceImage: faceUrl,
//         status: KycStatus.PENDING,
//       },
//     });

//     return NextResponse.json({ success: true, data: kyc });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Server Error" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { KycStatus } from "@prisma/client";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const kyc = await prisma.kYC.findUnique({
      where: { userId: decoded.id },
      select: { status: true }
    });

    return NextResponse.json({ status: kyc?.status || "NOT_STARTED" });
  } catch (error) {
    return NextResponse.json({ error: "Invalid Session" }, { status: 401 });
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
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}