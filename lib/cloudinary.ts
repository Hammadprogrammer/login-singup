import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_ROOT } from "./site";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

export default cloudinary;

/** Serialize a File into a data URI the Cloudinary SDK accepts. */
async function fileToDataUri(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return `data:${file.type};base64,${buffer.toString("base64")}`;
}

/**
 * Upload a PUBLIC image (products, home content). Returns the secure URL.
 * Everything is forced under the `mens_store/` root folder.
 */
export async function uploadPublicImage(file: File, folder: string): Promise<string> {
  const safeFolder = folder.startsWith(CLOUDINARY_ROOT) ? folder : `${CLOUDINARY_ROOT}/${folder}`;
  const result = await cloudinary.uploader.upload(await fileToDataUri(file), {
    folder: safeFolder,
    resource_type: "image",
    overwrite: false,
    // Strip EXIF/GPS metadata from customer-facing images.
    transformation: [{ flags: "strip_profile" }],
  });
  return result.secure_url;
}

/**
 * Upload a PRIVATE image (KYC documents). Stored as `type: authenticated`,
 * which means Cloudinary refuses to serve it without a valid signature.
 * Returns the public_id — never a plain URL — so nothing shareable is persisted.
 */
export async function uploadPrivateImage(file: File, folder: string): Promise<string> {
  const safeFolder = folder.startsWith(CLOUDINARY_ROOT) ? folder : `${CLOUDINARY_ROOT}/${folder}`;
  const result = await cloudinary.uploader.upload(await fileToDataUri(file), {
    folder: safeFolder,
    resource_type: "image",
    type: "authenticated",
    overwrite: false,
  });
  return result.public_id;
}

/**
 * Build a short-lived signed URL for a private asset. Only call this from
 * admin-authorized code paths. Legacy rows that stored full URLs are passed through.
 */
export function signedPrivateUrl(publicIdOrUrl: string, ttlSeconds = 15 * 60): string {
  if (!publicIdOrUrl) return "";
  if (/^https?:\/\//i.test(publicIdOrUrl)) return publicIdOrUrl;
  return cloudinary.url(publicIdOrUrl, {
    type: "authenticated",
    sign_url: true,
    secure: true,
    resource_type: "image",
    expires_at: Math.floor(Date.now() / 1000) + ttlSeconds,
  });
}

/** Extract a Cloudinary public_id from a delivery URL (for cleanup on delete). */
export function publicIdFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("cloudinary.com")) return null;
    // /<cloud>/image/upload/v123/folder/sub/name.jpg  ->  folder/sub/name
    const m = u.pathname.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
    return m ? decodeURIComponent(m[1]) : null;
  } catch {
    return null;
  }
}

/** Best-effort delete; never throws (cleanup must not break the request). */
export async function destroyByUrl(url: string, type: "upload" | "authenticated" = "upload") {
  const pid = /^https?:\/\//i.test(url) ? publicIdFromUrl(url) : url;
  if (!pid) return;
  try {
    await cloudinary.uploader.destroy(pid, { type, resource_type: "image" });
  } catch (e) {
    console.warn("[cloudinary] destroy failed for", pid, e instanceof Error ? e.message : e);
  }
}
