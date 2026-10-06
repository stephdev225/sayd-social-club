import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EventFacts } from "@/components/EventFacts";
import { Countdown } from "@/components/Countdown";
import { Reveal } from "@/components/motion/Reveal";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { TicketPurchase } from "@/components/TicketPurchase";
import { canSellOnline } from "@/lib/checkout-availability";
import { getStore } from "@/lib/data";
import { getEventBySlug, listTicketTypes } from "@/lib/data/catalog";
import { availableQuantity } from "@/lib/domain/inventory";
import { priceWithTaxes } from "@/lib/domain/money";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate } from "@/lib/i18n/format";

export const dynamic = "force-dynamic"; // stock changes minute to minute

export async function generateMetadata({ params }: PageProps<"/[lang]/evenements/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const event = await getEventBySlug(getStore(), slug);
  if (!event) return {};
  const title = `${event.name} — ${formatDate(event.startsAt, lang, { weekday: undefined })}`;
  return {
    title,
    description: event.tagline[lang],
    openGraph: { title, description: event.tagline[lang], images: event.coverImage ? [event.coverImage] : [] },
  };
}

export default async function EventPage({ params }: PageProps<"/[lang]/evenements/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const store = getStore();
  const event = await getEventBySlug(store, slug);
  if (!event) notFound();

  const types = await listTicketTypes(store, event.id, "online");
  const isPast = new Date(event.endsAt) < new Date();
  const onSale = event.status === "published" && !isPast && canSellOnline();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventStatus: event.status === "cancelled" ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: { "@type": "Place", name: event.venueName, address: `${event.address}, ${event.city}, QC, CA` },
    image: event.coverImage ? [event.coverImage] : undefined,
    description: event.description[lang],
    organizer: event.partners.map((name) => ({ "@type": "Organization", name })),
    offers: types.map((t) => ({
      "@type": "Offer",
      name: t.name[lang],
      price: (priceWithTaxes(t.priceCents) / 100).toFixed(2),
      priceCurrency: "CAD",
      availability: availableQuantity(t) > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
    })),
  };

  return (
    <article style={{ ["--accent" as string]: event.accent ?? "var(--color-night-2)" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header className="bg-[var(--accent)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,20rem)_1fr] md:items-end md:py-16 lg:px-10">
          {event.coverImage && (
            <Reveal kind="mask" delay={0.2}>
            <Image
              src={event.coverImage}
              alt={`${event.name} — ${event.venueName}`}
              width={1080}
              height={1920}
              priority
              sizes="(min-width: 768px) 20rem, 100vw"
              className="mx-auto aspect-[9/16] w-full max-w-[13rem] object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)] sm:max-w-xs md:max-w-none"
            />
            </Reveal>
          )}
          <div>
            {event.partners.length > 0 && (
              <p className="mb-5 text-ink/80">
                {dict.events.presentedBy} {event.partners.join(" × ")}
              </p>
            )}
            <h1 className="font-display text-[clamp(3rem,8.5vw,8.5rem)] font-medium leading-[0.86] tracking-[-0.035em]">
              <SplitTitle text={event.name} />
              {event.edition && <span className="mt-6 block text-[0.28em] italic tracking-normal text-sable">{event.edition[lang]}</span>}
            </h1>
            <p className="mt-6 max-w-xl font-display text-2xl italic">{event.tagline[lang]}</p>
            {!isPast && (
              <div className="mt-8">
                <Countdown to={event.startsAt} lang={lang} />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_27rem] lg:px-10">
        <div className="order-2 max-w-2xl lg:order-1">
          <EventFacts event={event} lang={lang} dict={dict} />
          <p className="mt-10 text-lg leading-relaxed text-ink/90">{event.description[lang]}</p>
          {event.dressCode && (
            <section className="mt-10 border-l-2 border-sable pl-5">
              <h2 className="text-sm text-muted">{dict.events.dressCode}</h2>
              <p className="mt-1 text-ink">{event.dressCode[lang]}</p>
            </section>
          )}
        </div>

        <aside id="billets" className="order-1 scroll-mt-24 lg:order-2 lg:sticky lg:top-28 lg:self-start">
          <TicketPurchase
            lang={lang}
            eventId={event.id}
            onSale={onSale}
            dict={{ tickets: dict.tickets }}
            ticketTypes={types.map((t) => ({
              id: t.id,
              name: t.name[lang],
              description: t.description[lang],
              priceCents: t.priceCents,
              available: availableQuantity(t),
              maxPerOrder: t.maxPerOrder,
            }))}
          />
        </aside>
      </div>
    </article>
  );
}
