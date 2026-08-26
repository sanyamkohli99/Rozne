"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { validatePromoCode } from "@/_actions/promo-codes";
import { useToast } from "@/components/ui/use-toast";

type PromoCodeInputProps = {
  subtotal: number;
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  appliedCode: string | null;
  discount: number;
};

export default function PromoCodeInput({
  subtotal,
  onApply,
  onRemove,
  appliedCode,
  discount,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    const result = await validatePromoCode(code.trim(), subtotal);
    setLoading(false);

    if (!result.valid) {
      toast({ title: result.message, variant: "destructive" });
      return;
    }

    onApply(code.trim().toUpperCase(), result.discount || 0);
    setCode("");
    toast({ title: `Promo applied! You save ₹${result.discount?.toFixed(0)}` });
  };

  if (appliedCode) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="bg-green-100 text-green-700 font-mono font-medium px-2 py-1 rounded">
          {appliedCode}
        </span>
        <span className="text-green-600 font-medium">-₹{discount.toFixed(0)}</span>
        <button
          onClick={onRemove}
          className="text-zinc-400 hover:text-zinc-600 text-xs underline ml-1"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Promo code"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === "Enter" && handleApply()}
        className="font-mono text-sm"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleApply}
        disabled={loading || !code.trim()}
      >
        {loading ? <Spinner className="h-4 w-4 animate-spin" /> : "Apply"}
      </Button>
    </div>
  );
}
