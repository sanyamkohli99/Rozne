"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const sizeChart = [
  { size: "XS", chest: "32–34", waist: "24–26", hip: "34–36", length: "24" },
  { size: "S",  chest: "34–36", waist: "26–28", hip: "36–38", length: "25" },
  { size: "M",  chest: "36–38", waist: "28–30", hip: "38–40", length: "26" },
  { size: "L",  chest: "38–40", waist: "30–32", hip: "40–42", length: "27" },
  { size: "XL", chest: "40–42", waist: "32–34", hip: "42–44", length: "28" },
  { size: "XXL",chest: "42–44", waist: "34–36", hip: "44–46", length: "29" },
];

const cols = ["Size", "Chest (in)", "Waist (in)", "Hip (in)", "Length (in)"];

export function SizeChartDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="text-sm underline underline-offset-2 text-muted-foreground hover:text-zinc-900 transition-colors"
        >
          Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Size Guide</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mb-4">
          All measurements are in inches. For the best fit, measure over a
          light-weight base layer.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                {cols.map((col) => (
                  <th
                    key={col}
                    className="border border-zinc-200 bg-zinc-50 px-4 py-2 text-left font-medium text-zinc-700"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row, i) => (
                <tr
                  key={row.size}
                  className={cn(i % 2 === 0 ? "bg-white" : "bg-zinc-50/50")}
                >
                  <td className="border border-zinc-200 px-4 py-2 font-semibold">
                    {row.size}
                  </td>
                  <td className="border border-zinc-200 px-4 py-2">{row.chest}</td>
                  <td className="border border-zinc-200 px-4 py-2">{row.waist}</td>
                  <td className="border border-zinc-200 px-4 py-2">{row.hip}</td>
                  <td className="border border-zinc-200 px-4 py-2">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-zinc-50 rounded text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Tip:</strong> Our knitwear is designed with a relaxed fit.
            If you prefer a more fitted look, size down.
          </p>
          <p>
            <strong>Material note:</strong> Natural fibres (wool, cashmere) may
            stretch slightly with wear and relax after a gentle wash.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SizeChartDialog;
