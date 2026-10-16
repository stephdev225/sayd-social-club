import Image from "next/image";

/**
 * Page opening (home, gallery): one photo behind the opening, text written on it.
 * The section takes the photo's own proportions (3:2 on larger screens, 2:3 portrait on
 * phones), so the photo is shown whole instead of being cropped and enlarged to fill a
 * tall window. No zoom, no animation. It fades into the page colour at the bottom.
 */
export function HeroBrand({
  image,
  imageMobile,
  alt = "",
  children,
}: {
  /** Landscape photo, 3:2. */
  image: string;
  /** Portrait photo for phones, 2:3 (optional). */
  imageMobile?: string;
  alt?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`relative isolate flex w-full flex-col justify-end overflow-hidden md:aspect-[3/2] md:max-h-[100svh] md:min-h-[34rem] ${
        imageMobile ? "aspect-[2/3] max-h-[100svh]" : "aspect-[4/5]"
      }`}
    >
      <div className="absolute inset-0 -z-10">
        {imageMobile && <Image src={imageMobile} alt={alt} fill priority sizes="100vw" className="object-cover md:hidden" />}
        <Image src={image} alt={alt} fill priority sizes="100vw" className={`object-cover ${imageMobile ? "hidden md:block" : ""}`} />
        {/* Light shade only behind the words, then a long fade into the page */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,#120f0e_0%,rgba(18,15,14,0.6)_25%,transparent_55%)] md:bg-[linear-gradient(to_right,rgba(18,15,14,0.7)_0%,rgba(18,15,14,0.3)_38%,transparent_62%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night to-transparent md:h-48" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-night/45 to-transparent" />
      </div>
      <div className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-6 md:pb-16 lg:px-10">{children}</div>
    </section>
  );
}
