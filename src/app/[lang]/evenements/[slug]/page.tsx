import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Countdown } from "@/components/Countdown";
import { MobileBuyBar } from "@/components/MobileBuyBar";
import { NotifyForm } from "@/components/NotifyForm";
import { Reveal } from "@/components/motion/Reveal";
import { SplitTitle } from "@/components/motion/SplitTitle";
import { TicketPurchase } from "@/components/TicketPurchase";
import { canSellOnline } from "@/lib/checkout-availability";
import { getStore } from "@/lib/data";
import { getEventBySlug, listTicketTypes, lowestPrice } from "@/lib/data/catalog";
import { availableQuantity } from "@/lib/domain/inventory";
import { formatMoney, priceWithTaxes } from "@/lib/domain/money";
import { hasLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { formatDate, formatTime } from "@/lib/i18n/format";
import { alternates } from "@/lib/seo";
import { site } from "@/lib/site";

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
    alternates: alternates(lang, `/evenements/${event.slug}`),
    openGraph: { title, description: event.tagline[lang], type: "website", images: event.heroImage ?? event.coverImage ? [{ url: (event.heroImage ?? event.coverImage)!, alt: event.name }] : [] },
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
  const external = !onSale && !isPast && event.status === "published" ? event.externalTicketUrl : undefined;
  const canBuy = onSale || Boolean(external);
  const hero = event.heroImage ?? event.coverImage;
  const from = lowestPrice(types);
  const priceLabel = from !== null ? formatMoney(priceWithTaxes(from), lang) : null;
  const rawDate = formatDate(event.startsAt, lang);
  const dateLabel = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

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
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header className="relative isolate overflow-hidden">
        <div className={`mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-24 sm:px-6 md:pt-32 lg:items-end lg:gap-14 lg:px-10 lg:pb-20 ${hero ? "lg:grid-cols-[1.25fr_1fr]" : "md:pt-40"}`}>
          {/* The visual on its own, without the poster text, so the image breathes */}
          {hero && (
            <Reveal kind="mask" delay={0.15}>
              <div className="relative -mx-5 aspect-[4/3] sm:mx-0 lg:aspect-[1080/900]">
                <Image
                  src={hero}
                  alt={`${event.name} — ${event.venueName}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover sm:rounded-3xl"
                />
                <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-night to-transparent sm:hidden" />
              </div>
            </Reveal>
          )}

          <div>
            {/* What the poster said, moved here */}
            <Reveal delay={0.25}>
              <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-[0.95rem]">
                <dt className="text-sable">{dict.events.doors}</dt>
                <dd className="text-ink">{dateLabel} · {formatTime(event.startsAt, lang)} – {formatTime(event.endsAt, lang)}</dd>
                <dt className="text-sable">{dict.events.venue}</dt>
                <dd className="text-ink">{event.venueName}, {event.address}, {event.city}</dd>
                {event.lineup.length > 0 && (
                  <>
                    <dt className="text-sable">{dict.events.lineup}</dt>
                    <dd className="text-ink">
                      {event.lineup.map((name, i) => {
                        const href = event.instagram?.[name];
                        return (
                          <span key={name}>
                            {i > 0 && ", "}
                            {href ? (
                              <a href={href} target="_blank" rel="noopener noreferrer" className="link-draw pb-0.5">DJ {name}</a>
                            ) : (
                              `DJ ${name}`
                            )}
                          </span>
                        );
                      })}
                    </dd>
                  </>
                )}
                <dt className="text-sable">{dict.events.reservations}</dt>
                <dd><a href={site.phoneHref} className="link-draw pb-0.5 text-ink">{site.phone}</a></dd>
              </dl>
            </Reveal>

            {event.partners.length > 0 && (
              <Reveal delay={0.35}>
                <p className="mb-4 mt-10 text-ink/70">
                  {dict.events.presentedBy} {event.partners.join(" × ")}
                </p>
              </Reveal>
            )}
            <h1 className="font-display text-[clamp(3rem,8vw,7rem)] font-medium leading-[0.86] tracking-[-0.035em]">
              <SplitTitle text={event.name} />
              {event.edition && <span className="mt-4 block text-[0.3em] italic tracking-normal text-sable">{event.edition[lang]}</span>}
            </h1>
            <p className="mt-5 max-w-xl font-display text-2xl italic text-ink/90">{event.tagline[lang]}</p>
            {!isPast && (
              <div className="mt-8">
                <Countdown to={event.startsAt} lang={lang} />
              </div>
            )}
            <Reveal delay={0.45}>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
                {canBuy && (
                  <a href="#billets" className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-sable px-8 font-semibold text-night transition hover:brightness-110">
                    {dict.funnel.cta}
                    <span aria-hidden className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
                  </a>
                )}
                {event.coverImage && (
                  <a href={event.coverImage} target="_blank" rel="noopener" className="link-draw pb-1 text-ink/80">{dict.funnel.seePoster}</a>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_27rem] lg:px-10">
        <div className="order-2 max-w-2xl lg:order-1">
          <Reveal>
            <p className="text-lg leading-relaxed text-ink/90">{event.description[lang]}</p>
          </Reveal>
          {event.dressCode && (
            <Reveal>
              <section className="mt-10 border-l-2 border-sable pl-5">
                <h2 className="text-sm text-muted">{dict.events.dressCode}</h2>
                <p className="mt-1 text-ink">{event.dressCode[lang]}</p>
              </section>
            </Reveal>
          )}
        </div>

        <aside id="billets" className="order-1 scroll-mt-24 lg:order-2 lg:sticky lg:top-28 lg:self-start">
          {external ? (
            <div className="rounded-3xl bg-night-2/80 p-6 ring-1 ring-ink/10 backdrop-blur sm:p-8">
              <h2 className="t-h3">{dict.tickets.title}</h2>
              {priceLabel && <p className="mt-5 font-display text-5xl leading-none">{priceLabel}</p>}
              <p className="mt-2 text-sm text-ink/60">{dict.tickets.pricesNote.split(".")[0]}. {dict.funnel.onlineCheaper}.</p>
              <p className="mt-6 text-ink/80">{dict.tickets.externalNote}</p>
              <a
                href={external}
                target="_blank"
                rel="noopener"
                className="group mt-8 flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-sable px-8 font-semibold text-night transition hover:brightness-110"
              >
                {dict.tickets.externalCta}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
              </a>
            </div>
          ) : !onSale && !isPast && event.status === "published" ? (
            <div className="rounded-3xl bg-night-2/80 p-6 ring-1 ring-ink/10 backdrop-blur sm:p-8">
              <h2 className="t-h3">{dict.tickets.soonTitle}</h2>
              <p className="mb-6 mt-3 text-ink/75">{dict.tickets.soonText}</p>
              <NotifyForm lang={lang} labels={dict.notify} source={`event:${event.slug}`} />
            </div>
          ) : (
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
          )}
        </aside>
      </div>

      {canBuy && <MobileBuyBar label={dict.funnel.buyBar} title={event.name} note={`${dateLabel} · ${event.venueName}`} />}
    </article>
  );
}
