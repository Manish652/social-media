import cloudinary from "../configs/cloudinary.js";
import ReelModel from "../models/ReelModel.js";

//  Create a new reel
export const createReel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { caption, videoUrl } = req.body;

    // Client-side upload: videoUrl comes from frontend (bypasses server network)
    // Server-side upload: use req.file (fallback for backward compatibility)
    let finalVideoUrl = videoUrl;

    if (!finalVideoUrl && req.file) {
      // Fallback: Server-side upload if client upload fails
      console.log("[Server Upload] Client upload not used, falling back to server upload");
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        resource_type: "video",
        folder: "reels_uploads",
        timeout: 600000,
      });

      finalVideoUrl = uploadResult.secure_url;
      console.log("[Server Upload] Success:", finalVideoUrl);
    } else if (finalVideoUrl) {
      console.log("[Client Upload] Using client-uploaded URL:", finalVideoUrl);
    }

    if (!finalVideoUrl) {
      return res.status(400).json({ success: false, message: "Video is required" });
    }

    // Generate thumbnail URL from video URL
    const thumbnailUrl = finalVideoUrl.replace(/\.(mp4|mov|avi)$/i, ".jpg");

    const reel = await ReelModel.create({
      userId,
      caption,
      videoUrl: finalVideoUrl,
      thumbnailUrl,
    });

    res.status(201).json({
      success: true,
      message: "Reel uploaded successfully",
      reel,
    });
  } catch (err) {
    console.error("Create reel error:", err);
    res.status(500).json({ success: false, message: "Failed to upload reel" });
  }
};

//  Get all reels
export const getAllReels = async (req, res) => {
  try {
    const reels = await ReelModel.find()
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reels,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch reels" });
  }
};

//  Like or Unlike a reel
export const likeReel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reelId } = req.params;

    const reel = await ReelModel.findById(reelId);
    if (!reel) {
      return res.status(404).json({ success: false, message: "Reel not found" });
    }

    const isLiked = reel.likes.includes(userId);

    if (isLiked) {
      reel.likes = reel.likes.filter((id) => id.toString() !== userId.toString());
      await reel.save();
      return res.json({ success: true, message: "Reel unliked" });
    } else {
      reel.likes.push(userId);
      await reel.save();
      return res.json({ success: true, message: "Reel liked" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to like reel" });
  }
};

//  Delete a reel
export const deleteReel = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reelId } = req.params;

    const reel = await ReelModel.findById(reelId);

    if (!reel) {
      return res.status(404).json({ success: false, message: "Reel not found" });
    }

    if (reel.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await reel.deleteOne();
    res.json({ success: true, message: "Reel deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete reel" });
  }
};
