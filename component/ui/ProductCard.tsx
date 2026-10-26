import Link from "next/link";
import { formatPrice } from "@/lib/format";

export interface ProductSummary {
  id: string;
  name: string;
  price: number;
  stock: number;
  imageUrls: string[];
  categories: string[];
  subCategories: string[];
  brands: string[];
  sizes: string[];
  colors?: string[];
  isFeatured?: boolean;
  createdAt?: string;
}

export default function ProductCard({ product, priority = false }: { product: ProductSummary; priority?: boolean }) {
  const [primary, secondary] = product.imageUrls;
  const soldOut = product.stock <= 0;
  const low = !soldOut && product.stock <= 5;
  const isNew = product.createdAt ? Date.now() - new Date(product.createdAt).getTime() < 21 * 24 * 3600 * 1000 : false;

  return (
    <Link href={`/product/${product.id}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden bg-bone-2 zoom-media">
        {primary ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primary}
            alt={product.name}
            loading={priority ? "eager" : "lazy"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${secondary ? "group-hover:opacity-0" : ""}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone text-xs uppercase tracking-widest">No image</div>
        )}
        {secondary && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={secondary}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {soldOut && <span className="bg-ink text-bone eyebrow text-[9px] px-2.5 py-1">Sold out</span>}
          {!soldOut && isNew && <span className="bg-bone text-ink eyebrow text-[9px] px-2.5 py-1">New</span>}
          {low && <span className="bg-oxblood text-bone eyebrow text-[9px] px-2.5 py-1">Only {product.stock} left</span>}
        </div>

        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]">
          <div className="bg-ink/90 backdrop-blur text-bone text-center eyebrow text-[10px] py-3">
            {soldOut ? "View details" : "Quick view"}
          </div>
        </div>
      </div>

      <div className="pt-4 space-y-1">
        <p className="eyebrow text-[9px] text-stone">{product.brands[0] || product.subCategories[0] || product.categories[0]}</p>
        <h3 className="text-sm font-medium text-ink leading-snug group-hover:text-brass transition-colors">{product.name}</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-ink-3">{formatPrice(product.price)}</p>
          {product.sizes.length > 0 && (
            <p className="text-[10px] text-stone tracking-wider hidden sm:block">{product.sizes.slice(0, 5).join(" · ")}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] skeleton" />
      <div className="pt-4 space-y-2">
        <div className="h-2 w-16 skeleton" />
        <div className="h-3 w-3/4 skeleton" />
        <div className="h-3 w-12 skeleton" />
      </div>
    </div>
  );
}
