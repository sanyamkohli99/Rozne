"use client";
import { Spinner } from "@/components/ui/spinner";
import { DocumentType, gql } from "@/gql";
import { cn, keytoUrl, isVideoUrl } from "@/lib/utils";
import { FileWithPreview } from "@/types";
import Image from "next/image";
import { ReactNode, useState } from "react";
import { Icons } from "@/components/layouts/icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ImagesGridProps = {
  AddMediaButtonComponent?: ReactNode;
  UploadingMediaComponent?: ReactNode;
  containerClassName?: string;
  defaultImageId?: string;
  onClickHandler?: (mediaId: string) => void;
  onDeleteHandler?: (mediaId: string) => void;
  uploadingFiles?: FileWithPreview[];
  medias: { node: DocumentType<typeof ImageGridFragment> }[];
};

function ImagesGrid({
  AddMediaButtonComponent,
  containerClassName,
  onClickHandler,
  onDeleteHandler,
  defaultImageId,
  medias,
  UploadingMediaComponent,
  uploadingFiles = [],
}: ImagesGridProps) {
  const [videoPreview, setVideoPreview] = useState<{ url: string; alt: string } | null>(null);

  return (
    <div
      className={cn(
        "grid max-w-[1200px] mx-auto gap-x-3 gap-y-5 grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8",
        containerClassName,
      )}
    >
      {AddMediaButtonComponent}
      {UploadingMediaComponent}

      {uploadingFiles.map((file, index) => (
        <div
          key={`uploadingImage_${index}`}
          className="relative h-[120px] w-[120px] opacity-50"
        >
          <Image
            width={120}
            height={120}
            src={file.preview}
            alt={`uploadingImage_${index}`}
            className="h-[100px] w-[100px] object-cover"
          />
          <div className="absolute w-full h-full top-0 left-0 flex items-center justify-center">
            <Spinner />
          </div>
        </div>
      ))}

      {medias.map(({ node: media }) => {
        const url = keytoUrl(media.key);
        const isVideo = isVideoUrl(media.key);

        return (
          <div
            key={media.id}
            className={cn(
              "object-center group relative h-[120px] w-[120px]",
              defaultImageId === media.id && "ring-offset-2 ring-2",
            )}
          >
            {onDeleteHandler && (
              <button
                type="button"
                className="absolute top-1 right-1 z-20 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this media?")) {
                    onDeleteHandler(media.id);
                  }
                }}
              >
                <Icons.trash size={12} />
              </button>
            )}
            {isVideo && (
              <button
                type="button"
                className="absolute top-1 left-1 z-20 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoPreview({ url, alt: media.alt });
                }}
              >
                <Icons.video size={10} />
              </button>
            )}
            <button
              type="button"
              className="w-full h-full"
              onClick={() => onClickHandler?.(media.id)}
            >
              {isVideo ? (
                <div className="h-[100px] w-[100px] bg-zinc-900 rounded relative overflow-hidden">
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    muted
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                    <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center">
                      <Icons.video className="text-zinc-800" size={12} />
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 text-white px-1 rounded">
                    VIDEO
                  </span>
                </div>
              ) : (
                <Image
                  src={url}
                  alt={media.alt}
                  width={120}
                  height={120}
                  className="group-hover:opacity-30 transition-all duration-300 h-[100px] w-[100px] object-cover"
                />
              )}
            </button>
          </div>
        );
      })}

      <Dialog open={!!videoPreview} onOpenChange={(open) => !open && setVideoPreview(null)}>
        <DialogContent className="max-w-[720px] p-0 bg-black">
          {videoPreview && (
            <div>
              <DialogHeader className="p-4 pb-2">
                <DialogTitle className="text-white text-sm">{videoPreview.alt}</DialogTitle>
              </DialogHeader>
              <video
                src={videoPreview.url}
                className="w-full max-h-[480px] object-contain"
                controls
                autoPlay
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ImagesGrid;

export const ImageGridFragment = gql(/* GraphQL */ `
  fragment ImageGridFragment on medias {
    id
    key
    alt
  }
`);
