"use client";

import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from "@/_actions/promo-codes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import { SelectPromoCodes } from "@/lib/supabase/schema";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createId } from "@paralleldrive/cuid2";
import type { InsertPromoCodes } from "@/lib/supabase/schema";

export default function PromoCodesManager() {
  const [codes, setCodes] = useState<SelectPromoCodes[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<SelectPromoCodes | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed",
    value: "",
    minOrderAmount: "0",
    maxUses: "",
    expiresAt: "",
  });

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setLoading(true);
    const data = await getPromoCodes();
    setCodes(data);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({
      code: "",
      type: "percentage",
      value: "",
      minOrderAmount: "0",
      maxUses: "",
      expiresAt: "",
    });
    setEditingCode(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (code: SelectPromoCodes) => {
    setForm({
      code: code.code,
      type: code.type as "percentage" | "fixed",
      value: String(code.value),
      minOrderAmount: String(code.minOrderAmount),
      maxUses: code.maxUses ? String(code.maxUses) : "",
      expiresAt: code.expiresAt
        ? new Date(code.expiresAt).toISOString().slice(0, 16)
        : "",
    });
    setEditingCode(code);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    startTransition(async () => {
      try {
        const payload = {
          code: form.code.toUpperCase().trim(),
          type: form.type as "percentage" | "fixed",
          value: form.value,
          minOrderAmount: form.minOrderAmount || "0",
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
          usedCount: editingCode?.usedCount ?? 0,
          active: editingCode?.active ?? true,
          expiresAt: form.expiresAt ? new Date(form.expiresAt) : null,
        };

        if (editingCode) {
          const result = await updatePromoCode(editingCode.id, payload as InsertPromoCodes);
          if (result.error) throw new Error(result.error);
        } else {
          const id = createId();
          const result = await createPromoCode({ ...payload, id } as InsertPromoCodes);
          if (result.error) throw new Error(result.error);
        }

        router.refresh();
        await loadCodes();
        setDialogOpen(false);
        resetForm();
        toast({
          title: editingCode ? "Promo code updated." : "Promo code created.",
        });
      } catch (err) {
        toast({
          title: "Error saving promo code.",
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promo code?")) return;
    startTransition(async () => {
      const result = await deletePromoCode(id);
      if (result.error) {
        toast({ title: "Error deleting.", variant: "destructive" });
      } else {
        toast({ title: "Promo code deleted." });
        await loadCodes();
      }
    });
  };

  const toggleActive = async (code: SelectPromoCodes) => {
    startTransition(async () => {
      await updatePromoCode(code.id, { active: !code.active });
      await loadCodes();
    });
  };

  return (
    <div className="space-y-6 px-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500 max-w-2xl">
          Promo codes give customers discounts at checkout. Each code can be
          percentage-based or a fixed amount off.
        </p>
        <Button onClick={openCreate}>New Promo Code</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : codes.length === 0 ? (
        <div className="text-center py-16 text-zinc-400">
          <p className="text-lg mb-2">No promo codes yet</p>
          <p className="text-sm">Create your first promo code to offer discounts.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b">
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Discount</th>
                <th className="text-left px-4 py-3 font-medium">Min. Order</th>
                <th className="text-left px-4 py-3 font-medium">Uses</th>
                <th className="text-left px-4 py-3 font-medium">Expires</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b last:border-b-0 hover:bg-zinc-50/50">
                  <td className="px-4 py-3 font-mono font-medium">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.type === "percentage" ? `${c.value}%` : `₹${c.value}`}
                  </td>
                  <td className="px-4 py-3">₹{c.minOrderAmount}</td>
                  <td className="px-4 py-3">
                    {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString("en-IN")
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        c.active
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {c.active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(c.id)}
                      disabled={isPending}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCode ? "Edit Promo Code" : "New Promo Code"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Code</label>
              <Input
                placeholder="e.g. WELCOME10"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
              <p className="text-xs text-zinc-400">
                Customers enter this at checkout. Will be stored in UPPERCASE.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as "percentage" | "fixed" })
                  }
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  {form.type === "percentage" ? "Percentage" : "Amount"}
                </label>
                <Input
                  placeholder={form.type === "percentage" ? "10" : "500"}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Min. Order (₹)</label>
                <Input
                  placeholder="0"
                  value={form.minOrderAmount}
                  onChange={(e) =>
                    setForm({ ...form, minOrderAmount: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Max Uses</label>
                <Input
                  placeholder="Unlimited"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Expiry Date</label>
              <Input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
              <p className="text-xs text-zinc-400">
                Leave empty for no expiry.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isPending || !form.code || !form.value}>
              {editingCode ? "Save Changes" : "Create Code"}
              {isPending && <Spinner className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
