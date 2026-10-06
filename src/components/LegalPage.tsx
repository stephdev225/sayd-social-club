export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: { h: string; p: string[] }[] }) {
  return (
    <div className="mx-auto max-w-2xl px-5 pt-28 sm:px-6 md:pt-36">
      <h1 className="t-h1">{title}</h1>
      <p className="mt-4 text-sm text-muted">{updated}</p>
      {sections.map((s) => (
        <section key={s.h} className="mt-10">
          <h2 className="t-h3">{s.h}</h2>
          {s.p.map((p) => (
            <p key={p} className="mt-3 leading-relaxed text-ink/90">
              {p}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
