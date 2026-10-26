"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X, Loader2, RotateCcw } from "lucide-react";
import { toast } from "@/component/ui/Toast";
import { PageHeader, Spinner } from "../ui";

interface Home { hero: string[]; categories: { slug: string; name: string; image: string }[]; sliderId: number | null }

export default function HomeContentTab() {
  const [home, setHome] = useState<Home | null>(null);
  const [keep, setKeep] = useState<string[]>([]);
  const [newHero, setNewHero] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [catFiles, setCatFiles] = useState<Record<string, File>>({});
  const [saving, setSaving] = useState(false);
  const heroRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const r = await fetch("/api/home", { cache: "no-store" });
    const d: Home = await r.json();
    setHome(d);
    // Only Cloudinary-hosted hero images are "kept"; bundled defaults aren't stored rows.
    setKeep(d.hero.filter((u) => u.startsWith("http")));
  };
  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const urls = newHero.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [newHero]);

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("heroKeep", keep.join(","));
      newHero.forEach((f) => fd.append("heroNew", f));
      Object.entries(catFiles).forEach(([slug, f]) => fd.append(`categoryImage_${slug}`, f));
      const r = await fetch("/api/home", { method: "PUT", body: fd });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "Save failed");
      toast.success("Home content updated");
      setNewHero([]);
      setCatFiles({});
      setHome(d);
      setKeep(d.hero.filter((u: string) => u.startsWith("http")));
    } finally {
      setSaving(false);
    }
  };

  const resetCategory = async (slug: string) => {
    const r = await fetch("/api/home", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
    if (r.ok) {
      setHome(await r.json());
      toast.success("Reset to default image");
    }
  };

  if (!home) return <Spinner />;

  const usingDefaults = keep.length === 0 && newHero.length === 0;
  const dirty = newHero.length > 0 || Object.keys(catFiles).length > 0 || keep.length !== home.hero.filter((u) => u.startsWith("http")).length;

  return (
    <div className="space-y-8">
      <PageHeader title="Home content" subtitle="Hero slider and category tile images. Uploads go to Cloudinary under mens_store/site." action={<button onClick={save} disabled={saving || !dirty} className="btn-ink py-2.5 px-5 text-[10px]">{saving && <Loader2 size={12} className="animate-spin" />} Save changes</button>} />

      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow text-[10px] text-stone">Hero slider</p>
            <p className="text-sm text-ink-3 mt-1">Up to 5 landscape images (1600px+ wide recommended). {usingDefaults && "Currently showing the bundled defaults."}</p>
          </div>
          <button onClick={() => heroRef.current?.click()} disabled={keep.length + newHero.length >= 5} className="btn-outline py-2 px-4 text-[10px]"><ImagePlus size={13} /> Add image</button>
          <input ref={heroRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files && setNewHero((p) => [...p, ...Array.from(e.target.files!)].slice(0, 5 - keep.length))} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(usingDefaults ? home.hero : keep).map((u) => (
            <div key={u} className="relative aspect-video bg-bone-2 overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
              {!usingDefaults && <button onClick={() => setKeep(keep.filter((x) => x !== u))} className="absolute top-1 right-1 bg-ink/80 text-bone p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>}
              {usingDefaults && <span className="absolute bottom-1 left-1 bg-ink/70 text-bone text-[9px] px-1.5 py-0.5 uppercase tracking-wider">Default</span>}
            </div>
          ))}
          {previews.map((u, i) => (
            <div key={u} className="relative aspect-video bg-bone-2 overflow-hidden group ring-1 ring-brass">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="h-full w-full object-cover" />
              <button onClick={() => setNewHero(newHero.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-ink/80 text-bone p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 space-y-4">
        <p className="eyebrow text-[10px] text-stone">Category tiles</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {home.categories.map((c) => {
            const pending = catFiles[c.slug];
            const src = pending ? URL.createObjectURL(pending) : c.image;
            const isDefault = c.image.startsWith("/");
            return (
              <div key={c.slug} className="space-y-2">
                <div className={`relative aspect-[4/5] bg-bone-2 overflow-hidden ${pending ? "ring-1 ring-brass" : ""}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={c.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink/80 to-transparent text-bone"><p className="font-serif text-xl">{c.name}</p></div>
                </div>
                <div className="flex gap-2">
                  <label className="btn-outline flex-1 py-2 text-[10px] cursor-pointer">
                    <ImagePlus size={12} /> Replace
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => e.target.files?.[0] && setCatFiles({ ...catFiles, [c.slug]: e.target.files[0] })} />
                  </label>
                  {!isDefault && <button onClick={() => resetCategory(c.slug)} className="btn-outline py-2 px-3 text-[10px]" title="Reset to default"><RotateCcw size={12} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
