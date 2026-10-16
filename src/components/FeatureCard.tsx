import Image from "next/image";
import { Reveal } from "./motion/Reveal";

/**
 * Photo with a floating glass panel overlapping it (Le club, ambassadors, partners).
 * Phones: the photo full width, the panel rising over its lower edge.
 * Larger screens: photo on one side, the panel overlapping it from the other side.
 */
export function FeatureCard({
  image,
  alt,
  reverse = false,
  priority = false,
  children,
}: {
  image: string;
  alt: string;
  /** Photo on the right instead of the left. */
  reverse?: boolean;
  priority?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
      <div className="md:grid md:grid-cols-12 md:items-center">
        <Reveal
          kind="mask"
          className={`relative aspect-[4/5] overflow-hidden rounded-[1.75rem] md:row-start-1 md:col-span-5 ${reverse ? "md:col-start-8" : "md:col-start-1"}`}
        >
          <Image src={image} alt={alt} fill priority={priority} sizes="(min-width: 768px) 42vw, 100vw" className="object-cover" />
        </Reveal>
        <Reveal
          delay={0.15}
          className={`relative z-10 mx-3 -mt-24 rounded-[1.75rem] border border-ink/10 bg-night/75 p-7 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:mx-6 sm:p-10 md:row-start-1 md:mx-0 md:mt-0 md:p-12 lg:p-16 ${
            reverse ? "md:col-start-1 md:col-end-9" : "md:col-start-5 md:col-end-13"
          }`}
        >
          {children}
        </Reveal>
      </div>
    </div>
  );
}
