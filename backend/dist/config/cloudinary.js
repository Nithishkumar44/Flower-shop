"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const isConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;
if (isConfigured) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
const uploadImage = async (fileBuffer) => {
    if (!isConfigured) {
        // Return a default mockup URI for easy testing
        console.warn("Cloudinary is not configured. Returning local mock/placeholder image.");
        if (typeof fileBuffer === 'string' && fileBuffer.startsWith('data:image')) {
            return fileBuffer; // Return base64 for simplicity in frontend
        }
        return "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&auto=format&fit=crop&q=80";
    }
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder: 'luxe_blooms' }, (error, result) => {
            if (error) {
                reject(error);
            }
            else if (result) {
                resolve(result.secure_url);
            }
            else {
                reject(new Error("Cloudinary upload failed with no results"));
            }
        });
        if (typeof fileBuffer === 'string') {
            // If base64
            cloudinary_1.v2.uploader.upload(fileBuffer, { folder: 'luxe_blooms' })
                .then((result) => resolve(result.secure_url))
                .catch((err) => reject(err));
        }
        else {
            uploadStream.end(fileBuffer);
        }
    });
};
exports.uploadImage = uploadImage;
exports.default = cloudinary_1.v2;
