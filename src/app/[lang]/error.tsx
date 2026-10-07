"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

const TEXT = {
  fr: { title: "Petit contretemps", body: "Cette page n'a pas pu s'afficher. Réessayez dans un instant.", retry: "Réessayer", home: "Retour à l'accueil" },
  en: { title: "A small hiccup", body: "This page couldn't load. Please try again in a moment.", retry: "Try again", home: "Back to home" },
};

/** Shown instead of a blank page when something fails while rendering. */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const params = useParams<{ lang?: string }>();
  const t = params?.lang === "en" ? TEXT.en : TEXT.fr;
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-32 pt-36 sm:px-6 md:pt-48">
      <h1 className="t-h1">{t.title}</h1>
      <p className="mt-6 text-lg text-ink/80">{t.body}</p>
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-12 items-center rounded-full bg-sable px-7 font-semibold text-night transition hover:brightness-110"
        >
          {t.retry}
        </button>
        <Link href={`/${params?.lang === "en" ? "en" : "fr"}`} className="link-draw pb-1 text-ink/85">
          {t.home}
        </Link>
      </div>
    </div>
  );
}
