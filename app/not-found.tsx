import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-32 text-center">
      <p className="eyebrow text-brass mb-3">404</p>
      <h1 className="display text-5xl mb-4">This page has moved on.</h1>
      <p className="text-ink-3 mb-10">The link may be out of date, or the item is no longer available.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-ink">Back to home</Link>
        <Link href="/shirts" className="btn-outline">Shop shirts</Link>
      </div>
    </div>
  );
}
