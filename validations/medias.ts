import { FileWithPath } from "react-dropzone";
import { z } from "zod";

// Helper function to validate each file in the array
export const mediaSchema = z.record(
  z.string(),
  z
    .custom<FileWithPath>()
    .refine((file) => !file || (!!file && file.size <= 500 * 1024 * 1024), {
      message: "File must be a maximum of 500MB.",
    })
    .refine(
      (file) =>
        !file ||
        (!!file &&
          (file.type?.startsWith("image") || file.type?.startsWith("video"))),
      {
        message: "Only images and videos are allowed.",
      },
    ),
);
