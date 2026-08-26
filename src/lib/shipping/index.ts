import rates from "./rates.json";

export type ShippingQuote = {
  price: number;
  zone: string;
  freeShipping: boolean;
};

/**
 * Calculates shipping price for a given weight (kg) and Indian pincode.
 * Rates are configurable in src/lib/shipping/rates.json.
 */
export function calculateShipping(
  weightKg: number,
  pincode: string,
  cartValue = 0,
): ShippingQuote | { error: string } {
  const weight = Number.isFinite(weightKg) && weightKg > 0 ? weightKg : rates.defaultWeightKg;

  if (!/^\d{6}$/.test(pincode)) {
    return { error: "Enter a valid 6-digit pincode." };
  }

  if (cartValue >= rates.freeShippingThreshold && rates.freeShippingThreshold > 0) {
    return {
      price: 0,
      zone: "Free shipping",
      freeShipping: true,
    };
  }

  const matched =
    rates.zones.find((zone) =>
      zone.pincodePrefixes.some((prefix) => pincode.startsWith(prefix)),
    ) ?? rates.zones[rates.zones.length - 1];

  const extraKg = Math.max(0, Math.ceil(weight - rates.defaultWeightKg));
  const price = matched.basePrice + extraKg * matched.pricePerExtraKg;

  return {
    price,
    zone: matched.name,
    freeShipping: false,
  };
}

export default calculateShipping;
