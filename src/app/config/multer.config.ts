import multer from "multer";

import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";
import config from ".";

const removeExtension = (filename: string) => {
  return filename.split(".").slice(0, -1).join(".").trim();
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    folder: config.cloudinary_folder_name as string,
    public_id: (_req, file) =>
      Math.random().toString(36).substring(2) +
      "-" +
      Date.now() +
      "-" +
      file.fieldname +
      "-" +
      removeExtension(file.originalname),
  },
});

export const multerUpload = multer({
  storage: storage,
});
