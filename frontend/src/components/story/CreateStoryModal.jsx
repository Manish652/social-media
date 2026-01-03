import { Image, Type, X } from "lucide-react";
import { useState } from "react";
import api from "../../api/axios.js";
import { getMediaType, uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

export default function CreateStoryModal({ isOpen, onClose, onSuccess }) {
  const [storyType, setStoryType] = useState("image");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState("#6366f1");
  const [textAlign, setTextAlign] = useState("center");
  const [fontSize, setFontSize] = useState("xl");
  const [duration, setDuration] = useState(24);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const bgColors = [
    "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6",
    "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#14b8a6",
    "#000000", "#1f2937", "#7c3aed", "#db2777", "#059669"
  ];

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file));
      const type = file.type.startsWith("video/") ? "video" : "image";
      setStoryType(type);
    }
  };

  const resetForm = () => {
    setStoryType("image");
    setMedia(null);
    setPreview("");
    setCaption("");
    setText("");
    setBgColor("#6366f1");
    setTextAlign("center");
    setFontSize("xl");
    setDuration(24);
    setUploadProgress("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (storyType === "text" && !text.trim()) {
      alert("Please enter some text for your story");
      return;
    }
    if ((storyType === "image" || storyType === "video") && !media) {
      alert("Please select a media file");
      return;
    }

    setSubmitting(true);

    try {
      let mediaUrl = null;
      let mediaType = storyType;

      if (media) {
        setUploadProgress("Uploading...");
        const result = await uploadToCloudinary(media, "social_media_stories");
        mediaUrl = result.url;
        mediaType = getMediaType(media);
        setUploadProgress("Creating story...");
      }

      const payload = {
        mediaType: storyType,
        caption: caption || "",
        duration: duration,
      };

      if (storyType === "text") {
        payload.text = text;
        payload.bgColor = bgColor;
      } else {
        payload.mediaUrl = mediaUrl;
      }

      await api.post("/story/create", payload);

      setUploadProgress("");
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Create story error:", err);
      alert(err?.response?.data?.message || "Failed to create story");
      setUploadProgress("");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold">Create Story</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Story Type Selector */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setStoryType("image");
                setMedia(null);
                setPreview("");
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${storyType === "image" || storyType === "video"
                  ? "bg-black text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
            >
              <Image size={20} className="inline mr-2" />
              Photo/Video
            </button>
            <button
              type="button"
              onClick={() => {
                setStoryType("text");
                setMedia(null);
                setPreview("");
              }}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${storyType === "text"
                  ? "bg-black text-white"
                  : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
            >
              <Type size={20} className="inline mr-2" />
              Text
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Duration Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Story Duration
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 6, 12, 24].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setDuration(hours)}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${duration === hours
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {hours}h
                  </button>
                ))}
              </div>
            </div>

            {/* Text Story */}
            {storyType === "text" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Story Text
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    placeholder="What's on your mind?"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">{text.length}/200</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Background Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {bgColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBgColor(color)}
                        className={`w-full aspect-square rounded-lg transition-all ${bgColor === color ? "ring-4 ring-offset-2 ring-black scale-105" : "hover:scale-105"
                          }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Preview
                  </label>
                  <div
                    className="w-full aspect-[9/16] max-h-64 rounded-xl flex items-center justify-center p-6 shadow-lg"
                    style={{ backgroundColor: bgColor }}
                  >
                    <p
                      className={`text-white font-bold leading-relaxed whitespace-pre-wrap text-${fontSize}`}
                      style={{ textAlign: textAlign }}
                    >
                      {text || "Your text will appear here"}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* Media Story */}
            {(storyType === "image" || storyType === "video") && (
              <>
                {preview ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-64 mx-auto">
                    {media?.type.startsWith("image/") ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    ) : (
                      <video src={preview} controls className="w-full h-full object-contain" />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMedia(null);
                        setPreview("");
                      }}
                      className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <Image size={32} className="text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Click to upload
                      </p>
                      <p className="text-xs text-gray-500">Image or Video</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={onFileChange}
                      className="hidden"
                    />
                  </label>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Add a caption..."
                    maxLength={100}
                  />
                </div>
              </>
            )}

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="w-6 h-6 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <span className="text-sm text-purple-700 font-medium">{uploadProgress}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-gray-700 font-medium py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || (storyType === "text" ? !text.trim() : !media)}
                className="flex-1 bg-black text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
              >
                {submitting ? "Creating..." : "Share Story"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
