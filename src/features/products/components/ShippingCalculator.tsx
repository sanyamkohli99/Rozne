"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Quote = { price: number; zone: string; freeShipping: boolean };

function ShippingCalculator({ className }: { className?: string }) {
  const [pincode, setPincode] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onCheck = async () => {
    setError(null);
    setQuote(null);
    if (!/^\d{6}$/.test(pincode)) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/shipping/price?pincode=${pincode}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not calculate shipping.");
      } else {
        setQuote(data as Quote);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <p className="text-sm font-medium mb-2">Check delivery &amp; shipping</p>
      <div className="flex gap-x-2 max-w-xs">
        <Input
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Enter pincode"
          inputMode="numeric"
          className="rounded-full"
        />
        <Button
          type="button"
          variant="outline"
          onClick={onCheck}
          disabled={isLoading}
          className="rounded-full shrink-0"
        >
          {isLoading ? "Checking..." : "Check"}
        </Button>
      </div>
      {error && <p className="text-destructive text-xs mt-2">{error}</p>}
      {quote && (
        <p className="text-sm mt-2 text-muted-foreground">
          {quote.freeShipping ? (
            <span className="text-green-600 font-medium">Free shipping</span>
          ) : (
            <>
              Shipping: <span className="font-medium">₹{quote.price}</span>
            </>
          )}{" "}
          · {quote.zone}
        </p>
      )}
    </div>
  );
}

export default ShippingCalculator;
