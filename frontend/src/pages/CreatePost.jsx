import { Image, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { getMediaType, uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export default function CreatePost() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeMedia = () => {
    setMedia(null);
    setPreview("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!caption && !media) return;
    setSubmitting(true);

    try {
      let mediaUrl = null;
      let mediaType = null;

      if (media) {
        setUploadProgress("Uploading...");
        const result = await uploadToCloudinary(media, "social_media_uploads");
        mediaUrl = result.url;
        mediaType = getMediaType(media);
        setUploadProgress("Creating post...");
      }

      await api.post("/post/create", {
        caption,
        mediaUrl,
        mediaType,
      });

      setCaption("");
      setMedia(null);
      setPreview("");
      setUploadProgress("");
      navigate("/");
    } catch (err) {
      console.error("Create post error:", err);
      setUploadProgress("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h2 className="text-2xl font-bold mb-6">Create Post</h2>

        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {/* Caption */}
          <div>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="4"
              className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              placeholder="What's on your mind?"
            />
          </div>

          {/* Media Preview */}
          {preview && (
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              {media?.type.startsWith("image/") ? (
                <img src={preview} alt="Preview" className="w-full max-h-96 object-contain" />
              ) : (
                <video src={preview} controls className="w-full max-h-96" />
              )}
              <button
                type="button"
                onClick={removeMedia}
                className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* Upload Button */}
          {!preview && (
            <label className="flex items-center justify-center gap-2 p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
              <Image size={24} className="text-gray-400" />
              <span className="text-gray-600">Add photo or video</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={onFileChange}
                className="hidden"
              />
            </label>
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
            disabled={submitting || (!caption && !media)}
            className="w-full bg-black text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
