import { Upload } from "lucide-react";
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

      setUploadProgress("Uploading video to Cloudinary...");
      const result = await uploadToCloudinary(video, "reels_uploads");
      const videoUrl = result.url;

      setUploadProgress("Creating reel...");

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
    <div className="min-h-screen pb-24 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h2 className="text-2xl font-bold mb-6">Create Reel</h2>

        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
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
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <Upload size={32} className="text-gray-400 mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">
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
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
              <img
                src="/src/assets/animations/Spinner-3.gif"
                alt="Loading"
                className="w-8 h-8"
              />
              <span className="text-sm text-purple-700 font-medium">{uploadProgress}</span>
            </div>
          )}

          {/* Error */}
          {err && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
              {err}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !video}
            className="w-full bg-black text-white font-medium py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            {loading ? uploadProgress || "Uploading..." : "Create Reel"}
          </button>
        </form>
      </div>
    </div>
  );
}