import { Shell } from "@/components/layouts/Shell";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export const metadata = {
  title: "Our Story | ROZNE",
  description: "Learn about the story behind ROZNE.",
};

export default function OurStoryPage() {
  return (
    <main className="pt-[50px]">
      <section className="w-full bg-zinc-900 py-24 px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-400 mb-4">
          Who We Are
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Our Story
        </h1>
        <p className="text-zinc-300 max-w-2xl mx-auto text-lg font-light">
          Born from a belief that great design should be for everyone.
        </p>
      </section>

      <Shell>
        <div className="max-w-3xl mx-auto py-16 space-y-10">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Where it began</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              ROZNE started with a simple question: why do people have to choose
              between quality and affordability? We set out to build a brand that
              refuses that compromise — one that brings thoughtfully designed
              products to everyday life without the premium price tag.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Our values</h2>
            <ul className="space-y-4 text-muted-foreground text-lg">
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">Integrity.</span>
                Every product is designed with honesty — what you see is what you
                get.
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">Sustainability.</span>
                We partner only with makers who put the earth first.
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">Community.</span>
                A portion of every sale funds a meal for a youth in need.
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <Link
              href="/shop"
              className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
            >
              Shop the collection
            </Link>
          </div>
        </div>
      </Shell>
    </main>
  );
}
