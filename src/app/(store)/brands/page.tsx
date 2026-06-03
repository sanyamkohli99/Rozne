import { Shell } from "@/components/layouts/Shell";

export const metadata = {
  title: "Collections | ROZNE",
  description: "Explore ROZNE's range of knitwear — sweaters, woollens, and more.",
};

const collections = [
  {
    name: "Winter Sweaters",
    category: "Knitwear",
    description: "Thick-knit, warm sweaters for the harshest winters. Available in round neck, V-neck, and full-zip styles.",
  },
  {
    name: "Woollen Cardigans",
    category: "Knitwear",
    description: "Lightweight yet warm cardigans, perfect for layering. Available in a variety of colours and patterns.",
  },
  {
    name: "Hosiery Basics",
    category: "Hosiery",
    description: "Everyday knitwear essentials — thermal inners, socks, and undergarments crafted for comfort.",
  },
  {
    name: "Kids Knitwear",
    category: "Kids",
    description: "Soft, cosy knitwear for children — safe materials, vibrant colours, and durable construction.",
  },
  {
    name: "Bulk & Wholesale",
    category: "Trade",
    description: "Factory-direct pricing for retailers and distributors. Contact us for custom bulk orders and private labelling.",
  },
  {
    name: "Custom Orders",
    category: "Custom",
    description: "Have a design in mind? We manufacture to specification — yarn choice, colour, stitch pattern, and branding.",
  },
];

export default function BrandsPage() {
  return (
    <>
      <section className="w-full bg-zinc-900 py-24 px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-400 mb-4">
          What We Make
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Collections
        </h1>
        <p className="text-zinc-300 max-w-2xl mx-auto text-lg font-light">
          Premium hosiery and knitwear — crafted in Ludhiana, the knitwear capital of India.
        </p>
      </section>

      <Shell>
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((item) => (
            <div
              key={item.name}
              className="border border-border rounded-xl p-8 hover:bg-secondary transition-colors"
            >
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {item.category}
              </p>
              <h2 className="text-2xl font-semibold mb-3">{item.name}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground pb-8">Manufactured by KRS Apparels, Ludhiana (Pb.) INDIA</p>
      </Shell>
    </>
  );
}
