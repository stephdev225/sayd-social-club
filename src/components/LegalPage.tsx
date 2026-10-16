type Section = { h: string; p: string[] };

/** Groups consecutive "• " lines into a list; everything else is a paragraph. */
function blocks(lines: string[]) {
  const out: ({ kind: "p"; text: string } | { kind: "ul"; items: string[] })[] = [];
  for (const line of lines) {
    if (line.startsWith("• ")) {
      const last = out[out.length - 1];
      if (last?.kind === "ul") last.items.push(line.slice(2));
      else out.push({ kind: "ul", items: [line.slice(2)] });
    } else out.push({ kind: "p", text: line });
  }
  return out;
}

export function LegalPage({ title, updated, sections }: { title: string; updated: string; sections: Section[] }) {
  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-28 sm:px-6 md:pt-36">
      <h1 className="t-h1">{title}</h1>
      <p className="mt-4 text-sm text-muted">{updated}</p>
      {sections.map((s) => (
        <section key={s.h} className="mt-10">
          <h2 className="t-h3">{s.h}</h2>
          {blocks(s.p).map((b, i) =>
            b.kind === "p" ? (
              <p key={i} className="mt-3 leading-relaxed text-ink/90">
                {b.text}
              </p>
            ) : (
              <ul key={i} className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-ink/90 marker:text-ink/40">
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            ),
          )}
        </section>
      ))}
    </div>
  );
}
