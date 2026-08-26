"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import ImagePreviewCard from "@/features/medias/components/ImagePreviewCard";
import React, { Suspense } from "react";
import UploadMediaContainer from "./UploadMediaContainer";

type Props = {
  onChange: (data: string) => void;
  defaultValue?: string;
  multiple?: boolean;
  modalOpen?: boolean;
  value?: string;
};

function ImageDialog({
  modalOpen = false,
  onChange,
  value,
  defaultValue,
}: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(modalOpen);

  const onClickHandler = (mediaId: string) => {
    onChange(mediaId);
    setDialogOpen(false);
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="cursor-pointer"
      >
        {value ? (
          <ImagePreviewCard
            key={value}
            mediaId={value}
          />
        ) : (
          "Select / Add Media"
        )}
      </button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[1080px] min-h-full md:min-h-[480px]">
          <DialogHeader>
            <DialogTitle className="mb-5">Media Gallery</DialogTitle>
            <Suspense>
              <UploadMediaContainer
                onClickItemsHandler={onClickHandler}
                defaultImageId={defaultValue}
              />
            </Suspense>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ImageDialog;
