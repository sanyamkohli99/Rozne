import AdminShell from "@/components/admin/AdminShell";
import { ImageGridSkeleton, MediasPageContent } from "@/features/medias";
import { Suspense } from "react";

type Props = {};

async function MediasPage({}: Props) {
  return (
    <AdminShell
      heading="Media Library"
      description="Upload and manage images used across your products and promo cards."
    >
      <Suspense fallback={<ImageGridSkeleton />}>
        <MediasPageContent />
      </Suspense>
    </AdminShell>
  );
}

export default MediasPage;
