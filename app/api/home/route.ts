import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
import { uploadPublicImage, destroyByUrl } from "@/lib/cloudinary";
import { CATEGORIES, CLOUDINARY_FOLDERS, getCategory } from "@/lib/site";
import { validateImageFile, csvList, cleanText, toInt } from "@/lib/validate";
import { loadHome, MAX_HERO, MAX_LOOKBOOK } from "@/lib/home";

const bad = (error: string) => NextResponse.json({ error }, { status: 400 });

/** Only allow internal paths or https URLs as tile links. */
function cleanLink(value: unknown): string {
  const v = cleanText(value, 200);
  return v.startsWith("/") || v.startsWith("https://") ? v : "/";
}

/** GET /api/home — public. */
export async function GET() {
  try {
    return NextResponse.json(await loadHome());
  } catch (error) {
    console.error("HOME_GET_ERROR:", error);
    return NextResponse.json({ error: "Failed to load home content" }, { status: 500 });
  }
}

/**
 * PUT /api/home — admin. multipart:
 *   heroKeep (csv of existing URLs to keep), heroNew (files)
 *   categoryImage_<slug> (file) — replaces that category's tile image
 *   editorialNew (file) — replaces the editorial image
 *   lookbookKeep (csv of HomeImage ids to keep), lookbookNew (files), lookbookLabel[] / lookbookLink[] (parallel to lookbookNew)
 *   lookbookLabel_<id> / lookbookLink_<id> — update text on an existing tile
 */
export async function PUT(req: NextRequest) {
  try {
    if (!requireAdmin(req)) return FORBIDDEN();
    const fd = await req.formData();
    const files = (key: string) => fd.getAll(key).filter((f): f is File => f instanceof File && f.size > 0);

    // ---- Hero slider ----
    const slider = await prisma.homeSlider.findFirst({ orderBy: { createdAt: "asc" } });
    const current = slider?.images ?? [];
    const keep = fd.has("heroKeep") ? csvList(fd.get("heroKeep"), MAX_HERO, 500).filter((u) => current.includes(u)) : current;
    const newFiles = files("heroNew");
    if (newFiles.some((f) => !validateImageFile(f))) return bad("Hero images must be JPG/PNG/WEBP under 6 MB");
    if (keep.length + newFiles.length > MAX_HERO) return bad(`Maximum ${MAX_HERO} hero images`);
    const uploaded = await Promise.all(newFiles.map((f) => uploadPublicImage(f, `${CLOUDINARY_FOLDERS.site}/hero`)));
    const images = [...keep, ...uploaded];

    if (slider) await prisma.homeSlider.update({ where: { id: slider.id }, data: { images } });
    else if (images.length) await prisma.homeSlider.create({ data: { images } });
    await Promise.all(current.filter((u) => !keep.includes(u)).map((u) => destroyByUrl(u)));

    // ---- Category tiles ----
    for (const c of CATEGORIES) {
      const file = fd.get(`categoryImage_${c.slug}`);
      if (!(file instanceof File) || file.size === 0) continue;
      if (!validateImageFile(file)) return bad(`${c.name} image must be JPG/PNG/WEBP under 6 MB`);
      const url = await uploadPublicImage(file, `${CLOUDINARY_FOLDERS.site}/categories`);
      const existing = await prisma.category.findFirst({ where: { link: `/${c.slug}` } });
      if (existing) {
        await prisma.category.update({ where: { id: existing.id }, data: { image: url, name: c.name, isActive: true } });
        if (existing.image) await destroyByUrl(existing.image);
      } else {
        await prisma.category.create({ data: { name: c.name, image: url, link: `/${c.slug}`, order: CATEGORIES.indexOf(c) } });
      }
    }

    // ---- Editorial image ----
    const editorialFile = fd.get("editorialNew");
    if (editorialFile instanceof File && editorialFile.size > 0) {
      if (!validateImageFile(editorialFile)) return bad("Editorial image must be JPG/PNG/WEBP under 6 MB");
      const url = await uploadPublicImage(editorialFile, `${CLOUDINARY_FOLDERS.site}/editorial`);
      const existing = await prisma.homeImage.findFirst({ where: { slot: "editorial" } });
      if (existing) {
        await prisma.homeImage.update({ where: { id: existing.id }, data: { image: url } });
        await destroyByUrl(existing.image);
      } else {
        await prisma.homeImage.create({ data: { slot: "editorial", image: url } });
      }
    }

    // ---- Lookbook tiles ----
    const tiles = await prisma.homeImage.findMany({ where: { slot: "lookbook" }, orderBy: { order: "asc" } });
    const keepIds = fd.has("lookbookKeep")
      ? new Set(csvList(fd.get("lookbookKeep"), MAX_LOOKBOOK, 20).map((v) => toInt(v)).filter((n) => tiles.some((t) => t.id === n)))
      : new Set(tiles.map((t) => t.id));
    const lookbookNew = files("lookbookNew");
    if (lookbookNew.some((f) => !validateImageFile(f))) return bad("Lookbook images must be JPG/PNG/WEBP under 6 MB");
    if (keepIds.size + lookbookNew.length > MAX_LOOKBOOK) return bad(`Maximum ${MAX_LOOKBOOK} lookbook tiles`);

    const removed = tiles.filter((t) => !keepIds.has(t.id));
    if (removed.length) {
      await prisma.homeImage.deleteMany({ where: { id: { in: removed.map((t) => t.id) } } });
      await Promise.all(removed.map((t) => destroyByUrl(t.image)));
    }
    for (const t of tiles.filter((t) => keepIds.has(t.id))) {
      if (!fd.has(`lookbookLabel_${t.id}`) && !fd.has(`lookbookLink_${t.id}`)) continue;
      await prisma.homeImage.update({
        where: { id: t.id },
        data: {
          label: fd.has(`lookbookLabel_${t.id}`) ? cleanText(fd.get(`lookbookLabel_${t.id}`), 60) : t.label,
          link: fd.has(`lookbookLink_${t.id}`) ? cleanLink(fd.get(`lookbookLink_${t.id}`)) : t.link,
        },
      });
    }
    const labels = fd.getAll("lookbookLabel");
    const links = fd.getAll("lookbookLink");
    let order = tiles.length ? Math.max(...tiles.map((t) => t.order)) + 1 : 0;
    for (const [i, f] of lookbookNew.entries()) {
      const url = await uploadPublicImage(f, `${CLOUDINARY_FOLDERS.site}/lookbook`);
      await prisma.homeImage.create({
        data: { slot: "lookbook", image: url, label: cleanText(labels[i], 60), link: cleanLink(links[i]), order: order++ },
      });
    }

    return NextResponse.json(await loadHome());
  } catch (error) {
    console.error("HOME_PUT_ERROR:", error);
    return NextResponse.json({ error: "Failed to update home content" }, { status: 500 });
  }
}

/**
 * DELETE /api/home — admin. Body: { slug } clears a category tile image, { slot: "editorial" } removes the editorial image.
 */
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();
  const body = await req.json().catch(() => ({}));

  if (body?.slot === "editorial") {
    const existing = await prisma.homeImage.findFirst({ where: { slot: "editorial" } });
    if (existing) {
      await prisma.homeImage.delete({ where: { id: existing.id } });
      await destroyByUrl(existing.image);
    }
    return NextResponse.json(await loadHome());
  }

  const def = getCategory(String(body?.slug || ""));
  if (!def) return bad("Invalid category");
  const existing = await prisma.category.findFirst({ where: { link: `/${def.slug}` } });
  if (existing) {
    if (existing.image) await destroyByUrl(existing.image);
    await prisma.category.delete({ where: { id: existing.id } });
  }
  return NextResponse.json(await loadHome());
}
