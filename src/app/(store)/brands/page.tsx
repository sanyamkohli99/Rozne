import { Shell } from "@/components/layouts/Shell";

export const metadata = {
  title: "Brands & Designers | ROZNE",
  description: "Discover the brands and designers behind ROZNE.",
};

const brands = [
  {
    name: "Arko Studio",
    category: "Furniture & Living",
    description:
      "Minimalist furniture crafted from sustainably sourced materials.",
  },
  {
    name: "Lumé",
    category: "Lighting",
    description:
      "Handmade lighting collections that transform any space.",
  },
  {
    name: "Forrest & Co.",
    category: "Textiles",
    description:
      "Organic cotton and linen homewares made in small batches.",
  },
  {
    name: "Serai",
    category: "Kitchen & Bath",
    description:
      "Functional, beautiful objects for the most-used rooms in your home.",
  },
];

export default function BrandsPage() {
  return (
    <main className="pt-[50px]">
      <section className="w-full bg-zinc-900 py-24 px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-400 mb-4">
          Partners
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Brands &amp; Designers
        </h1>
        <p className="text-zinc-300 max-w-2xl mx-auto text-lg font-light">
          We curate only the best — makers who share our values and craft with
          purpose.
        </p>
      </section>

      <Shell>
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="border border-border rounded-xl p-8 hover:bg-secondary transition-colors"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {brand.category}
              </p>
              <h2 className="text-2xl font-semibold mb-3">{brand.name}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {brand.description}
              </p>
            </div>
          ))}
        </div>
      </Shell>
    </main>
  );
}
