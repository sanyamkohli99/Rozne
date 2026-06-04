"use client";
import { ImageDialog } from "@/features/medias";
import { X } from "lucide-react";

interface ProductGalleryFieldProps {
  value: (string | null)[];
  onChange: (ids: (string | null)[]) => void;
  maxImages?: number;
}

export function ProductGalleryField({
  value,
  onChange,
  maxImages = 4,
}: ProductGalleryFieldProps) {
  const slots = Array.from({ length: maxImages }, (_, i) => value[i] ?? null);

  const handleChange = (index: number, mediaId: string) => {
    const next = [...slots];
    next[index] = mediaId;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    const next = [...slots];
    next[index] = null;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Gallery Images (up to {maxImages})</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {slots.map((mediaId, index) => (
          <div key={index} className="relative group">
            {mediaId ? (
              <>
                <ImageDialog
                  value={mediaId}
                  defaultValue={mediaId}
                  onChange={(id) => handleChange(index, id)}
                />
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute -top-2 -right-2 z-10 bg-zinc-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
              </>
            ) : (
              <div className="border-2 border-dashed border-zinc-200 rounded aspect-square flex items-center justify-center text-zinc-400 hover:border-zinc-400 transition-colors cursor-pointer text-xs text-center p-2">
                <ImageDialog
                  value={undefined}
                  defaultValue={undefined}
                  onChange={(id) => handleChange(index, id)}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        These images appear in the product image gallery on the product page.
      </p>
    </div>
  );
}

export default ProductGalleryField;
