import type { Metadata } from "next";
import CollectionPage from "@/component/shop/CollectionPage";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q || "").trim().slice(0, 80);
  return <CollectionPage key={query} query={query} />;
}
