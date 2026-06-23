/**
 * Seeds homepage CMS content so the storefront looks complete.
 *
 * Populates: PromoBanner, Category, SaleBanner, InspirationImage,
 * BlogPost, Testimonial, and marks 8 products as Featured.
 *
 * Images use picsum.photos seeded URLs (real, always-loading photos).
 *
 * Idempotent: CMS content tables are cleared and re-seeded on every run.
 *
 * Run with:  npx tsx scripts/seed-homepage.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fashion-relevant photos via loremflickr (keyworded). `lock` keeps the
// same image stable across runs so the homepage looks consistent.
const img = (keywords: string, w: number, h: number, lock: number) =>
  `https://loremflickr.com/${w}/${h}/${encodeURIComponent(keywords)}?lock=${lock}`;

async function seedHomeSlider() {
  await prisma.homeSlider.deleteMany();
  await prisma.homeSlider.create({
    data: {
      images: [
        img("fashion,model,winter", 1920, 1080, 1),
        img("knitwear,model,style", 1920, 1080, 2),
        img("fashion,runway,collection", 1920, 1080, 3),
      ],
    },
  });
}

async function seedPromoBanners() {
  await prisma.promoBanner.deleteMany();
  await prisma.promoBanner.createMany({
    data: [
      { title: "Essential Knit Kit", subtitle: "From $99.99", buttonText: "Shop now", link: "/ready-to-wear", image: img("knitwear,sweater", 800, 1000, 101), size: "large", order: 0 },
      { title: "Winter Warmers", subtitle: "Cozy layers", buttonText: "Discover", link: "/accessories", image: img("winter,fashion", 800, 500, 102), size: "normal", order: 1 },
      { title: "New Arrivals", subtitle: "Fresh drops", buttonText: "Explore", link: "/new-in", image: img("fashion,model", 800, 500, 103), size: "normal", order: 2 },
      { title: "Mid-Season Sale", subtitle: "Up to 50% Off", buttonText: "Shop sale", link: "/sale", bgColor: "#542c17", size: "normal", order: 3 },
      { title: "Accessories Edit", subtitle: "Finish the look", buttonText: "Shop now", link: "/accessories", image: img("accessories,bag", 800, 500, 105), size: "normal", order: 4 },
    ],
  });
}

async function seedCategories() {
  await prisma.category.deleteMany();
  const names = [
    ["Knitwear", "knitwear"],
    ["Coats", "coats"],
    ["Dresses", "dresses"],
    ["Accessories", "accessories"],
    ["Bags", "bags"],
    ["Footwear", "footwear"],
    ["Jewelry", "jewelry"],
  ];
  const catKeywords: Record<string, string> = {
    knitwear: "knitwear,sweater", coats: "coat,fashion", dresses: "dress,fashion",
    accessories: "accessories", bags: "handbag", footwear: "shoes,fashion", jewelry: "jewelry",
  };
  await prisma.category.createMany({
    data: names.map(([name, slug], i) => ({
      name,
      image: img(catKeywords[slug] || "fashion", 300, 300, 200 + i),
      link: `/${slug}`,
      order: i,
    })),
  });
}

async function seedSaleBanner() {
  await prisma.saleBanner.deleteMany();
  await prisma.saleBanner.create({
    data: {
      heading: "Best of Summer Sale",
      subheading: "Get up to 50% off on selected seasonal pieces. Limited stock, curated for the season ahead.",
      buttonText: "Shop the sale",
      link: "/sale",
      image: img("fashion,model,woman", 1600, 900, 300),
      order: 0,
    },
  });
}

async function seedInspiration() {
  await prisma.inspirationImage.deleteMany();
  await prisma.inspirationImage.createMany({
    data: Array.from({ length: 5 }).map((_, i) => ({
      image: img("fashion,outfit,style", 600, 600, 400 + i),
      link: "/new-in",
      order: i,
    })),
  });
}

async function seedBlog() {
  await prisma.blogPost.deleteMany();
  await prisma.blogPost.createMany({
    data: [
      { title: "How to Style Knitwear This Season", excerpt: "Five effortless ways to layer your favorite knits for day-to-night looks.", image: img("knitwear,style", 600, 450, 500), author: "Style Desk", link: "/blog/styling-knitwear", order: 0 },
      { title: "The Capsule Wardrobe Guide", excerpt: "Build a timeless wardrobe with these essential pieces that never go out of style.", image: img("wardrobe,fashion", 600, 450, 501), author: "Editorial", link: "/blog/capsule-wardrobe", order: 1 },
      { title: "Sustainable Fabrics Explained", excerpt: "Understanding the materials behind conscious fashion and why they matter.", image: img("fabric,textile", 600, 450, 502), author: "The Journal", link: "/blog/sustainable-fabrics", order: 2 },
    ],
  });
}

async function seedTestimonials() {
  await prisma.testimonial.deleteMany();
  await prisma.testimonial.createMany({
    data: [
      { quote: "The quality is absolutely stunning. Every piece feels luxurious and the fit is perfect.", author: "Sarah K.", brand: "Verified Buyer", order: 0 },
      { quote: "Fast shipping and beautiful packaging. This has become my go-to store for winter essentials.", author: "Ayesha M.", brand: "Verified Buyer", order: 1 },
      { quote: "I get compliments every time I wear their knitwear. Timeless designs that last for years.", author: "Daniel R.", brand: "Loyal Customer", order: 2 },
    ],
  });
}

async function seedFeatured() {
  await prisma.featuredProduct.deleteMany();
  const items = [
    { title: "Cashmere Crew Sweater", price: "129 USDT" },
    { title: "Wool Blend Coat", price: "219 USDT" },
    { title: "Ribbed Knit Beanie", price: "39 USDT" },
    { title: "Merino Turtleneck", price: "89 USDT" },
    { title: "Cable Knit Cardigan", price: "149 USDT" },
    { title: "Alpaca Scarf", price: "59 USDT" },
    { title: "Quilted Puffer Jacket", price: "199 USDT" },
    { title: "Chunky Knit Pullover", price: "119 USDT" },
  ];
  const brands = ["Elite Winter", "Nordic Co.", "Maison Knit", "Aurora"];
  await prisma.featuredProduct.createMany({
    data: items.map((it, i) => ({
      title: it.title,
      price: it.price,
      brand: brands[i % brands.length],
      image: img("knitwear,sweater,fashion", 600, 800, 600 + i),
      link: "/",
      order: i,
    })),
  });
}

async function main() {
  console.log("Seeding homepage content...");
  await seedHomeSlider();
  console.log("  ✓ Home slider (3 images)");
  await seedPromoBanners();
  console.log("  ✓ Promo banners");
  await seedCategories();
  console.log("  ✓ Categories");
  await seedSaleBanner();
  console.log("  ✓ Sale banner");
  await seedInspiration();
  console.log("  ✓ Inspiration gallery");
  await seedBlog();
  console.log("  ✓ Blog posts");
  await seedTestimonials();
  console.log("  ✓ Testimonials");
  await seedFeatured();
  console.log("  ✓ Featured products");
  console.log("Done. Homepage is fully populated.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
