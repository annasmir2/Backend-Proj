import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_API_KEY,
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) return console.log("Not find File Path");
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    console.log("File has been Uploaded Successfully", uploadResult.url);
    return uploadResult;
  } catch (error) {
    fs.unlink(filePath);
    return console.log("Failed to Upload on Cloud");
  }
};

export { uploadOnCloudinary };
