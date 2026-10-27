import prisma from "@/lib/prisma";
import { CATEGORIES } from "@/lib/site";

export const MAX_HERO = 5;
export const MAX_LOOKBOOK = 3;

export interface HomeLookbookTile {
  id: number;
  image: string;
  label: string;
  link: string;
}

export interface HomeContent {
  hero: string[];
  categories: { slug: string; name: string; blurb: string; image: string | null }[];
  editorial: string | null;
  lookbook: HomeLookbookTile[];
  sliderId: number | null;
}

/**
 * Home content = hero slider (HomeSlider) + category tiles (Category) + editorial / lookbook (HomeImage).
 * Everything is admin-managed; nothing falls back to bundled assets.
 */
export async function loadHome(): Promise<HomeContent> {
  const [slider, cats, images] = await Promise.all([
    prisma.homeSlider.findFirst({ orderBy: { createdAt: "asc" } }),
    prisma.category.findMany({ where: { isActive: true } }),
    prisma.homeImage.findMany({ orderBy: [{ order: "asc" }, { id: "asc" }] }),
  ]);
  const categories = CATEGORIES.map((c) => {
    const row = cats.find((r) => r.link === `/${c.slug}` || r.name.toLowerCase() === c.name.toLowerCase());
    return { slug: c.slug, name: c.name, blurb: c.blurb, image: row?.image || null };
  });
  const editorial = images.find((i) => i.slot === "editorial")?.image ?? null;
  const lookbook = images
    .filter((i) => i.slot === "lookbook")
    .slice(0, MAX_LOOKBOOK)
    .map((i) => ({ id: i.id, image: i.image, label: i.label || "", link: i.link || "/" }));
  return { hero: slider?.images ?? [], categories, editorial, lookbook, sliderId: slider?.id ?? null };
}
