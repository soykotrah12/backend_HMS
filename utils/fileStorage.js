import fs from "fs";
import path from "path";
import { uploadOnCloudinary } from "./commonMethod.js";

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const saveBufferToPublic = async (buffer, folder, filename) => {
  const targetDir = path.join(process.cwd(), "public", folder);
  ensureDir(targetDir);

  const filePath = path.join(targetDir, filename);
  await fs.promises.writeFile(filePath, buffer);

  return `/public/${folder}/${filename}`;
};

export const uploadFileWithFallback = async ({
  buffer,
  folder,
  filename,
  resourceType = "raw",
}) => {
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const upload = await uploadOnCloudinary(buffer, {
        folder,
        resource_type: resourceType,
        public_id: filename.split(".")[0],
      });
      return upload.secure_url;
    }
  } catch (error) {
    console.error("Cloudinary upload failed. Falling back to local storage.", error);
  }

  return saveBufferToPublic(buffer, folder, filename);
};
