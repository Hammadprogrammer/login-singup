import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCategoryByName } from "@/lib/site";
import { isUuid } from "@/lib/validate";
import ProductDetail from "@/component/shop/ProductDetail";
import ProductCard from "@/component/ui/ProductCard";
import Reveal from "@/component/ui/Reveal";

type Params = { params: Promise<{ id: string }> };

const SELECT = {
  id: true, name: true, description: true, price: true, stock: true, imageUrls: true,
  categories: true, subCategories: true, brands: true, colors: true, sizes: true, isFeatured: true, createdAt: true,
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) return {};
  const p = await prisma.product.findFirst({ where: { id, isPublished: true }, select: { name: true, description: true } });
  return p ? { title: p.name, description: p.description?.slice(0, 160) } : {};
}

export default async function ProductPage({ params }: Params) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const product = await prisma.product.findFirst({ where: { id, isPublished: true }, select: SELECT });
  if (!product) notFound();

  const category = getCategoryByName(product.categories[0] || "");
  const [related, reviews] = await Promise.all([
    prisma.product.findMany({
      where: { isPublished: true, id: { not: product.id }, ...(category ? { categories: { has: category.name } } : {}) },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: SELECT,
    }),
    prisma.review.findMany({
      where: { productId: product.id, isApproved: true },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, rating: true, title: true, comment: true, createdAt: true, user: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-8 lg:py-12">
      <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-stone mb-8">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        {category ? <Link href={`/${category.slug}`} className="hover:text-ink">{category.name}</Link> : <span>Shop</span>}
        <span>/</span>
        <span className="text-ink truncate max-w-[200px]">{product.name}</span>
      </nav>

      <ProductDetail
        product={{ ...product, createdAt: product.createdAt.toISOString() }}
        sizeLabel={category?.sizeLabel || "Size"}
        reviews={reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      />

      {related.length > 0 && (
        <section className="pt-24">
          <Reveal className="mb-10">
            <p className="eyebrow text-brass mb-3">Complete the look</p>
            <h2 className="display text-4xl">You may also like</h2>
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 lg:gap-x-6">
            {related.map((p, idx) => (
              <Reveal key={p.id} delay={idx * 80}>
                <ProductCard product={{ ...p, createdAt: p.createdAt.toISOString() }} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
