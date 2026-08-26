import React from "react";
import ShippingCalculator from "./ShippingCalculator";

type Props = {};

function ShipReturns({}: Props) {
  return (
    <div className="space-y-4 text-sm text-muted-foreground">
      <ShippingCalculator />
      <div>
        <p className="font-medium text-foreground">Free shipping</p>
        <p>
          On all prepaid orders above ₹2,999. Ships from Ludhiana, Punjab within
          2–4 business days.
        </p>
      </div>
      <div>
        <p className="font-medium text-foreground">Returns &amp; exchanges</p>
        <p>
          Easy returns within 7 days of delivery. Items must be unworn with
          tags intact. Contact us to arrange a pickup or exchange.
        </p>
      </div>
    </div>
  );
}

export default ShipReturns;
