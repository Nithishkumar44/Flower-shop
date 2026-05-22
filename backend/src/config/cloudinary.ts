import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const isConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const uploadImage = async (fileBuffer: Buffer | string): Promise<string> => {
  if (!isConfigured) {
    // Return a default mockup URI for easy testing
    console.warn("Cloudinary is not configured. Returning local mock/placeholder image.");
    if (typeof fileBuffer === 'string' && fileBuffer.startsWith('data:image')) {
      return fileBuffer; // Return base64 for simplicity in frontend
    }
    return "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&auto=format&fit=crop&q=80";
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'luxe_blooms' },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result.secure_url);
        } else {
          reject(new Error("Cloudinary upload failed with no results"));
        }
      }
    );

    if (typeof fileBuffer === 'string') {
      // If base64
      cloudinary.uploader.upload(fileBuffer, { folder: 'luxe_blooms' })
        .then((result) => resolve(result.secure_url))
        .catch((err) => reject(err));
    } else {
      uploadStream.end(fileBuffer);
    }
  });
};

export default cloudinary;
