import { cn } from "@/lib/utils";

interface RozneLogoProps {
  className?: string;
}

function RozneLogo({ className }: RozneLogoProps) {
  return (
    <span
      className={cn(
        "inline-flex flex-col items-center select-none leading-none",
        className,
      )}
    >
      {/* Top hairline rule — references the label/tag aesthetic from the sweater */}
      <svg
        aria-hidden
        className="w-full"
        height="1"
        viewBox="0 0 100 1"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <line
          x1="0"
          y1="0.5"
          x2="100"
          y2="0.5"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.55"
        />
      </svg>

      {/* Wordmark */}
      <span className="flex items-start py-[0.38em]">
        <span
          className="font-extralight tracking-[0.52em] uppercase whitespace-nowrap"
          style={{ paddingLeft: "0.52em", lineHeight: 1 }}
        >
          ROZNE
        </span>
        {/* Degree mark — subtle warmth signature */}
        <span
          className="font-extralight opacity-70"
          style={{ fontSize: "0.38em", lineHeight: 1, marginTop: "-0.05em" }}
          aria-hidden
        >
          °
        </span>
      </span>

      {/* Bottom hairline rule */}
      <svg
        aria-hidden
        className="w-full"
        height="1"
        viewBox="0 0 100 1"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <line
          x1="0"
          y1="0.5"
          x2="100"
          y2="0.5"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.55"
        />
      </svg>
    </span>
  );
}

export default RozneLogo;
