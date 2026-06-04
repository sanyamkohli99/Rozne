import { env } from "@/env.mjs";
import { uploadImage } from "@/lib/s3";
import db from "@/lib/supabase/db";
import { medias } from "@/lib/supabase/schema";
import { mediaSchema } from "@/validations/medias";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.DATABASE_SERVICE_ROLE,
  { auth: { persistSession: false } },
);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData) as z.infer<typeof mediaSchema>;

  const results: (string | { message: string })[] = [];

  for (const [, file] of Object.entries(data)) {
    const fileExtension = file.type.split("/")[1];
    const key = nanoid() + "." + fileExtension;

    let publicUrl: string | null = null;

    try {
      if (env.S3_ACCESS_KEY_ID && env.NEXT_PUBLIC_S3_BUCKET) {
        await uploadImage({
          Bucket: env.NEXT_PUBLIC_S3_BUCKET,
          Key: "public/" + key,
          Body: Buffer.from(await file.arrayBuffer()),
          ContentType: file.type,
        });
        publicUrl = "public/" + key;
      } else {
        const { data: upload, error } = await supabaseAdmin.storage
          .from("media")
          .upload(key, file, { contentType: file.type, upsert: true });

        if (error) throw new Error(error.message);
        const { data: urlData } = supabaseAdmin.storage
          .from("media")
          .getPublicUrl(upload.path);
        publicUrl = urlData.publicUrl;
      }
    } catch (err: any) {
      results.push({ message: err.message });
      continue;
    }

    if (publicUrl) {
      const [inserted] = await db
        .insert(medias)
        .values({ alt: file.name, key: publicUrl })
        .returning();
      results.push(inserted.id);
    }
  }

  return NextResponse.json(results, { status: 201 });
}
