// CloudinaryUtility.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from your .env file
dotenv.config();

// Configure Cloudinary using environment variables
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME, // Ensure .env uses this name
//   api_key: process.env.API_KEY, // Ensure .env uses this name
//   api_secret: process.env.API_SECRET, // Ensure .env uses this name
// });

export const uploadOnCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "subadmin_profiles", // adjust folder name if needed
    });
    console.log("Cloudinary Upload Result:", result);
    // Return the secure URL of the uploaded image
    return { url: result.secure_url };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    // You can choose to throw an error or return null based on your needs
    return null;
  }
};
