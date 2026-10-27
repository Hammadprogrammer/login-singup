/**
 * Single source of truth for store branding, catalog taxonomy and
 * order/payment vocab. Both the storefront and the admin panel import
 * from here so categories/sizes/statuses never drift apart.
 */

export const SITE = {
  name: "MONARCH",
  tagline: "Menswear, considered.",
  description:
    "Premium men's shirts, trousers and shoes. Tailored fits, honest fabrics, delivered to your door.",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@monarch.store",
  phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+92 300 0000000",
  address: "Studio 4, Gulberg III, Lahore, Pakistan",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "USD",
  locale: "en-US",
  freeShippingOver: 150,
  shippingFee: 10,
};

/** Shipping cost for a given merchandise subtotal — used by cart, checkout and the orders API. */
export function shippingFor(subtotal: number) {
  return subtotal <= 0 || subtotal >= SITE.freeShippingOver ? 0 : SITE.shippingFee;
}

/** Cloudinary root folder — every upload from this app lives under here. */
export const CLOUDINARY_ROOT = "mens_store";
export const CLOUDINARY_FOLDERS = {
  products: `${CLOUDINARY_ROOT}/products`,
  site: `${CLOUDINARY_ROOT}/site`,
  kyc: (userId: number) => `${CLOUDINARY_ROOT}/kyc/user_${userId}`,
};

export type CategorySlug = "shirts" | "trousers" | "shoes";

export interface CategoryDef {
  slug: CategorySlug;
  name: string;
  title: string;
  blurb: string;
  subCategories: string[];
  sizes: string[];
  sizeLabel: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: "shirts",
    name: "Shirts",
    title: "Shirts",
    blurb: "Crisp formals, relaxed linens and weekend oxfords — cut to sit clean on the shoulder.",
    subCategories: ["Formal", "Casual", "Linen", "Oxford", "Polo"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sizeLabel: "Size",
  },
  {
    slug: "trousers",
    name: "Trousers",
    title: "Trousers",
    blurb: "Chinos, dress trousers and denim with a tapered leg and a comfortable rise.",
    subCategories: ["Chinos", "Dress Trousers", "Denim", "Cargo", "Joggers"],
    sizes: ["28", "30", "32", "34", "36", "38", "40"],
    sizeLabel: "Waist",
  },
  {
    slug: "shoes",
    name: "Shoes",
    title: "Shoes",
    blurb: "Hand-finished leather oxfords, loafers, boots and minimal sneakers.",
    subCategories: ["Oxford", "Loafers", "Boots", "Sneakers", "Sandals"],
    sizes: ["39", "40", "41", "42", "43", "44", "45", "46"],
    sizeLabel: "EU Size",
  },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export function getCategory(slug: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.slug === slug.toLowerCase());
}

export function getCategoryByName(name: string): CategoryDef | undefined {
  return CATEGORIES.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export const COLORS = [
  { name: "Black", hex: "#111111" },
  { name: "White", hex: "#F5F5F5" },
  { name: "Navy", hex: "#1F2A44" },
  { name: "Charcoal", hex: "#3A3A3A" },
  { name: "Olive", hex: "#5B6B3A" },
  { name: "Camel", hex: "#B68B5A" },
  { name: "Sky", hex: "#9DB9D3" },
  { name: "Burgundy", hex: "#5B1F22" },
  { name: "Brown", hex: "#5C3A21" },
  { name: "Tan", hex: "#C8A36A" },
  { name: "Stone", hex: "#C9C2B6" },
  { name: "Grey", hex: "#8A8A8A" },
];

/** Order lifecycle shown in the admin panel. Legacy values are mapped below. */
export const ORDER_STATUSES = ["PENDING", "PROCESSING", "COMPLETED", "CANCELLED"] as const;
export type OrderStatusValue = (typeof ORDER_STATUSES)[number];

/** Older orders may still carry PAID/SHIPPED/DELIVERED; map them for display + filters. */
export function normalizeOrderStatus(status: string): OrderStatusValue {
  switch (status) {
    case "PAID":
    case "SHIPPED":
      return "PROCESSING";
    case "DELIVERED":
      return "COMPLETED";
    case "PROCESSING":
    case "COMPLETED":
    case "CANCELLED":
      return status;
    default:
      return "PENDING";
  }
}

/** DB values that belong to a display status (used in filters). */
export const STATUS_DB_VALUES: Record<OrderStatusValue, string[]> = {
  PENDING: ["PENDING"],
  PROCESSING: ["PROCESSING", "PAID", "SHIPPED"],
  COMPLETED: ["COMPLETED", "DELIVERED"],
  CANCELLED: ["CANCELLED"],
};

export const PAYMENT_METHODS = [
  { value: "cod", label: "Cash on Delivery", hint: "Pay in cash when your order arrives." },
  { value: "bank_transfer", label: "Bank Transfer", hint: "We'll email bank details after you place the order." },
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export function paymentLabel(value: string) {
  return PAYMENT_METHODS.find((p) => p.value === value)?.label ?? value;
}
