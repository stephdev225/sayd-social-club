import Image from "next/image";

/**
 * Full-bleed photo behind the top of a page. It dissolves into the page colour towards
 * the bottom (CSS mask, no visible edge), so it melts into the footer on short pages.
 * Portrait photo on phones, landscape from 768 px. Colours untouched; a soft shade only
 * where text sits (left on wide screens, bottom on phones).
 */
export function PageBackdrop({ portrait, land, alt = "" }: { portrait: string; land: string; alt?: string }) {
  return (
    <div aria-hidden={alt ? undefined : true} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,black_50%,transparent_100%)]">
      <Image src={portrait} alt={alt} fill priority sizes="100vw" className="object-cover md:hidden" />
      <Image src={land} alt={alt} fill priority sizes="100vw" className="hidden object-cover md:block" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,15,14,0.35)_0%,rgba(18,15,14,0.55)_45%,rgba(18,15,14,0.92)_80%)] md:bg-[linear-gradient(to_right,rgba(18,15,14,0.92)_0%,rgba(18,15,14,0.7)_38%,rgba(18,15,14,0.25)_75%,rgba(18,15,14,0.15)_100%)]" />
    </div>
  );
}
