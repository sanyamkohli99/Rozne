"use client";

import { upsertPromoCard } from "@/_actions/promo-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { SelectPromoCards } from "@/lib/supabase/schema";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useTransition } from "react";
import ImageUploader from "@/components/ui/ImageUploader";
import { keytoUrl } from "@/lib/utils";

type Props = {
  cards: SelectPromoCards[];
};

const CARD_LABELS = [
  "First promo card (top)",
  "Second promo card",
  "Third promo card",
  "Fourth promo card (bottom)",
];

export default function PromoCardsForm({ cards }: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Record<number, SelectPromoCards>>(() => {
    const map: Record<number, SelectPromoCards> = {};
    cards.forEach((c) => {
      map[c.position] = c;
    });
    return map;
  });

  const update = (
    position: number,
    field: keyof SelectPromoCards,
    value: string | null,
  ) => {
    setFormData((prev) => {
      const existing = prev[position] || {
        id: `cpromo00${position}`,
        position,
        imageUrl: "",
        title: "",
        description: "",
        catchphrase: "",
        catchphraseDesc: "",
        createdAt: new Date() as Date,
      };
      return {
        ...prev,
        [position]: { ...existing, [field]: value },
      };
    });
  };

  const handleSave = async () => {
    startTransition(async () => {
      try {
        for (let i = 1; i <= 4; i++) {
          const card = formData[i];
          if (!card) continue;
          const result = await upsertPromoCard(card.id, {
            position: card.position,
            imageUrl: card.imageUrl,
            title: card.title,
            description: card.description,
            catchphrase: card.catchphrase || null,
            catchphraseDesc: card.catchphraseDesc || null,
          });
          if (result.error) throw new Error(result.error);
        }
        toast({ title: "Promo cards updated successfully." });
        setTimeout(() => router.refresh(), 200);
      } catch (err) {
        toast({
          title: "Error saving promo cards.",
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-6 px-3">
      <p className="text-sm text-zinc-500 max-w-2xl">
        These 4 cards appear on the homepage between the featured products and the
        &quot;Slow Fashion&quot; section. Each card shows an image, title, description, and
        an optional catchphrase below it.
      </p>

      <div className="space-y-8">
        {[1, 2, 3, 4].map((pos) => {
          const card = formData[pos] || {
            id: `cpromo00${pos}`,
            position: pos,
            imageUrl: "",
            title: "",
            description: "",
            catchphrase: "",
            catchphraseDesc: "",
            createdAt: new Date() as Date,
          };
          return (
            <div
              key={pos}
              className="border rounded-lg overflow-hidden"
            >
              {/* Header */}
              <div className="bg-zinc-50 px-4 md:px-6 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="bg-zinc-900 text-white text-xs font-medium px-2.5 py-0.5 rounded">
                    {pos}
                  </span>
                  <span className="text-xs md:text-sm font-medium text-zinc-700">
                    {CARD_LABELS[pos - 1]}
                  </span>
                </div>
                {pos < 4 && (
                  <span className="text-[10px] md:text-xs text-zinc-400 hidden sm:inline">
                    ↓ Catchphrase below
                  </span>
                )}
              </div>

              <div className="p-4 md:p-6">
                {/* Image upload + title */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-6">
                  <div className="shrink-0 w-full md:w-[200px]">
                    <ImageUploader
                      value={card.imageUrl ? keytoUrl(card.imageUrl) : ""}
                      onChange={(url) => update(pos, "imageUrl", url)}
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Product title</label>
                      <Input
                        placeholder="e.g. Berry Knit Cardigan"
                        value={card.title}
                        onChange={(e) => update(pos, "title", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Image URL (advanced)</label>
                      <Input
                        placeholder="/assets/products/img1.jpg"
                        value={card.imageUrl}
                        onChange={(e) => update(pos, "imageUrl", e.target.value)}
                      />
                      <p className="text-xs text-zinc-400">
                        Or paste the image path directly
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5 mb-6">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full min-h-[80px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Write a short product description..."
                    value={card.description}
                    onChange={(e) => update(pos, "description", e.target.value)}
                  />
                </div>

                {/* Catchphrase section */}
                <div className="bg-zinc-50 rounded-md p-3 md:p-4 space-y-3 md:space-y-4">
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                    Catchphrase (optional — shown below this card on the homepage)
                  </p>
                  <div className="space-y-1.5">
                    <Input
                      placeholder='e.g. "Warmth you can actually feel."'
                      value={card.catchphrase || ""}
                      onChange={(e) =>
                        update(pos, "catchphrase", e.target.value || null)
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <textarea
                      className="w-full min-h-[50px] px-3 py-2 text-sm border border-input rounded-md bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Optional subtext for the catchphrase..."
                      value={card.catchphraseDesc || ""}
                      onChange={(e) =>
                        update(pos, "catchphraseDesc", e.target.value || null)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="py-6 flex flex-col sm:flex-row gap-4 sm:gap-x-5 items-start sm:items-center border-t">
        <Button disabled={isPending} onClick={handleSave} size="lg">
          Save All Cards
          {isPending && (
            <Spinner className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" />
          )}
        </Button>
        <p className="text-sm text-zinc-400">
          Changes appear on the homepage immediately after saving.
        </p>
      </div>
    </div>
  );
}
