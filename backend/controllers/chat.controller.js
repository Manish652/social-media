import cloudinary from "../configs/cloudinary.js";
import ChatModel from "../models/ChatModel.js";
import MessageModel from "../models/MessageModel.js";

// 📩 Access or create a new chat between two users
export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;
    const currentUserId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Check if chat already exists
    let chat = await ChatModel.findOne({
      participants: { $all: [currentUserId, userId] },
    })
      .populate("participants", "username profilePicture")
      .populate("lastMessage");

    // If not, create a new one
    if (!chat) {
      chat = await ChatModel.create({
        participants: [currentUserId, userId],
      });
      chat = await ChatModel.findById(chat._id).populate(
        "participants",
        "username profilePicture"
      );
    }

    res.status(200).json({
      success: true,
      chat,
    });
  } catch (err) {
    console.error("❌ Chat Access Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create or fetch chat",
    });
  }
};

// 💬 Send message (with optional media)
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text, receiver } = req.body;
    const sender = req.user._id;

    if (!chatId || !receiver) {
      return res.status(400).json({
        success: false,
        message: "Chat ID and receiver are required",
      });
    }
    let mediaUrl = null;

    // Upload media if available
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;

      const uploadResult = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "chat_uploads",
        timeout: 60000,
      });

      mediaUrl = uploadResult.secure_url;
    }

    // Create message
    const message = await MessageModel.create({
      chat: chatId,
      sender,
      receiver,
      text,
      media: mediaUrl,
    });

    // Update last message in chat
    await ChatModel.findByIdAndUpdate(chatId, { lastMessage: message._id });

    const populatedMsg = await message.populate("sender", "username profilePicture");

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMsg,
    });
  } catch (err) {
    console.error("❌ Send Message Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

// Fetch all messages for a chat
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await MessageModel.find({ chat: chatId })
      .populate("sender", "username profilePicture")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error("❌ Get Messages Error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};
