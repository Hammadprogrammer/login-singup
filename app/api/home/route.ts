import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
import { uploadPublicImage, destroyByUrl } from "@/lib/cloudinary";
import { CATEGORIES, CLOUDINARY_FOLDERS, getCategory } from "@/lib/site";
import { validateImageFile, csvList } from "@/lib/validate";

const MAX_HERO = 5;

/**
 * Home content = hero slider images (HomeSlider row) + category tile images (Category rows).
 * Falls back to the bundled /images/mens assets when nothing has been uploaded yet.
 */
async function loadHome() {
  const [slider, cats] = await Promise.all([
    prisma.homeSlider.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ where: { isActive: true } }),
  ]);
  const hero = slider?.images?.length ? slider.images : ["/images/mens/hero-1.jpg", "/images/mens/hero-2.jpg", "/images/mens/hero-3.jpg"];
  const categories = CATEGORIES.map((c) => {
    const row = cats.find((r) => r.link === `/${c.slug}` || r.name.toLowerCase() === c.name.toLowerCase());
    return { slug: c.slug, name: c.name, blurb: c.blurb, image: row?.image || c.image };
  });
  return { hero, categories, sliderId: slider?.id ?? null };
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
 */
export async function PUT(req: NextRequest) {
  try {
    if (!requireAdmin(req)) return FORBIDDEN();
    const fd = await req.formData();

    // ---- Hero slider ----
    const slider = await prisma.homeSlider.findFirst({ orderBy: { createdAt: "asc" } });
    const current = slider?.images ?? [];
    const keep = fd.has("heroKeep") ? csvList(fd.get("heroKeep"), MAX_HERO, 500).filter((u) => current.includes(u)) : current;
    const newFiles = fd.getAll("heroNew").filter((f): f is File => f instanceof File && f.size > 0);
    for (const f of newFiles) {
      if (!validateImageFile(f)) return NextResponse.json({ error: "Hero images must be JPG/PNG/WEBP under 6 MB" }, { status: 400 });
    }
    if (keep.length + newFiles.length > MAX_HERO) {
      return NextResponse.json({ error: `Maximum ${MAX_HERO} hero images` }, { status: 400 });
    }
    const uploaded = await Promise.all(newFiles.map((f) => uploadPublicImage(f, `${CLOUDINARY_FOLDERS.site}/hero`)));
    const images = [...keep, ...uploaded];

    if (slider) await prisma.homeSlider.update({ where: { id: slider.id }, data: { images } });
    else if (images.length) await prisma.homeSlider.create({ data: { images } });
    await Promise.all(current.filter((u) => !keep.includes(u)).map((u) => destroyByUrl(u)));

    // ---- Category tiles ----
    for (const c of CATEGORIES) {
      const file = fd.get(`categoryImage_${c.slug}`);
      if (!(file instanceof File) || file.size === 0) continue;
      if (!validateImageFile(file)) return NextResponse.json({ error: `${c.name} image must be JPG/PNG/WEBP under 6 MB` }, { status: 400 });
      const url = await uploadPublicImage(file, `${CLOUDINARY_FOLDERS.site}/categories`);
      const existing = await prisma.category.findFirst({ where: { link: `/${c.slug}` } });
      if (existing) {
        await prisma.category.update({ where: { id: existing.id }, data: { image: url, name: c.name, isActive: true } });
        if (existing.image) await destroyByUrl(existing.image);
      } else {
        await prisma.category.create({ data: { name: c.name, image: url, link: `/${c.slug}`, order: CATEGORIES.indexOf(c) } });
      }
    }

    return NextResponse.json(await loadHome());
  } catch (error) {
    console.error("HOME_PUT_ERROR:", error);
    return NextResponse.json({ error: "Failed to update home content" }, { status: 500 });
  }
}

/** DELETE /api/home — admin: reset a category tile to the default image. Body: { slug } */
export async function DELETE(req: NextRequest) {
  if (!requireAdmin(req)) return FORBIDDEN();
  const { slug } = await req.json().catch(() => ({}));
  const def = getCategory(String(slug || ""));
  if (!def) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  const existing = await prisma.category.findFirst({ where: { link: `/${def.slug}` } });
  if (existing) {
    if (existing.image) await destroyByUrl(existing.image);
    await prisma.category.delete({ where: { id: existing.id } });
  }
  return NextResponse.json(await loadHome());
}
