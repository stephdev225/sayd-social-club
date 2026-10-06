import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <h1 className="t-h1">Page introuvable</h1>
      <p className="mt-5 text-muted">Cette page n&apos;existe pas ou a été déplacée. / This page doesn&apos;t exist.</p>
      <div className="mt-8 flex gap-6">
        <Link href="/fr" className="text-sable underline underline-offset-4">Accueil</Link>
        <Link href="/en" className="text-sable underline underline-offset-4">Home</Link>
      </div>
    </div>
  );
}
