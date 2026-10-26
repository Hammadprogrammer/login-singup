import Link from "next/link";
import { SITE, CATEGORIES } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="bg-ink text-bone mt-24">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-5">
          <div>
            <p className="font-serif text-3xl tracking-[0.35em]">{SITE.name}</p>
            <p className="eyebrow text-brass mt-1">Menswear</p>
          </div>
          <p className="text-sm text-bone/60 leading-relaxed max-w-xs">{SITE.description}</p>
        </div>

        <div>
          <p className="eyebrow text-brass mb-5">Shop</p>
          <ul className="space-y-3 text-sm text-bone/75">
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link href={`/${c.slug}`} className="hover:text-bone transition-colors">{c.name}</Link></li>
            ))}
            <li><Link href="/search?q=" className="hover:text-bone transition-colors">All products</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-brass mb-5">Company</p>
          <ul className="space-y-3 text-sm text-bone/75">
            <li><Link href="/about" className="hover:text-bone transition-colors">About us</Link></li>
            <li><Link href="/reviews" className="hover:text-bone transition-colors">Reviews</Link></li>
            <li><Link href="/contact" className="hover:text-bone transition-colors">Contact</Link></li>
            <li><Link href="/orders" className="hover:text-bone transition-colors">Order history</Link></li>
            <li><Link href="/kyc" className="hover:text-bone transition-colors">Identity verification</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow text-brass mb-5">Visit</p>
          <address className="not-italic text-sm text-bone/75 space-y-3 leading-relaxed">
            <p>{SITE.address}</p>
            <p><a href={`mailto:${SITE.supportEmail}`} className="hover:text-bone transition-colors">{SITE.supportEmail}</a></p>
            <p><a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="hover:text-bone transition-colors">{SITE.phone}</a></p>
            <p className="text-bone/50">Mon–Sat · 10:00–20:00</p>
          </address>
        </div>
      </div>

      <div className="border-t border-bone/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-bone/50 tracking-wider">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Cash on delivery · Bank transfer · Secure checkout</p>
        </div>
      </div>
    </footer>
  );
}
