import { Sparkles, Upload, Video } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { userAuth } from "../context/AuthContext.jsx";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export default function CreateReel() {
  const { user } = userAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [err, setErr] = useState("");

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
      setErr("");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!video) {
      setErr("Please select a video");
      return;
    }
    try {
      setLoading(true);

      // Upload video directly to Cloudinary (bypasses server network)
      setUploadProgress("Uploading video to Cloudinary...");
      const result = await uploadToCloudinary(video, "reels_uploads");
      const videoUrl = result.url;

      setUploadProgress("Creating reel...");

      // Send reel data to backend (only URL, not file)
      await api.post("/reel/create", {
        videoUrl,
        caption,
      });

      setUploadProgress("");
      alert("Reel created successfully!");
      navigate("/reels");
    } catch (e) {
      console.error("Create reel error:", e);
      setErr(e?.response?.data?.message || e.message || "Failed to create reel");
      setUploadProgress("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-3">
            <Video size={28} className="text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Reel
          </h1>
          <p className="text-sm text-gray-500 mt-1">Share your moment with the world</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-gray-200/50 shadow-lg">
          {/* Video Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Video</label>
            {videoPreview ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[9/16] max-h-96 mx-auto">
                <video
                  src={videoPreview}
                  controls
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => {
                    setVideo(null);
                    setVideoPreview("");
                  }}
                  className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gradient-to-br from-gray-50 to-purple-50/30 hover:bg-purple-50/50 transition-colors group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={28} className="text-purple-600" />
                  </div>
                  <p className="mb-2 text-sm font-semibold text-gray-700">
                    Click to upload video
                  </p>
                  <p className="text-xs text-gray-500">MP4, MOV, AVI (MAX. 200MB)</p>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Caption */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              placeholder="Write a caption for your reel..."
            />
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-purple-700">{uploadProgress}</span>
            </div>
          )}

          {/* Error */}
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              {err}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !video}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {uploadProgress || "Uploading..."}
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Create Reel
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}