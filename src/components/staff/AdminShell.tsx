import Image from "next/image";
import Link from "next/link";

type Section = "dashboard" | "events" | "contacts";

/** Sidebar layout shared by every admin page. */
export function AdminShell({
  active,
  staffName,
  extraLinks = [],
  children,
}: {
  active: Section;
  staffName: string;
  extraLinks?: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const main: { href: string; label: string; key: Section }[] = [
    { href: "/admin", label: "Tableau de bord", key: "dashboard" },
    { href: "/admin/evenements", label: "Événements", key: "events" },
    { href: "/admin/contacts", label: "Contacts", key: "contacts" },
  ];
  return (
    <div className="lg:grid lg:min-h-svh lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-night-2 p-5 lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:border-b-0 lg:border-r">
        <Link href="/admin" aria-label="Tableau de bord">
          <Image src="/brand/logo-block-ivory.png" alt="Sayd Social Club" width={560} height={590} className="h-12 w-auto" />
        </Link>
        <nav aria-label="Admin" className="mt-8 flex gap-1 overflow-x-auto text-sm lg:flex-col">
          {main.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active === l.key ? "page" : undefined}
              className="whitespace-nowrap rounded-md px-3 py-2 text-muted transition-colors hover:bg-night hover:text-ink aria-[current=page]:bg-night aria-[current=page]:text-ink"
            >
              {l.label}
            </Link>
          ))}
          {extraLinks.map((l) => (
            <a key={l.href} href={l.href} className="whitespace-nowrap rounded-md px-3 py-2 text-muted hover:bg-night hover:text-ink lg:pl-6 lg:text-[0.8rem]">
              {l.label}
            </a>
          ))}
          <Link href="/scan" className="whitespace-nowrap rounded-md px-3 py-2 text-sable hover:bg-night lg:mt-4">
            Scanner à la porte →
          </Link>
          <a href="/fr" target="_blank" rel="noopener" className="whitespace-nowrap rounded-md px-3 py-2 text-muted hover:bg-night hover:text-ink">
            Voir le site ↗
          </a>
        </nav>
        <form action="/api/staff/logout" method="post" className="mt-6 lg:mt-auto">
          <p className="text-xs text-muted">Connecté : {staffName}</p>
          <button className="mt-1 text-sm text-muted underline hover:text-ink">Se déconnecter</button>
        </form>
      </aside>
      <main className="min-w-0 space-y-12 p-5 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
