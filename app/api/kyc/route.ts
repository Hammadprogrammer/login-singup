import { NextRequest, NextResponse } from "next/server";
import { KycDocumentType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireUser, UNAUTHORIZED } from "@/lib/auth";
import { uploadPrivateImage, destroyByUrl } from "@/lib/cloudinary";
import { CLOUDINARY_FOLDERS } from "@/lib/site";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { cleanText, validateImageFile } from "@/lib/validate";

const DOC_TYPES = Object.values(KycDocumentType);

/**
 * GET /api/kyc — the user's own verification status.
 * Document images are NEVER returned here (only admins can view them, via signed URLs).
 */
export async function GET(req: NextRequest) {
  const user = requireUser(req);
  if (!user) return UNAUTHORIZED();

  const kyc = await prisma.kYC.findUnique({
    where: { userId: user.id },
    select: { status: true, rejectionReason: true, fullName: true, documentType: true, updatedAt: true },
  });

  return NextResponse.json({
    userId: user.id,
    status: kyc?.status ?? null,
    reason: kyc?.rejectionReason ?? "",
    fullName: kyc?.fullName ?? null,
    documentType: kyc?.documentType ?? null,
    updatedAt: kyc?.updatedAt ?? null,
  });
}

/** Accepts DD-MM-YYYY or YYYY-MM-DD; must be a real date in the future. */
function parseExpiry(raw: string): Date | null {
  let y: number, m: number, d: number;
  const dmy = raw.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  const ymd = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dmy) [d, m, y] = [+dmy[1], +dmy[2], +dmy[3]];
  else if (ymd) [y, m, d] = [+ymd[1], +ymd[2], +ymd[3]];
  else return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date;
}

function validDocNumber(type: KycDocumentType, num: string) {
  switch (type) {
    case "CNIC":
      return /^\d{13}$/.test(num);
    case "PASSPORT":
      return /^[A-Z0-9]{6,12}$/i.test(num);
    case "DRIVING_LICENSE":
      return /^[A-Z0-9-]{5,20}$/i.test(num);
  }
}

/**
 * POST /api/kyc — multipart submission:
 *   fullName, fatherName?, documentType, documentNumber, documentExpiry?,
 *   documentFront (file), documentBack (file), faceImage (file)
 * Files are uploaded server-side to Cloudinary as *authenticated* assets.
 */
export async function POST(req: NextRequest) {
  try {
    const user = requireUser(req);
    if (!user) return UNAUTHORIZED();
    const limited = enforceRateLimit(req, "kyc", LIMITS.kyc);
    if (limited) return limited;

    const existing = await prisma.kYC.findUnique({ where: { userId: user.id } });
    if (existing && existing.status !== "REJECTED") {
      return NextResponse.json({ error: "Your verification is already submitted" }, { status: 409 });
    }

    const fd = await req.formData();
    const fullName = cleanText(fd.get("fullName"), 100);
    const fatherName = cleanText(fd.get("fatherName"), 100);
    const documentType = String(fd.get("documentType") || "") as KycDocumentType;
    const documentNumber = cleanText(fd.get("documentNumber"), 30).replace(/\s|-/g, "");
    const expiryRaw = cleanText(fd.get("documentExpiry"), 10);

    if (fullName.length < 3) return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    if (!DOC_TYPES.includes(documentType)) return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    if (!validDocNumber(documentType, documentNumber)) {
      return NextResponse.json({ error: "Document number format is invalid" }, { status: 400 });
    }
    let documentExpiry: Date | null = null;
    if (expiryRaw) {
      documentExpiry = parseExpiry(expiryRaw);
      if (!documentExpiry) return NextResponse.json({ error: "Expiry date is invalid (use DD-MM-YYYY)" }, { status: 400 });
      if (documentExpiry < new Date()) return NextResponse.json({ error: "This document has expired" }, { status: 400 });
    }

    const files = {
      documentFront: fd.get("documentFront"),
      documentBack: fd.get("documentBack"),
      faceImage: fd.get("faceImage"),
    };
    for (const [k, f] of Object.entries(files)) {
      if (!validateImageFile(f)) {
        return NextResponse.json({ error: `${k === "faceImage" ? "Selfie" : "Document image"} must be a JPG/PNG/WEBP under 6 MB` }, { status: 400 });
      }
    }

    const folder = CLOUDINARY_FOLDERS.kyc(user.id);
    const [front, back, face] = await Promise.all([
      uploadPrivateImage(files.documentFront as File, `${folder}/documents`),
      uploadPrivateImage(files.documentBack as File, `${folder}/documents`),
      uploadPrivateImage(files.faceImage as File, `${folder}/face`),
    ]);

    const data = {
      fullName,
      fatherName: fatherName || null,
      documentType,
      documentNumber,
      documentExpiry,
      documentFront: front,
      documentBack: back,
      faceImage: face,
      status: "PENDING" as const,
      rejectionReason: null,
    };

    const kyc = await prisma.kYC.upsert({
      where: { userId: user.id },
      update: data,
      create: { userId: user.id, ...data },
      select: { status: true, updatedAt: true },
    });

    // Remove superseded documents from a previous (rejected) submission.
    if (existing) {
      await Promise.all(
        [existing.documentFront, existing.documentBack, existing.faceImage].map((p) => destroyByUrl(p, "authenticated"))
      );
    }

    return NextResponse.json({ success: true, data: kyc });
  } catch (error) {
    console.error("KYC_POST_ERROR:", error);
    return NextResponse.json({ error: "Submission failed. Please try again." }, { status: 500 });
  }
}
