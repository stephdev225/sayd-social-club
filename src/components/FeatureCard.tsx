import Image from "next/image";
import { Reveal } from "./motion/Reveal";

/**
 * Photo with a text panel floating over its edge (Le club, ambassadors, partners).
 * No frame, no box over the picture: the photo is square-cornered and melts into the page
 * on the side of the text (phones: at the bottom), so nothing hides the people in it.
 * Phones: the photo full width, the text rising over its faded lower edge.
 * Larger screens: photo on one side, the text beside it, over the faded edge only.
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
          className={`relative aspect-[4/5] overflow-hidden md:row-start-1 md:col-span-5 ${
            reverse
              ? "md:col-start-8 md:[mask-image:linear-gradient(to_right,transparent_0%,black_16%)]"
              : "md:col-start-1 md:[mask-image:linear-gradient(to_left,transparent_0%,black_16%)]"
          }`}
        >
          <Image src={image} alt={alt} fill priority={priority} sizes="(min-width: 768px) 42vw, 100vw" className="object-cover" />
          {/* Phones: the photo melts into the page under the text */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-night via-night/60 to-transparent md:hidden" />
        </Reveal>
        <div
          className={`relative z-10 -mt-20 px-1 pb-2 sm:px-4 md:row-start-1 md:mt-0 md:py-12 lg:py-16 ${
            reverse ? "md:col-start-1 md:col-end-9 md:pl-0 md:pr-[18%]" : "md:col-start-5 md:col-end-13 md:pl-[18%] md:pr-0"
          }`}
        >
          <Reveal delay={0.15}>{children}</Reveal>
        </div>
      </div>
    </div>
  );
}
