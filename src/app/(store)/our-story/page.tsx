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
    <>
      <section className="w-full bg-zinc-900 py-24 px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-400 mb-4">
          Who We Are
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Our Story
        </h1>
        <p className="text-zinc-300 max-w-2xl mx-auto text-lg font-light">
          From the textile capital of India — crafting warmth, stitch by stitch.
        </p>
      </section>

      <Shell>
        <div className="max-w-3xl mx-auto py-16 space-y-10">
          <div>
            <h2 className="text-2xl font-semibold mb-4">About ROZNE</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              ROZNE is a premium knitwear brand rooted in Ludhiana, Punjab — India&apos;s knitwear capital. We bring quality sweaters, woollen wear, and hosiery garments directly to you, with no compromise on craftsmanship or comfort.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">What We Stand For</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Every ROZNE piece is made with precision — from yarn selection to the final stitch. Whether you are looking for everyday warmth or a bulk wholesale order, we deliver factory-direct quality at honest prices.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
            <ul className="space-y-4 text-muted-foreground text-lg">
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">Quality.</span>
                Every garment is crafted with attention to yarn, knit, and finish — no shortcuts.
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">Transparency.</span>
                Direct pricing — what you see is what you pay.
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-foreground">Reliability.</span>
                On-time delivery and consistent quality across every order.
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

          <div className="border-t border-border pt-8 text-sm text-muted-foreground">
            <p>Manufactured by <span className="font-medium text-foreground">KRS Apparels</span> — B-34/3339, Shakti Vihar, Chander Nagar, Ludhiana (Pb.) INDIA</p>
          </div>
        </div>
      </Shell>
    </>
  );
}
