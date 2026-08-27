"use client";

import React, { useState, useTransition } from "react";
import { updateHeroImage } from "@/_actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/use-toast";
import ImageUploader from "@/components/ui/ImageUploader";
import { keytoUrl } from "@/lib/utils";

type Props = {
  initialImageUrl: string;
};

function HeroSettingsForm({ initialImageUrl }: Props) {
  const { toast } = useToast();
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      const result = await updateHeroImage(imageUrl);
      if (!result.ok) {
        toast({ title: result.error ?? "Could not save.", variant: "destructive" });
        return;
      }
      toast({ title: "Hero image updated." });
    });
  };

  return (
    <div className="max-w-xl space-y-6">
      <div className="space-y-3">
        <ImageUploader
          value={imageUrl ? keytoUrl(imageUrl) : ""}
          onChange={(url) => setImageUrl(url)}
        />
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Image URL (advanced)</label>
          <Input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="/assets/hero.jpg"
          />
        </div>
      </div>

      <Button onClick={onSave} disabled={isPending}>
        Save Hero Image
        {isPending && <Spinner className="ml-2 h-4 w-4 animate-spin" aria-hidden="true" />}
      </Button>
    </div>
  );
}

export default HeroSettingsForm;
