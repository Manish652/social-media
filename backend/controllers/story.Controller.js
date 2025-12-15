import cloudinary from "../configs/cloudinary.js";
import StoryModel from "../models/StoryModel.js";

// ✅ Create Story
export const createStory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { caption = "", mediaType = "image", text = "", bgColor = "#000000" } = req.body;

    // Text-only story
    if (mediaType === "text") {
      if (!text.trim()) {
        return res.status(400).json({ success: false, message: "Text is required for text story" });
      }
      const story = await StoryModel.create({
        user: userId,
        mediaType: "text",
        text: text.trim(),
        bgColor,
        caption: caption || ""
      });
      return res.status(201).json({ success: true, message: "Story created successfully", story });
    }

    // Image/Video story requires a file
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Story media is required" });
    }

    // Upload using base64 (more reliable than stream)
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      resource_type: "auto",
      folder: "social_media_stories",
      timeout: 60000,
    });

    const mediaUrl = uploadResult.secure_url;
    const deducedType = req.file.mimetype.startsWith("image/") ? "image" : "video";

    const story = await StoryModel.create({
      user: userId,
      mediaUrl,
      mediaType: deducedType,
      caption: caption || ""
    });

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to create story"
    });
  }
};

//  Get all stories (recent)
export const getAllStories = async (req, res) => {
  try {
    const stories = await StoryModel.find()
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Stories fetched successfully",
      stories
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stories"
    });
  }
};

// ✅ Get stories of followed users only
export const getFollowingStories = async (req, res) => {
  try {
    const user = req.user;

    // populate following user stories
    const stories = await StoryModel.find({ user: { $in: user.following } })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "Stories from followed users",
      stories
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch following stories"
    });
  }
};
