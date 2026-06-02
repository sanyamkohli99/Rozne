import { Shell } from "@/components/layouts/Shell";

export const metadata = {
  title: "Blog | ROZNE",
  description: "Ideas, inspiration, and stories from ROZNE.",
};

const posts = [
  {
    date: "May 2025",
    category: "Design",
    title: "The case for buying less, but better",
    excerpt:
      "In a world of fast furniture and disposable décor, we make the case for slowing down and choosing pieces that last.",
  },
  {
    date: "April 2025",
    category: "Sustainability",
    title: "How we vet every supplier before partnering",
    excerpt:
      "Our sourcing process is rigorous by design. Here's exactly what we look for before a brand earns a place in our catalogue.",
  },
  {
    date: "March 2025",
    category: "Living",
    title: "5 ways to make a small space feel larger",
    excerpt:
      "Clever styling and the right objects can transform even the most compact rooms. Our team shares their favourite tricks.",
  },
];

export default function BlogPage() {
  return (
    <main className="pt-[50px]">
      <section className="w-full bg-zinc-900 py-24 px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-400 mb-4">
          Journal
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Blog
        </h1>
        <p className="text-zinc-300 max-w-2xl mx-auto text-lg font-light">
          Ideas, inspiration, and stories from the world of thoughtful living.
        </p>
      </section>

      <Shell>
        <div className="py-16 space-y-12 max-w-3xl">
          {posts.map((post) => (
            <article key={post.title} className="border-b border-border pb-12 last:border-0">
              <div className="flex gap-3 items-center text-xs uppercase tracking-widest text-muted-foreground mb-3">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.category}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-semibold mb-3 hover:underline cursor-pointer">
                {post.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </Shell>
    </main>
  );
}
