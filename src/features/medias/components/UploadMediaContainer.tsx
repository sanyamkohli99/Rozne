"use client";
import { Icons } from "@/components/layouts/icons";
import { Button } from "@/components/ui/button";
import { gql } from "@/gql";
import { FileWithPreview } from "@/types";
import { useQuery } from "@urql/next";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import ImagesGrid from "./ImageGrid";
import ImageGridSkeleton from "./ImageGridSkeleton";
import CropModal from "@/components/ui/CropModal";

interface UploadMediaContainerProps {
  onClickItemsHandler: (mediaId: string) => void;
  defaultImageId?: string;
}
function UploadMediaContainer({
  onClickItemsHandler,
  defaultImageId,
}: UploadMediaContainerProps) {
  const router = useRouter();
  const [uploadingImages, setUploadingImages] = useState<FileWithPreview[]>([]);
  const [lastCursor, setLastCursor] = React.useState<string | undefined>(
    undefined,
  );

  const [cropOpen, setCropOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [{ data, fetching, error }, refetch] = useQuery({
    query: MediasPageContentQuery,
    variables: {
      first: 16,
      after: lastCursor,
    },
  });

  const medias = data?.mediasCollection;

  const openMediaDetails = (mediaId: string) => {
    router.push(`/admin/medias/${mediaId}`);
  };

  const uploadFiles = async (files: File[]) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(`files[${i}]`, files[i]);
    }

    try {
      const response = await fetch("/api/medias", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as string[];

      if (data) {
        refetch({ requestPolicy: "network-only" });
      }
    } catch (error) {
      // console.error("Error uploading files:", error)
    }
  };

  const onDrop = async (acceptedFiles: FileWithPath[]) => {
    for (const file of acceptedFiles) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => {
          setCropImageSrc(reader.result as string);
          setPendingFile(file);
          setCropOpen(true);
        };
        reader.readAsDataURL(file);
      } else {
        await uploadFiles([file]);
      }
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    if (!pendingFile) return;
    const croppedFile = new File([blob], pendingFile.name, { type: "image/jpeg" });
    await uploadFiles([croppedFile]);
    setPendingFile(null);
  };

  useEffect(() => {
    return () =>
      uploadingImages.forEach((file) => URL.revokeObjectURL(file.preview));
  }, []);

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: true,
    noKeyboard: true,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm", ".mov", ".avi"],
    },
  });

  const onDeleteMedia = async (mediaId: string) => {
    try {
      const res = await fetch(`/api/medias/${mediaId}`, { method: "DELETE" });
      if (res.ok) {
        refetch({ requestPolicy: "network-only" });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete.");
      }
    } catch {
      alert("Failed to delete media.");
    }
  };

  return (
    <div>
      {error && <p>Oh no... {error.message}</p>}

      {fetching && <ImageGridSkeleton />}

      {medias && (
        <>
          <div className="border border-dot border-zinc-300 p-5">
            <div {...getRootProps()} className="dropzone-container">
              <ImagesGrid
                medias={medias.edges}
                AddMediaButtonComponent={
                  <AddMediaButtonComponent open={open} />
                }
                uploadingFiles={uploadingImages}
                onClickHandler={onClickItemsHandler}
                onDeleteHandler={onDeleteMedia}
                defaultImageId={defaultImageId}
              />

              {medias.pageInfo.hasNextPage ? (
                <div className="flex justify-center content-center">
                  <Button
                    onClick={() => {
                      setLastCursor(medias.pageInfo.endCursor ?? undefined);
                    }}
                  >
                    Load more.
                  </Button>
                </div>
              ) : null}

              <input {...getInputProps()} />
              {isDragActive ? (
                <div className="w-full h-full min-h-[320px] flex items-center justify-center z-50">
                  Drop files here to upload images or videos.
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}

      {cropImageSrc && (
        <CropModal
          open={cropOpen}
          onClose={() => {
            setCropOpen(false);
            setCropImageSrc(null);
            setPendingFile(null);
          }}
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
}

const AddMediaButtonComponent = ({ open }: { open: () => void }) => {
  return (
    <button
      onClick={open}
      className=" h-[120px] w-[120px] border-2 border-dashed border-zinc-400 text-zinc-400 flex flex-col justify-center items-center"
    >
      <Icons.add size={32} />
    </button>
  );
};

export default UploadMediaContainer;

export const MediasPageContentQuery = gql(/* GraphQL */ `
  query MediasPageContentQuery($first: Int, $after: Cursor) {
    mediasCollection(
      first: $first
      after: $after
      orderBy: [{ created_at: DescNullsLast }]
    ) {
      __typename
      edges {
        node {
          id
          key
          alt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
      }
    }
  }
`);
