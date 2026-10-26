import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { requireAdmin, FORBIDDEN } from "@/lib/auth";
import { uploadPublicImage, destroyByUrl } from "@/lib/cloudinary";
import { CLOUDINARY_FOLDERS, CATEGORY_NAMES, getCategoryByName, getCategory } from "@/lib/site";
import { enforceRateLimit, LIMITS } from "@/lib/rate-limit";
import { cleanText, cleanString, toFloat, toInt, csvList, validateImageFile, isUuid } from "@/lib/validate";

const MAX_IMAGES = 6;

/** Fields safe to expose to the storefront (no owner/user relation). */
const PUBLIC_SELECT = {
  id: true,
  name: true,
  description: true,
  price: true,
  stock: true,
  imageUrls: true,
  categories: true,
  subCategories: true,
  brands: true,
  colors: true,
  sizes: true,
  isFeatured: true,
  isPublished: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

/**
 * GET /api/products
 *   ?category=shirts|trousers|shoes   ?sub=Formal   ?q=search   ?featured=1
 *   ?id=<uuid>  (single product)       ?sort=new|price_asc|price_desc
 *   ?all=1 (admin only — includes unpublished + owner)
 */
export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const admin = sp.get("all") === "1" ? requireAdmin(req) : null;
    if (sp.get("all") === "1" && !admin) return FORBIDDEN();

    const where: Prisma.ProductWhereInput = admin ? {} : { isPublished: true };

    const id = sp.get("id");
    if (id) {
      if (!isUuid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
      const product = await prisma.product.findFirst({ where: { id, ...where }, select: PUBLIC_SELECT });
      if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      return NextResponse.json(product);
    }

    const category = sp.get("category");
    if (category) {
      const def = getCategory(category) || getCategoryByName(category);
      if (!def) return NextResponse.json([]);
      where.categories = { has: def.name };
    }
    const sub = cleanText(sp.get("sub"), 60);
    if (sub) where.subCategories = { has: sub };
    if (sp.get("featured") === "1") where.isFeatured = true;

    const q = cleanText(sp.get("q"), 80);
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { brands: { has: q } },
      ];
    }

    const sort = sp.get("sort");
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sort === "price_asc" ? { price: "asc" } : sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };

    const take = Math.min(toInt(sp.get("limit"), 100), 200);

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take,
      select: admin ? { ...PUBLIC_SELECT, updatedAt: true } : PUBLIC_SELECT,
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error("PRODUCTS_GET_ERROR:", error);
    return NextResponse.json({ error: "Failed to load products" }, { status: 500 });
  }
}

/** Parse + validate the shared product form fields. Returns an error string or data. */
function parseProductForm(fd: FormData) {
  const name = cleanText(fd.get("name"), 120);
  const description = cleanString(fd.get("description"), 3000);
  const price = toFloat(fd.get("price"));
  const stock = toInt(fd.get("stock"), 0);
  const category = cleanText(fd.get("category"), 40);
  const subCategory = cleanText(fd.get("subCategory"), 60);
  const brand = cleanText(fd.get("brand"), 60);
  const sizes = csvList(fd.get("sizes"), 20, 10);
  const colors = csvList(fd.get("colors"), 12, 30);
  const isPublished = fd.get("isPublished") !== "false";
  const isFeatured = fd.get("isFeatured") === "true";

  if (name.length < 2) return { error: "Product name is required" };
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) return { error: "Enter a valid price" };
  if (stock < 0 || stock > 1_000_000) return { error: "Stock must be 0 or more" };
  const def = getCategoryByName(category);
  if (!def) return { error: `Category must be one of: ${CATEGORY_NAMES.join(", ")}` };
  if (subCategory && !def.subCategories.includes(subCategory)) return { error: "Invalid sub-category for this category" };
  if (sizes.length === 0) return { error: "Select at least one size" };
  const badSize = sizes.find((s) => !def.sizes.includes(s));
  if (badSize) return { error: `Size "${badSize}" is not valid for ${def.name}` };

  return {
    data: {
      name,
      description: description || null,
      price: Math.round(price * 100) / 100,
      stock,
      categories: [def.name],
      subCategories: subCategory ? [subCategory] : [],
      brands: brand ? [brand] : [],
      sizes,
      colors,
      isPublished,
      isFeatured,
    },
  };
}

async function uploadFiles(files: FormDataEntryValue[], existingCount: number) {
  const valid: File[] = [];
  for (const f of files) {
    if (!(f instanceof File) || f.size === 0) continue;
    if (!validateImageFile(f)) {
      throw new Error("Images must be JPG, PNG, WEBP or AVIF and under 6 MB");
    }
    valid.push(f);
  }
  if (existingCount + valid.length > MAX_IMAGES) throw new Error(`A product can have at most ${MAX_IMAGES} images`);
  return Promise.all(valid.map((f) => uploadPublicImage(f, CLOUDINARY_FOLDERS.products)));
}

/** POST /api/products — admin only. */
export async function POST(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) return FORBIDDEN();
    const limited = enforceRateLimit(req, "admin-write", LIMITS.adminWrite);
    if (limited) return limited;

    const fd = await req.formData();
    const parsed = parseProductForm(fd);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    let imageUrls: string[];
    try {
      imageUrls = await uploadFiles(fd.getAll("images"), 0);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
    }
    if (imageUrls.length === 0) return NextResponse.json({ error: "Add at least one product image" }, { status: 400 });

    const product = await prisma.product.create({
      data: { ...parsed.data, imageUrls, userId: admin.id },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("PRODUCT_CREATE_ERROR:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

/** PUT /api/products — admin only. Keeps `imageUrls` listed, uploads `newImages`, deletes removed ones. */
export async function PUT(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) return FORBIDDEN();
    const limited = enforceRateLimit(req, "admin-write", LIMITS.adminWrite);
    if (limited) return limited;

    const fd = await req.formData();
    const id = String(fd.get("id") || "");
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const parsed = parseProductForm(fd);
    if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });

    // Only URLs that already belonged to this product may be kept (no URL injection).
    const keep = csvList(fd.get("imageUrls"), MAX_IMAGES, 500).filter((u) => existing.imageUrls.includes(u));
    let uploaded: string[];
    try {
      uploaded = await uploadFiles(fd.getAll("newImages"), keep.length);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 400 });
    }
    const imageUrls = [...keep, ...uploaded];
    if (imageUrls.length === 0) return NextResponse.json({ error: "A product needs at least one image" }, { status: 400 });

    const updated = await prisma.product.update({ where: { id }, data: { ...parsed.data, imageUrls } });

    // Clean up images the admin removed.
    await Promise.all(existing.imageUrls.filter((u) => !keep.includes(u)).map((u) => destroyByUrl(u)));

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PRODUCT_UPDATE_ERROR:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

/** PATCH /api/products — admin quick edits: { id, stock?, isPublished?, isFeatured?, price? } */
export async function PATCH(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) return FORBIDDEN();
    const body = await req.json().catch(() => ({}));
    if (!isUuid(body.id)) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

    const data: Prisma.ProductUpdateInput = {};
    if (body.stock !== undefined) {
      const stock = toInt(body.stock);
      if (!Number.isFinite(stock) || stock < 0 || stock > 1_000_000) return NextResponse.json({ error: "Invalid stock" }, { status: 400 });
      data.stock = stock;
    }
    if (body.price !== undefined) {
      const price = toFloat(body.price);
      if (!Number.isFinite(price) || price <= 0) return NextResponse.json({ error: "Invalid price" }, { status: 400 });
      data.price = Math.round(price * 100) / 100;
    }
    if (typeof body.isPublished === "boolean") data.isPublished = body.isPublished;
    if (typeof body.isFeatured === "boolean") data.isFeatured = body.isFeatured;
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

    const updated = await prisma.product.update({ where: { id: body.id }, data });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PRODUCT_PATCH_ERROR:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

/** DELETE /api/products — admin only. */
export async function DELETE(req: NextRequest) {
  try {
    const admin = requireAdmin(req);
    if (!admin) return FORBIDDEN();

    const { id } = await req.json().catch(() => ({}));
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid product id" }, { status: 400 });

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    await prisma.product.delete({ where: { id } });
    await Promise.all(existing.imageUrls.map((u) => destroyByUrl(u)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PRODUCT_DELETE_ERROR:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
