import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import InputField from "../components/common/InputField.jsx";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    profilePicture: null
  });
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture") {
      setFormData({ ...formData, profilePicture: files && files[0] ? files[0] : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      let profilePictureUrl = null;

      // Upload profile picture directly to Cloudinary (bypasses server network)
      if (formData.profilePicture) {
        setUploadProgress("Uploading profile picture...");
        const result = await uploadToCloudinary(formData.profilePicture, "user_profiles");
        profilePictureUrl = result.url;
        setUploadProgress("Upload complete! Creating account...");
      }

      // Send registration data to backend (only URL, not file)
      await api.post("/user/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        bio: formData.bio,
        profilePictureUrl: profilePictureUrl,
      });

      setUploadProgress("");
      alert("Account created successfully!");
      // Redirect to login page after successful registration
      navigate("/login", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Signup failed";
      alert(msg);
      setUploadProgress("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <InputField label="Username" name="username" value={formData.username} onChange={handleChange} />
        <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
        <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />
        <InputField label="Bio" name="bio" value={formData.bio} onChange={handleChange} />
        <InputField label="Profile Picture" name="profilePicture" type="file" accept="image/*" onChange={handleChange} />

        {uploadProgress && (
          <div className="text-sm text-blue-600 font-medium mt-2">
            {uploadProgress}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4"
          disabled={loading}
        >
          {loading ? uploadProgress || "Signing Up..." : "Sign Up"}
        </button>

        <p className="text-center text-sm mt-3">
          Already have an account? <a href="/login" className="text-blue-500">Login</a>
        </p>
      </form>
    </div>
  );
}
