import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, getCategory } from "@/lib/site";
import CollectionPage from "@/component/shop/CollectionPage";

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  const def = getCategory(category);
  return def ? { title: `Men's ${def.title}`, description: def.blurb } : {};
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  const def = getCategory(category);
  if (!def) notFound();
  return <CollectionPage category={def} />;
}
