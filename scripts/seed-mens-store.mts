/**
 * One-time setup for the men's store home content.
 *
 *  1. Uploads the bundled hero + category images from /public/images/mens
 *     to Cloudinary under `mens_store/site/...`.
 *  2. Stores those Cloudinary URLs as the home hero slider + category tiles
 *     (replacing the old ladies-wear CMS rows, which pointed at placeholder images).
 *  3. Gives existing products with stock = 0 an opening stock so the store is
 *     orderable (pass --skip-stock to leave stock untouched).
 *
 * Idempotent: running again replaces hero/category rows but does not duplicate
 * Cloudinary assets (public_ids are fixed).
 *
 * Run with:  npm run seed-store   (loads .env via node --env-file)
 */
import path from "path";
import { PrismaClient } from "@prisma/client";
import { v2 as cloudinary } from "cloudinary";

const prisma = new PrismaClient();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true,
});

const ROOT = "mens_store/site";
const IMG = (f: string) => path.join(process.cwd(), "public", "images", "mens", f);
const skipStock = process.argv.includes("--skip-stock");

async function upload(file: string, folder: string, publicId: string) {
  const res = await cloudinary.uploader.upload(IMG(file), {
    folder: `${ROOT}/${folder}`,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
    transformation: [{ flags: "strip_profile" }],
  });
  return res.secure_url;
}

async function main() {
  console.log("Uploading site imagery to Cloudinary (mens_store/site)…");
  const [h1, h2, h3] = await Promise.all([
    upload("hero-1.jpg", "hero", "hero-1"),
    upload("hero-2.jpg", "hero", "hero-2"),
    upload("hero-3.jpg", "hero", "hero-3"),
  ]);
  console.log("  ✓ hero slider (3)");

  const cats = [
    { slug: "shirts", name: "Shirts", file: "shirts.jpg" },
    { slug: "trousers", name: "Trousers", file: "trousers.jpg" },
    { slug: "shoes", name: "Shoes", file: "shoes.jpg" },
  ];
  const catUrls = await Promise.all(cats.map((c) => upload(c.file, "categories", c.slug)));
  console.log("  ✓ category tiles (3)");

  // Replace legacy CMS rows (ladies-wear placeholders) with the men's content.
  await prisma.homeSlider.deleteMany();
  await prisma.homeSlider.create({ data: { images: [h1, h2, h3] } });

  await prisma.category.deleteMany();
  await prisma.category.createMany({
    data: cats.map((c, i) => ({ name: c.name, image: catUrls[i], link: `/${c.slug}`, order: i, isActive: true })),
  });
  console.log("  ✓ home content saved to database");

  // Unused legacy CMS tables from the ladies store — clear their placeholder rows.
  await Promise.all([
    prisma.promoBanner.deleteMany(),
    prisma.saleBanner.deleteMany(),
    prisma.inspirationImage.deleteMany(),
    prisma.blogPost.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.featuredProduct.deleteMany(),
  ]);
  console.log("  ✓ legacy promo/sale/blog placeholder rows cleared");

  if (!skipStock) {
    const r = await prisma.product.updateMany({ where: { stock: 0 }, data: { stock: 20 } });
    console.log(`  ✓ opening stock (20) set on ${r.count} product(s) that had none`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
