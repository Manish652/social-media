import { useState } from "react";
import api from "../api/axios.js";
import { getMediaType, uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const onFileChange = (e) => {
    setMedia(e.target.files?.[0] || null);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!caption && !media) return alert("Add a caption or select a media file");
    setSubmitting(true);

    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload to Cloudinary directly from browser (bypasses backend network)
      if (media) {
        setUploadProgress("Uploading to Cloudinary...");
        const result = await uploadToCloudinary(media, "social_media_uploads");
        mediaUrl = result.url;
        mediaType = getMediaType(media);
        setUploadProgress("Upload complete! Creating post...");
      }

      // Send post data to backend (only URL, not file)
      const { data } = await api.post("/post/create", {
        caption,
        mediaUrl,
        mediaType,
      });

      console.log("Post created:", data);
      alert("Post created successfully!");

      // reset form
      setCaption("");
      setMedia(null);
      setUploadProgress("");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to create post";
      alert(msg);
      setUploadProgress("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Create Post</h2>
      <form onSubmit={onSubmit} className="space-y-4 bg-white shadow p-5 rounded-xl">
        <div>
          <label className="block text-sm font-medium mb-1">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows="3"
            className="w-full border rounded px-3 py-2"
            placeholder="Write something..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Media (image/video)</label>
          <input type="file" accept="image/*,video/*" onChange={onFileChange} />
          {media && <p className="text-xs text-gray-500 mt-1">Selected: {media.name}</p>}
        </div>
        {uploadProgress && (
          <div className="text-sm text-blue-600 font-medium">
            {uploadProgress}
          </div>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
        >
          {submitting ? uploadProgress || "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}
