import { Bookmark, Grid, Menu, Pencil, PlusCircle, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import FollowListModal from "../components/common/FollowListModal.jsx";
import Layout from "../components/layout/Layout.jsx";
import PostCard from "../components/post/PostCard.jsx";
import { userAuth } from "../context/AuthContext";


export default function Profile() {
  const { user, login, logout } = userAuth();
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    bio: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [posts, setPosts] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [preview, setPreview] = useState("");

  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers");



  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/user/profile");
        setProfile(data);
        // Always sync context user with fresh server data to keep followers/following accurate
        login(data, localStorage.getItem("token"));
      } catch (err) {
        console.log("Profile fetch failed:", err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        const { data } = await api.get("/post");
        setPosts(data?.posts || []);
      } catch (err) {
        console.log("Posts fetch failed:", err.message);
      }
    };

    fetchProfile();
    fetchPosts();
  }, []);

  // Keep profile followers/following in sync with context when viewing own profile
  useEffect(() => {
    if (!user?._id) return;
    setProfile((prev) => {
      if (!prev?._id) return prev;
      if (String(prev._id) !== String(user._id)) return prev;
      const next = {
        ...prev,
        followers: Array.isArray(user.followers) ? user.followers : prev.followers,
        following: Array.isArray(user.following) ? user.following : prev.following,
      };
      return next;
    });
  }, [user?._id, Array.isArray(user?.followers) ? user.followers.length : 0, Array.isArray(user?.following) ? user.following.length : 0]);

  // Also refetch fresh profile from server when your following length changes
  useEffect(() => {
    if (!user?._id) return;
    const fetchFresh = async () => {
      try {
        const { data } = await api.get("/user/profile");
        setProfile(data);
        login(data, localStorage.getItem("token"));
      } catch { }
    };
    fetchFresh();
  }, [Array.isArray(user?.following) ? user.following.length : 0]);

  const refreshPosts = async () => {
    try {
      const { data } = await api.get("/post");
      setPosts(data?.posts || []);
    } catch { }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm("Delete this post?")) return;
    try {
      setDeleting(true);
      await api.delete(`/post/delete/${postId}`);
      await refreshPosts();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdatePost = async (post) => {
    const current = post?.caption || "";
    const caption = prompt("Edit caption", current);
    if (caption == null) return;
    try {
      setUpdating(true);
      await api.put(`/post/update/${post._id}`, { caption });
      await refreshPosts();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update post");
    } finally {
      setUpdating(false);
    }
  };

  const handleChange = (e) =>
    setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      let profilePictureUrl = null;

      // Upload profile picture directly to Cloudinary (bypasses server network)
      if (profileImageFile) {
        const { uploadToCloudinary } = await import("../utils/cloudinaryUpload.js");
        const result = await uploadToCloudinary(profileImageFile, "user_profiles");
        profilePictureUrl = result.url;
      }

      // Send profile data to backend (only URL, not file)
      const { data } = await api.put("/user/editProfile", {
        username: profile.username || "",
        bio: profile.bio || "",
        profilePictureUrl: profilePictureUrl,
      });

      // Update local state with new data
      const updatedProfile = {
        ...profile,
        ...data,
        profilePicture: data.profilePicture || profilePictureUrl || profile.profilePicture
      };

      setProfile(updatedProfile);
      login(updatedProfile, localStorage.getItem("token"));
      alert("Profile updated!");
      setProfileImageFile(null);
      setPreview("");

      // Force page reload to show new image
      window.location.reload();
    } catch (err) {
      console.error("Profile update error:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto p-6"><Layout /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 pb-24">
      {/* Follow List Modal */}
      <FollowListModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={user?._id}
        type={followModalType}
        currentUserId={user?._id}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-gray-200/60 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {profile.username || "Username"}
          </h2>
          <div className="flex items-center gap-2">
            <Link
              to="/create-story"
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow hover:shadow-md transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle size={18} />
              <span className="text-xs font-semibold">Story</span>
            </Link>
            <button className="p-2.5 hover:bg-gray-100 rounded-full transition-all hover:scale-105 active:scale-95">
              <Settings size={22} className="text-gray-700" />
            </button>
            <button className="p-2.5 hover:bg-gray-100 rounded-full transition-all hover:scale-105 active:scale-95">
              <Menu size={22} className="text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Profile info */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start gap-5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-75 group-hover:opacity-100 blur transition-opacity"></div>
              <img
                src={preview || profile.profilePicture || "https://via.placeholder.com/96"}
                alt="avatar"
                className="relative w-24 h-24 rounded-full border-4 border-white object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profile.username}</h2>
              <p className="text-gray-500 text-sm mt-1">{profile.email}</p>
              {profile.bio && (
                <div className="mt-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                  <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}
              <div className="flex items-center gap-4 mt-5">
                {(() => {
                  const isMe = user?._id && (!profile?._id || String(user._id) === String(profile._id));
                  const followersArr = isMe && Array.isArray(user?.followers) ? user.followers : (Array.isArray(profile.followers) ? profile.followers : []);
                  const followingArr = isMe && Array.isArray(user?.following) ? user.following : (Array.isArray(profile.following) ? profile.following : []);
                  return (
                    <>
                      <button
                        onClick={() => {
                          setFollowModalType("followers");
                          setShowFollowModal(true);
                        }}
                        className="text-center hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <div className="text-xl font-bold text-gray-900">{followersArr.length}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Followers</div>
                      </button>
                      <button
                        onClick={() => {
                          setFollowModalType("following");
                          setShowFollowModal(true);
                        }}
                        className="text-center hover:bg-purple-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <div className="text-xl font-bold text-gray-900">{followingArr.length}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">Following</div>
                      </button>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

    

        <form onSubmit={handleSave} className="mt-4 space-y-4 bg-white shadow-lg rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Profile</h3>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Profile picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setProfileImageFile(f);
                  try { setPreview(URL.createObjectURL(f)); } catch { }
                }
              }}
              className="w-full text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input
              name="username"
              value={profile.username}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="3"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 min-w-[120px] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 transition-all hover:scale-[1.02] active:scale-95"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <Link
              to="/create-post"
              className="flex-1 min-w-[120px] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-95 text-center"
            >
              Create Post
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex-1 min-w-[120px] bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95"
            >
              Logout
            </button>
          </div>
        </form>

        {/* Tabs */}
        <div className="mt-4 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="flex">
            <button className="flex-1 py-4 flex items-center justify-center gap-2 border-b-4 border-purple-500 text-purple-600 font-semibold transition-all">
              <Grid size={22} />
              <span className="hidden sm:inline">Posts</span>
            </button>
            <button className="flex-1 py-4 flex items-center justify-center gap-2 border-b-4 border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
              <Bookmark size={22} />
              <span className="hidden sm:inline">Saved</span>
            </button>
          </div>
        </div>

        {/* User posts */}
        <div className="mt-6 space-y-4">
          {posts
            .filter((p) => {
              const uid = p?.userId?._id || p?.userId || p?.userID?._id || p?.userID;
              const me = profile?._id || user?._id;
              return uid && me && String(uid) === String(me);
            })
            .map((post) => {
              const isOwner = String((post?.userId?._id || post?.userId || post?.userID?._id || post?.userID)) === String(profile?._id || user?._id);
              return (
                <div key={post._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                  <PostCard post={post} isLiked={false} isSaved={false} onLike={() => { }} onSave={() => { }} />
                  {isOwner && (
                    <div className="flex gap-3 px-5 py-3 bg-gradient-to-r from-gray-50 to-purple-50/30 border-t border-gray-100">
                      <button
                        onClick={() => handleUpdatePost(post)}
                        disabled={updating}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
                      >
                        <Pencil size={16} /> Edit Post
                      </button>
                      <button
                        onClick={() => handleDeletePost(post._id)}
                        disabled={deleting}
                        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-semibold hover:underline transition-colors"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          {posts.filter((p) => {
            const uid = p?.userId?._id || p?.userId || p?.userID?._id || p?.userID;
            const me = profile?._id || user?._id;
            return uid && me && String(uid) === String(me);
          }).length === 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid size={32} className="text-purple-600" />
                </div>
                <p className="text-gray-500 font-medium">No posts yet</p>
                <p className="text-gray-400 text-sm mt-1">Start sharing your moments!</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
