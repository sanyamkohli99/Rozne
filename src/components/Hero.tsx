import Image from "next/image";
import Link from "next/link";
import RozneLogo from "@/components/layouts/RozneLogo";
import { getHeroImage } from "@/_actions/settings";
import { keytoUrl } from "@/lib/utils";

export default async function Hero() {
  const heroImage = await getHeroImage();

  return (
    <section className="relative w-full h-[600px] md:h-[800px] mx-auto overflow-hidden">
      <Image
        alt="ROZNE Knitwear Collection"
        src={keytoUrl(heroImage)}
        fill
        priority
        quality={85}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2C2420]/80 via-[#2C2420]/10 to-transparent" />
      <div className="container relative z-10 py-8 h-full w-full">
        <div className="flex flex-col justify-end h-full pb-20 md:pb-28 gap-y-5">
          <div className="text-white">
            <RozneLogo className="text-5xl md:text-8xl" />
          </div>
          <p className="text-white/70 text-sm md:text-base max-w-xs leading-relaxed tracking-wide font-light">
            Sweaters, cardigans &amp; hosiery
            <br />
            crafted for real warmth.
          </p>
          <div className="flex items-center gap-x-4 mt-2">
            <Link
              href="/shop"
              className="bg-white/15 backdrop-blur-md border border-white/20 text-white px-8 py-3 md:px-10 md:py-4 text-xs tracking-widest uppercase font-medium hover:bg-white/25 transition-all duration-200"
            >
              Shop Collection
            </Link>
            <Link
              href="/shop"
              className="text-white/60 text-xs tracking-widest uppercase hover:text-white transition-colors duration-150"
            >
              View all →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
