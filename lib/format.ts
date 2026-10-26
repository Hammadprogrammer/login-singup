import { SITE } from "./site";

const fmt = new Intl.NumberFormat(SITE.locale, {
  style: "currency",
  currency: SITE.currency,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number) {
  return fmt.format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(d: string | Date, withTime = false) {
  return new Date(d).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function shortId(id: string) {
  return id.slice(0, 8).toUpperCase();
}
