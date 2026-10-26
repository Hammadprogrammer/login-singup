import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
import { signedPrivateUrl } from "@/lib/cloudinary";
import { cleanString, toInt } from "@/lib/validate";

/**
 * GET /api/admin/kyc — admin only.
 * Document images are returned as SHORT-LIVED SIGNED URLs (15 min) so they
 * can be reviewed in the panel but never linked publicly.
 */
export async function GET(req: NextRequest) {
  try {
    if (!requireAdmin(req)) return FORBIDDEN();

    const kycs = await prisma.kYC.findMany({
      include: { user: { select: { id: true, email: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      kycs.map((k) => ({
        ...k,
        documentFront: signedPrivateUrl(k.documentFront),
        documentBack: signedPrivateUrl(k.documentBack),
        faceImage: signedPrivateUrl(k.faceImage),
      }))
    );
  } catch (error) {
    console.error("ADMIN_KYC_GET_ERROR:", error);
    return NextResponse.json({ error: "Failed to load KYC" }, { status: 500 });
  }
}

/** PATCH /api/admin/kyc — approve / reject. Body: { id, status, rejectionReason? } */
export async function PATCH(req: NextRequest) {
  try {
    if (!requireAdmin(req)) return FORBIDDEN();

    const body = await req.json().catch(() => ({}));
    const id = toInt(body.id);
    const status = body.status;
    const rejectionReason = cleanString(body.rejectionReason, 500);

    if (!id || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Valid id and status required" }, { status: 400 });
    }
    if (status === "REJECTED" && rejectionReason.length < 3) {
      return NextResponse.json({ error: "A rejection reason is required" }, { status: 400 });
    }

    const updated = await prisma.kYC.update({
      where: { id },
      data: { status, rejectionReason: status === "REJECTED" ? rejectionReason : null },
      select: { id: true, status: true, rejectionReason: true, updatedAt: true },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("ADMIN_KYC_PATCH_ERROR:", error);
    return NextResponse.json({ error: "Failed to update KYC" }, { status: 500 });
  }
}
