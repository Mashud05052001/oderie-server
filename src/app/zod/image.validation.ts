import { z } from "zod";

export const IMAGE_MAX_UPLOAD_SIZE = 1024 * 1024 * 3;
export const IMAGE_MAX_IMAGE_COUNT = 4;

const ACCEPTED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "png",
  "jpeg",
  "jpg",
] as const;

const ImageSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  encoding: z.string(),
  mimetype: z.enum(ACCEPTED_FILE_TYPES),
  path: z.string(),
  size: z
    .number()
    .refine(
      (size) => size <= IMAGE_MAX_UPLOAD_SIZE,
      "File size must be less than 3MB"
    ),
  filename: z.string(),
});

export const ImageFilesOfArrayValidationSchema = z.object({
  files: z
    .record(z.string(), z.array(ImageSchema))
    .refine((files) => {
      return Object.keys(files).length > 0;
    }, "Image is required")
    .refine((files) => {
      const imageArray = Object.values(files).flat();
      return imageArray.length <= IMAGE_MAX_IMAGE_COUNT;
    }, `You can upload a maximum of ${IMAGE_MAX_IMAGE_COUNT} images.`),
});

export const ImageFileValidationSchema = z.object({
  file: ImageSchema.refine((file) => file !== undefined, "Image is required"),
});
