"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, X, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/component/ui/Toast";
import { PageHeader, Spinner } from "../ui";
import type { HomeContent } from "@/lib/home";

const MAX_HERO = 5;
const MAX_LOOKBOOK = 3;
const ACCEPT = "image/jpeg,image/png,image/webp";

interface NewTile { file: File; label: string; link: string }

function useObjectUrls(files: File[]) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const next = files.map((f) => URL.createObjectURL(f));
    setUrls(next);
    return () => next.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);
  return urls;
}

function Empty({ hint, className = "" }: { hint: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center text-center text-xs text-stone border border-dashed border-bone-3 bg-bone-2/40 p-4 ${className}`}>
      {hint}
    </div>
  );
}

export default function HomeContentTab() {
  const [home, setHome] = useState<HomeContent | null>(null);
  const [saving, setSaving] = useState(false);

  // hero
  const [keep, setKeep] = useState<string[]>([]);
  const [newHero, setNewHero] = useState<File[]>([]);
  const heroPreviews = useObjectUrls(newHero);
  const heroRef = useRef<HTMLInputElement>(null);

  // categories
  const [catFiles, setCatFiles] = useState<Record<string, File>>({});
  const catList = useMemo(() => Object.values(catFiles), [catFiles]);
  const catPreviews = useObjectUrls(catList);

  // editorial
  const [editorialFile, setEditorialFile] = useState<File | null>(null);
  const editorialList = useMemo(() => (editorialFile ? [editorialFile] : []), [editorialFile]);
  const [editorialPreview] = useObjectUrls(editorialList);

  // lookbook
  const [keepTiles, setKeepTiles] = useState<number[]>([]);
  const [tileText, setTileText] = useState<Record<number, { label: string; link: string }>>({});
  const [newTiles, setNewTiles] = useState<NewTile[]>([]);
  const newTileFiles = useMemo(() => newTiles.map((t) => t.file), [newTiles]);
  const tilePreviews = useObjectUrls(newTileFiles);
  const lookRef = useRef<HTMLInputElement>(null);

  const apply = (d: HomeContent) => {
    setHome(d);
    setKeep(d.hero);
    setKeepTiles(d.lookbook.map((t) => t.id));
    setTileText(Object.fromEntries(d.lookbook.map((t) => [t.id, { label: t.label, link: t.link }])));
    setNewHero([]);
    setCatFiles({});
    setEditorialFile(null);
    setNewTiles([]);
  };

  useEffect(() => {
    fetch("/api/home", { cache: "no-store" }).then((r) => r.json()).then(apply);
  }, []);

  if (!home) return <Spinner />;

  const textDirty = home.lookbook.some((t) => tileText[t.id] && (tileText[t.id].label !== t.label || tileText[t.id].link !== t.link));
  const dirty =
    newHero.length > 0 ||
    keep.length !== home.hero.length ||
    catList.length > 0 ||
    !!editorialFile ||
    newTiles.length > 0 ||
    keepTiles.length !== home.lookbook.length ||
    textDirty;

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("heroKeep", keep.join(","));
      newHero.forEach((f) => fd.append("heroNew", f));
      Object.entries(catFiles).forEach(([slug, f]) => fd.append(`categoryImage_${slug}`, f));
      if (editorialFile) fd.append("editorialNew", editorialFile);
      fd.append("lookbookKeep", keepTiles.join(","));
      for (const id of keepTiles) {
        const t = tileText[id];
        if (!t) continue;
        fd.append(`lookbookLabel_${id}`, t.label);
        fd.append(`lookbookLink_${id}`, t.link);
      }
      newTiles.forEach((t) => {
        fd.append("lookbookNew", t.file);
        fd.append("lookbookLabel", t.label);
        fd.append("lookbookLink", t.link);
      });
      const r = await fetch("/api/home", { method: "PUT", body: fd });
      const d = await r.json();
      if (!r.ok) return toast.error(d.error || "Save failed");
      toast.success("Home content updated");
      apply(d);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (body: { slug?: string; slot?: string }, msg: string) => {
    const r = await fetch("/api/home", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) {
      apply(await r.json());
      toast.success(msg);
    } else toast.error("Delete failed");
  };

  const heroCount = keep.length + newHero.length;
  const tileCount = keepTiles.length + newTiles.length;
  const visibleTiles = home.lookbook.filter((t) => keepTiles.includes(t.id));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Home content"
        subtitle="Every image on the home page is managed here. Uploads go to Cloudinary under mens_store/site."
        action={<button onClick={save} disabled={saving || !dirty} className="btn-ink py-2.5 px-5 text-[10px]">{saving && <Loader2 size={12} className="animate-spin" />} Save changes</button>}
      />

      {/* Hero */}
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-[10px] text-stone">Hero slider</p>
            <p className="text-sm text-ink-3 mt-1">Up to {MAX_HERO} landscape images (1600px+ wide). {heroCount}/{MAX_HERO}</p>
          </div>
          <button onClick={() => heroRef.current?.click()} disabled={heroCount >= MAX_HERO} className="btn-outline py-2 px-4 text-[10px]"><ImagePlus size={13} /> Add image</button>
          <input ref={heroRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => { if (e.target.files) setNewHero((p) => [...p, ...Array.from(e.target.files!)].slice(0, MAX_HERO - keep.length)); e.target.value = ""; }} />
        </div>
        {heroCount === 0 ? (
          <Empty hint="No hero images yet — the hero shows a plain dark background until you upload some." className="aspect-[5/1]" />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {keep.map((u) => (
              <div key={u} className="relative aspect-video bg-bone-2 overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-full w-full object-cover" />
                <button onClick={() => setKeep(keep.filter((x) => x !== u))} className="absolute top-1 right-1 bg-ink/80 text-bone p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
              </div>
            ))}
            {heroPreviews.map((u, i) => (
              <div key={u} className="relative aspect-video bg-bone-2 overflow-hidden group ring-1 ring-brass">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="h-full w-full object-cover" />
                <button onClick={() => setNewHero(newHero.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-ink/80 text-bone p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="card p-6 space-y-4">
        <p className="eyebrow text-[10px] text-stone">Category tiles</p>
        <div className="grid sm:grid-cols-3 gap-4">
          {home.categories.map((c) => {
            const pendingIdx = catList.indexOf(catFiles[c.slug]);
            const src = pendingIdx >= 0 ? catPreviews[pendingIdx] : c.image;
            return (
              <div key={c.slug} className="space-y-2">
                <div className={`relative aspect-[4/5] bg-bone-2 overflow-hidden ${pendingIdx >= 0 ? "ring-1 ring-brass" : ""}`}>
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={c.name} className="h-full w-full object-cover" />
                  ) : (
                    <Empty hint="No image" className="absolute inset-0 border-0" />
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-ink/80 to-transparent text-bone"><p className="font-serif text-xl">{c.name}</p></div>
                </div>
                <div className="flex gap-2">
                  <label className="btn-outline flex-1 py-2 text-[10px] cursor-pointer">
                    <ImagePlus size={12} /> {c.image ? "Replace" : "Upload"}
                    <input type="file" accept={ACCEPT} className="hidden" onChange={(e) => { if (e.target.files?.[0]) setCatFiles({ ...catFiles, [c.slug]: e.target.files[0] }); e.target.value = ""; }} />
                  </label>
                  {c.image && <button onClick={() => remove({ slug: c.slug }, `${c.name} image removed`)} className="btn-outline py-2 px-3 text-[10px]" title="Remove image"><Trash2 size={12} /></button>}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Editorial */}
      <section className="card p-6 space-y-4">
        <div>
          <p className="eyebrow text-[10px] text-stone">Editorial image</p>
          <p className="text-sm text-ink-3 mt-1">Portrait image beside the &ldquo;Our philosophy&rdquo; copy.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className={`relative aspect-[4/5] bg-bone-2 overflow-hidden ${editorialFile ? "ring-1 ring-brass" : ""}`}>
              {editorialPreview || home.editorial ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={editorialPreview || home.editorial!} alt="" className="h-full w-full object-cover" />
              ) : (
                <Empty hint="No image" className="absolute inset-0 border-0" />
              )}
            </div>
            <div className="flex gap-2">
              <label className="btn-outline flex-1 py-2 text-[10px] cursor-pointer">
                <ImagePlus size={12} /> {home.editorial ? "Replace" : "Upload"}
                <input type="file" accept={ACCEPT} className="hidden" onChange={(e) => { setEditorialFile(e.target.files?.[0] ?? null); e.target.value = ""; }} />
              </label>
              {home.editorial && <button onClick={() => remove({ slot: "editorial" }, "Editorial image removed")} className="btn-outline py-2 px-3 text-[10px]" title="Remove image"><Trash2 size={12} /></button>}
            </div>
          </div>
        </div>
      </section>

      {/* Lookbook */}
      <section className="card p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow text-[10px] text-stone">Lookbook tiles</p>
            <p className="text-sm text-ink-3 mt-1">Up to {MAX_LOOKBOOK} portrait tiles with a caption and link. Section is hidden when empty. {tileCount}/{MAX_LOOKBOOK}</p>
          </div>
          <button onClick={() => lookRef.current?.click()} disabled={tileCount >= MAX_LOOKBOOK} className="btn-outline py-2 px-4 text-[10px]"><ImagePlus size={13} /> Add tile</button>
          <input ref={lookRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(e) => { if (e.target.files) setNewTiles((p) => [...p, ...Array.from(e.target.files!).map((file) => ({ file, label: "", link: "/" }))].slice(0, MAX_LOOKBOOK - keepTiles.length)); e.target.value = ""; }} />
        </div>
        {tileCount === 0 ? (
          <Empty hint="No lookbook tiles yet." className="aspect-[5/1]" />
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {visibleTiles.map((t) => (
              <div key={t.id} className="space-y-2">
                <div className="relative aspect-[3/4] bg-bone-2 overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.image} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => setKeepTiles(keepTiles.filter((id) => id !== t.id))} className="absolute top-1 right-1 bg-ink/80 text-bone p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
                </div>
                <input className="field py-2 text-xs" placeholder="Caption" value={tileText[t.id]?.label ?? ""} onChange={(e) => setTileText({ ...tileText, [t.id]: { ...tileText[t.id], label: e.target.value } })} />
                <input className="field py-2 text-xs" placeholder="Link (e.g. /shirts)" value={tileText[t.id]?.link ?? ""} onChange={(e) => setTileText({ ...tileText, [t.id]: { ...tileText[t.id], link: e.target.value } })} />
              </div>
            ))}
            {newTiles.map((t, i) => (
              <div key={tilePreviews[i] ?? i} className="space-y-2">
                <div className="relative aspect-[3/4] bg-bone-2 overflow-hidden group ring-1 ring-brass">
                  {tilePreviews[i] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tilePreviews[i]} alt="" className="h-full w-full object-cover" />
                  )}
                  <button onClick={() => setNewTiles(newTiles.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-ink/80 text-bone p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
                </div>
                <input className="field py-2 text-xs" placeholder="Caption" value={t.label} onChange={(e) => setNewTiles(newTiles.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <input className="field py-2 text-xs" placeholder="Link (e.g. /shirts)" value={t.link} onChange={(e) => setNewTiles(newTiles.map((x, j) => (j === i ? { ...x, link: e.target.value } : x)))} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
