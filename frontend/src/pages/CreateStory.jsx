import { Image, Type, Video, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { getMediaType, uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export default function CreateStory() {
  const navigate = useNavigate();
  const [storyType, setStoryType] = useState("image"); // "image", "video", "text"
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [text, setText] = useState("");
  const [bgColor, setBgColor] = useState("#6366f1");
  const [duration, setDuration] = useState(24); // Story duration in hours
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const bgColors = [
    "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6",
    "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#14b8a6",
    "#000000", "#1f2937", "#7c3aed", "#db2777", "#059669"
  ];

  const textAlignments = ["left", "center", "right"];
  const [textAlign, setTextAlign] = useState("center");
  const [fontSize, setFontSize] = useState("xl"); // sm, base, lg, xl, 2xl

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file));
      const type = file.type.startsWith("video/") ? "video" : "image";
      setStoryType(type);
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setPreview("");
    // Don't reset storyType here - let the button handle it
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Validation
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
      alert("Story created successfully!");
      navigate("/");
    } catch (err) {
      console.error("Create story error:", err);
      alert(err?.response?.data?.message || "Failed to create story");
      setUploadProgress("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h2 className="text-2xl font-bold mb-6">Create Story</h2>

        {/* Story Type Selector */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              console.log("Photo/Video button clicked");
              setStoryType("image");
              removeMedia();
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
              console.log("Text button clicked, current storyType:", storyType);
              setStoryType((prev) => {
                console.log("Setting storyType from", prev, "to text");
                return "text";
              });
              setMedia(null);
              setPreview("");
              setText("");
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

        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <strong>Current Mode:</strong> {storyType}
          </div>

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
            <p className="text-xs text-gray-500 mt-2">
              Your story will be visible for {duration} hour{duration !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Text Story */}
          {storyType === "text" && (
            <>
              {console.log("Rendering text story form, storyType:", storyType)}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Story Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows="6"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  placeholder="What's on your mind?"
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{text.length}/200</p>
              </div>

              {/* Background Color Picker */}
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

              {/* Text Alignment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Text Alignment
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTextAlign("left")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${textAlign === "left"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign("center")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${textAlign === "center"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => setTextAlign("right")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${textAlign === "right"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    Right
                  </button>
                </div>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Text Size
                </label>
                <div className="flex gap-2">
                  {[
                    { value: "sm", label: "Small" },
                    { value: "base", label: "Medium" },
                    { value: "lg", label: "Large" },
                    { value: "xl", label: "X-Large" },
                    { value: "2xl", label: "XX-Large" }
                  ].map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setFontSize(size.value)}
                      className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium transition-all ${fontSize === size.value
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Preview
                </label>
                <div
                  className="w-full aspect-[9/16] max-h-96 rounded-xl flex items-center justify-center p-8 shadow-lg"
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
                <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-96 mx-auto">
                  {media?.type.startsWith("image/") ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  ) : (
                    <video src={preview} controls className="w-full h-full object-contain" />
                  )}
                  <button
                    type="button"
                    onClick={removeMedia}
                    className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    {storyType === "video" ? (
                      <Video size={32} className="text-gray-400 mb-3" />
                    ) : (
                      <Image size={32} className="text-gray-400 mb-3" />
                    )}
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload {storyType}
                    </p>
                    <p className="text-xs text-gray-500">
                      {storyType === "video" ? "MP4, MOV (MAX. 100MB)" : "JPG, PNG (MAX. 10MB)"}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept={storyType === "video" ? "video/*" : "image/*"}
                    onChange={onFileChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Caption */}
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
              <img
                src="/src/assets/animations/Spinner-3.gif"
                alt="Loading"
                className="w-8 h-8"
              />
              <span className="text-sm text-purple-700 font-medium">{uploadProgress}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || (storyType === "text" ? !text.trim() : !media)}
            className="w-full bg-black text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {submitting ? uploadProgress || "Creating..." : "Share Story"}
          </button>
        </form>
      </div>
    </div>
  );
}
