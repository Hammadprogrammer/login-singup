import Link from "next/link";
import { SITE } from "@/lib/site";

export default function AuthShell({ title, subtitle, children, image = "/images/mens/hero-3.jpg" }: { title: string; subtitle: string; children: React.ReactNode; image?: string }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bone">
      <div className="relative hidden lg:block bg-ink overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover object-top opacity-80 animate-ken-burns" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-14 text-bone">
          <p className="eyebrow text-brass-2 mb-3">{SITE.name}</p>
          <p className="display text-5xl max-w-md">{SITE.tagline}</p>
        </div>
      </div>

      <div className="flex flex-col px-6 sm:px-12 py-8">
        <Link href="/" className="font-serif text-2xl tracking-[0.35em] self-start">{SITE.name}</Link>
        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-md animate-fade-up">
            <p className="eyebrow text-brass mb-3">{subtitle}</p>
            <h1 className="display text-4xl lg:text-5xl mb-8">{title}</h1>
            {children}
          </div>
        </div>
        <p className="text-[11px] text-stone text-center">© {new Date().getFullYear()} {SITE.name}</p>
      </div>
    </div>
  );
}
