import api from "../api/axios.js";

/**
 * Upload file directly to Cloudinary from browser
 * Bypasses backend server network issues
 */
export async function uploadToCloudinary(file, folder = "social_media_uploads") {
  try {
    console.log("[Client Upload] Starting direct upload to Cloudinary...");

    // Get upload configuration from backend
    const { data: config } = await api.get("/upload/config");

    if (!config.success) {
      throw new Error("Failed to get upload config");
    }

    const { cloudName, uploadPreset } = config;

    if (!uploadPreset) {
      throw new Error("Upload preset not configured. Create an unsigned upload preset in Cloudinary dashboard.");
    }

    console.log("[Client Upload] Using preset:", uploadPreset);
    console.log("[Client Upload] Cloud name:", cloudName);
    console.log("[Client Upload] Folder:", folder);

    // Create form data for Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);

    // Upload directly to Cloudinary (bypasses your backend)
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;

    console.log("[Client Upload] Uploading to:", cloudinaryUrl);
    console.log("[Client Upload] File:", file.name, file.type, file.size);

    const response = await fetch(cloudinaryUrl, {
      method: "POST",
      body: formData,
    });

    console.log("[Client Upload] Response status:", response.status);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Upload failed");
    }

    const result = await response.json();
    console.log("[Client Upload] Success:", result.secure_url);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
    };

  } catch (error) {
    console.error("[Client Upload] Failed:", error);
    throw error;
  }
}

/**
 * Determine if file is image or video
 */
export function getMediaType(file) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return "auto";
}
