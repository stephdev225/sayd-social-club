import Image from "next/image";

/**
 * Page opening (home, gallery): one photo behind the whole first screen, text written on it.
 * No zoom and no animation on the photo, and high-resolution sources (3000 px wide on
 * large screens, a portrait version on phones) so it stays sharp. It fades into the page
 * colour at the bottom: no visible edge.
 */
export function HeroBrand({
  image,
  imageMobile,
  alt = "",
  className = "min-h-[100svh]",
  children,
}: {
  image: string;
  /** Portrait photo for phones (optional: otherwise the landscape one is cropped). */
  imageMobile?: string;
  alt?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`relative isolate flex flex-col justify-end overflow-hidden ${className}`}>
      <div className="absolute inset-0 -z-10">
        {imageMobile && <Image src={imageMobile} alt={alt} fill priority sizes="100vw" className="object-cover md:hidden" />}
        <Image src={image} alt={alt} fill priority sizes="100vw" className={`object-cover ${imageMobile ? "hidden md:block" : ""}`} />
        {/* Shade only where the text sits, then a long fade into the page */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#120f0e_0%,rgba(18,15,14,0.75)_22%,rgba(18,15,14,0.25)_50%,rgba(18,15,14,0.15)_100%)] md:bg-[linear-gradient(to_right,rgba(18,15,14,0.8)_0%,rgba(18,15,14,0.45)_40%,transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-night to-transparent" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-night/50 to-transparent" />
      </div>
      <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-32 sm:px-6 md:pb-20 lg:px-10">{children}</div>
    </section>
  );
}
