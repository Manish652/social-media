import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  // optional media for image/video stories
  mediaUrl: {
    type: String,
    required: false,
    default: null
  },
  mediaType: {
    type: String,
    enum: ["image", "video", "text"],
    required: true
  },
  // optional caption for media stories
  caption: {
    type: String,
    trim: true
  },
  // fields for text-only story
  text: {
    type: String,
    trim: true,
    default: ""
  },
  bgColor: {
    type: String,
    trim: true,
    default: "#000000"
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "24h" // Auto delete story after 24 hours
  }
});

const StoryModel = mongoose.model("Story", storySchema);
export default StoryModel;
