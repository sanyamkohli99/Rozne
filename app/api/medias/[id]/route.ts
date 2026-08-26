import { env } from "@/env.mjs";
import { deleteImage } from "@/lib/s3";
import db from "@/lib/supabase/db";
import { collections, medias, products } from "@/lib/supabase/schema";
import { keytoUrl } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.DATABASE_SERVICE_ROLE,
  { auth: { persistSession: false } },
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const media = await db.query.medias.findFirst({
    where: eq(medias.id, params.id),
  });

  if (!media)
    return NextResponse.json(
      {
        message: "Media not found.",
      },
      { status: 404 },
    );

  return NextResponse.json(
    {
      data: media,
      preview: keytoUrl(media.key),
    },
    { status: 201 },
  );
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const media = await db.query.medias.findFirst({
    where: eq(medias.id, params.id),
  });

  if (!media)
    return NextResponse.json(
      {
        message: "Media not found.",
      },
      { status: 404 },
    );

  const [productUsage] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.featuredImageId, media.id))
    .limit(1);

  const [collectionUsage] = await db
    .select({ id: collections.id })
    .from(collections)
    .where(eq(collections.featuredImageId, media.id))
    .limit(1);

  if (productUsage || collectionUsage) {
    const otherMedia = await db
      .select({ id: medias.id })
      .from(medias)
      .where(sql`${medias.id} != ${media.id}`)
      .limit(1);

    if (!otherMedia.length) {
      return NextResponse.json(
        { message: "Cannot delete: this is the only media item and it's in use." },
        { status: 409 },
      );
    }

    const fallbackId = otherMedia[0].id;

    if (productUsage) {
      await db
        .update(products)
        .set({ featuredImageId: fallbackId })
        .where(eq(products.featuredImageId, media.id));
    }

    if (collectionUsage) {
      await db
        .update(collections)
        .set({ featuredImageId: fallbackId })
        .where(eq(collections.featuredImageId, media.id));
    }
  }

  try {
    const key = media.key;
    if (env.S3_ACCESS_KEY_ID && env.NEXT_PUBLIC_S3_BUCKET && key.startsWith("public/")) {
      await deleteImage(env.NEXT_PUBLIC_S3_BUCKET, key);
    } else if (key.includes("/storage/v1/object/public/")) {
      const parts = key.split("/storage/v1/object/public/");
      if (parts[1]) {
        const bucketAndPath = parts[1];
        const slashIndex = bucketAndPath.indexOf("/");
        if (slashIndex > 0) {
          const bucketName = bucketAndPath.substring(0, slashIndex);
          const storagePath = bucketAndPath.substring(slashIndex + 1);
          await supabaseAdmin.storage.from(bucketName).remove([storagePath]);
        }
      }
    }
  } catch (err: any) {
    return NextResponse.json(
      { message: `Failed to delete file from storage: ${err.message}` },
      { status: 500 },
    );
  }

  await db.delete(medias).where(eq(medias.id, media.id));

  return NextResponse.json(
    {
      message: "Media deleted.",
      data: media,
    },
    { status: 200 },
  );
}
