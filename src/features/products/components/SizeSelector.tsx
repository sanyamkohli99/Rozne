"use client";
import { cn } from "@/lib/utils";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

interface SizeSelectorProps {
  sizes: string[];
  selected: string | null;
  onChange: (size: string) => void;
}

export function SizeSelector({ sizes, selected, onChange }: SizeSelectorProps) {
  if (!sizes || sizes.length === 0) return null;

  const ordered = [...sizes].sort(
    (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b),
  );

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">
        Size
        {selected && (
          <span className="ml-2 text-muted-foreground font-normal">
            — {selected}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {ordered.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            className={cn(
              "min-w-[3rem] h-10 px-3 border text-sm font-medium transition-all duration-150",
              "hover:border-zinc-900 hover:bg-zinc-50",
              selected === size
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 bg-white text-zinc-800",
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SizeSelector;
