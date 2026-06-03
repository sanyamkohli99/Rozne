"use client";

import { Shell } from "@/components/layouts/Shell";

export default function ContactPage() {
  return (
    <>
      <section className="w-full bg-zinc-900 py-24 px-6 text-center">
        <p className="text-sm uppercase tracking-widest text-zinc-400 mb-4">
          Get In Touch
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Contact
        </h1>
        <p className="text-zinc-300 max-w-2xl mx-auto text-lg font-light">
          Wholesale enquiries, custom orders, and bulk pricing — we&apos;re here to help.
        </p>
      </section>

      <Shell>
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl">
          <div className="space-y-8">
            <div>
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                Email
              </h2>
              <a href="mailto:krsapparels39@gmail.com" className="text-xl hover:underline">
                krsapparels39@gmail.com
              </a>
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                Phone
              </h2>
              <a href="tel:+918847570473" className="text-xl hover:underline">
                +91 884 7570 473
              </a>
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                Address
              </h2>
              <p className="text-xl leading-relaxed">
                B-34/3339, Shakti Vihar
                <br />
                Chander Nagar, Ludhiana (Pb.)
                <br />
                INDIA
              </p>
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
                Business Hours
              </h2>
              <p className="text-muted-foreground">
                Monday – Saturday: 9am – 7pm IST
                <br />
                Sunday: Closed
              </p>
            </div>
            <div className="text-xs text-muted-foreground pt-4 border-t border-border">
              Manufactured by <span className="font-medium">KRS Apparels</span>, Ludhiana (Pb.) INDIA
            </div>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-sm uppercase tracking-widest text-muted-foreground block mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
              />
            </div>
            <div>
              <label className="text-sm uppercase tracking-widest text-muted-foreground block mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
              />
            </div>
            <div>
              <label className="text-sm uppercase tracking-widest text-muted-foreground block mb-2">
                Phone / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground"
              />
            </div>
            <div>
              <label className="text-sm uppercase tracking-widest text-muted-foreground block mb-2">
                Message
              </label>
              <textarea
                placeholder="Tell us about your order or enquiry…"
                rows={5}
                className="w-full border border-border rounded-lg px-4 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-foreground text-background rounded-full py-3 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              Send Enquiry
            </button>
          </form>
        </div>
      </Shell>
    </>
  );
}
