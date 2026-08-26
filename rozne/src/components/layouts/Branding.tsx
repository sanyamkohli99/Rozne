import { cn } from "@/lib/utils";
import Link from "next/link";
import RozneLogo from "./RozneLogo";

type Props = { className?: string };

function Branding({ className }: Props) {
  return (
    <Link
      href="/"
      aria-label="ROZNE — home"
      className={cn("inline-flex items-center text-xl", className)}
    >
      <RozneLogo />
    </Link>
  );
}

export default Branding;
