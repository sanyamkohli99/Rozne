"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Icons } from "@/components/layouts/icons";
import { useToast } from "@/components/ui/use-toast";

type Props = {
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  className?: string;
};

function ImageUploader({ value, onChange, accept = "image/*", className }: Props) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/medias", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Upload failed");
      }

      const result = await res.json();
      const mediaId = Array.isArray(result) ? result[0] : result;

      // Fetch the uploaded media to get its key
      const mediaRes = await fetch(`/api/medias/${mediaId}`);
      if (!mediaRes.ok) throw new Error("Failed to get media URL");
      const media = await mediaRes.json();
      const key = media?.data?.key || media?.key || "";

      onChange(key);
      toast({ title: "Image uploaded." });
    } catch (err) {
      toast({
        title: "Upload failed.",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="relative group w-full h-[140px] rounded-lg overflow-hidden border bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
            >
              Replace
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onChange("")}
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="w-full h-[140px] rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-zinc-500"
        >
          {isUploading ? (
            <Spinner className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Icons.add className="h-5 w-5" />
              <span className="text-xs font-medium">Browse image</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}

export default ImageUploader;
