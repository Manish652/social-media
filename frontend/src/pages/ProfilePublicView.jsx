import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import FollowListModal from "../components/common/FollowListModal.jsx";
import PostCard from "../components/post/PostCard.jsx";
import { userAuth } from "../context/AuthContext.jsx";

export default function ProfilePublicView() {
  const { id } = useParams();
  const { user, updateFollowing } = userAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState("followers");

  const isMe = useMemo(() => user?._id && id && String(user._id) === String(id), [user?._id, id]);
  const isFollowing = useMemo(() => {
    if (!user?._id || !id || !Array.isArray(user?.following)) return false;
    return user.following.map(String).includes(String(id));
  }, [user, id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/user/profile/${id}`);
        setProfile(data);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { data } = await api.get("/post");
        const all = Array.isArray(data?.posts) ? data.posts : [];
        const userPosts = all.filter((p) => {
          const uid = p?.userId?._id || p?.userId || p?.userID?._id || p?.userID;
          return uid && String(uid) === String(id);
        });
        setPosts(userPosts);
      } catch { }
    };
    if (id) loadPosts();
  }, [id]);

  const handleFollow = async () => {
    updateFollowing(id, "follow");
    // Optimistically update local profile
    setProfile(prev => ({
      ...prev,
      followers: [...(prev.followers || []), user._id]
    }));
    try {
      await api.post(`/follow/${id}/follow`);
      // Refresh profile to get accurate count
      const { data } = await api.get(`/user/profile/${id}`);
      setProfile(data);
    } catch (e) {
      updateFollowing(id, "unfollow");
      // Revert on error
      const { data } = await api.get(`/user/profile/${id}`);
      setProfile(data);
    }
  };

  const handleUnfollow = async () => {
    updateFollowing(id, "unfollow");
    // Optimistically update local profile
    setProfile(prev => ({
      ...prev,
      followers: (prev.followers || []).filter(fid => String(fid) !== String(user._id))
    }));
    try {
      await api.post(`/follow/${id}/unfollow`);
      // Refresh profile to get accurate count
      const { data } = await api.get(`/user/profile/${id}`);
      setProfile(data);
    } catch (e) {
      updateFollowing(id, "follow");
      // Revert on error
      const { data } = await api.get(`/user/profile/${id}`);
      setProfile(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠</span>
          </div>
          <p className="text-red-600 font-semibold mb-2">Oops!</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md text-center border">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">👤</span>
          </div>
          <p className="text-gray-600 font-semibold">Profile not found</p>
        </div>
      </div>
    );
  }

  const followersCount = Array.isArray(profile.followers) ? profile.followers.length : 0;
  const followingCount = Array.isArray(profile.following) ? profile.following.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Follow List Modal */}
      <FollowListModal
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
        userId={id}
        type={followModalType}
        currentUserId={user?._id}
      />

      {/* Header with animated gradient backdrop */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 h-48 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-400/20 via-pink-400/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400/20 via-purple-400/20 to-transparent"></div>
        <div className="absolute inset-0 backdrop-blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-24 pb-12">
        {/* Profile Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform transition-all duration-500 hover:shadow-purple-500/10 hover:shadow-3xl">
          {/* Profile Header */}
          <div className="p-8 sm:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar with animated gradient ring */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-full opacity-75 group-hover:opacity-100 blur-md transition duration-500 animate-pulse"></div>
                <div className="relative">
                  <img
                    src={profile.profilePicture || "https://via.placeholder.com/150"}
                    alt="avatar"
                    className="relative w-36 h-36 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-purple-100 transition-transform duration-300 group-hover:scale-105"
                  />
                  {!isMe && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full p-1 shadow-lg transform transition-transform duration-200 hover:scale-110">
                      <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center">
                        {isFollowing ? (
                          <span className="text-purple-600 text-lg">✓</span>
                        ) : (
                          <span className="text-purple-600 text-xl">+</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left w-full">
                {/* Username and Follow Button Row */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-1">
                      {profile.username}
                    </h1>
                    <p className="text-gray-500 text-base font-medium">@{profile.username}</p>
                  </div>

                  {/* Follow Button */}
                  {!isMe && (
                    <div className="flex justify-center md:justify-start">
                      {!isFollowing ? (
                        <button
                          onClick={handleFollow}
                          className="group relative px-10 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0 transition-all duration-300 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <span className="relative">Follow</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleUnfollow}
                          className="px-10 py-3.5 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 text-purple-700 font-bold hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 hover:border-purple-400 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Following
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Bio Section */}
                {profile.bio && (
                  <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100 shadow-sm">
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start gap-6 md:gap-8">
                  <button
                    onClick={() => {
                      setFollowModalType("followers");
                      setShowFollowModal(true);
                    }}
                    className="relative group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-purple-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative px-6 py-3">
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {followersCount}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Followers
                      </div>
                    </div>
                  </button>

                  <div className="w-px h-12 bg-gray-200"></div>

                  <button
                    onClick={() => {
                      setFollowModalType("following");
                      setShowFollowModal(true);
                    }}
                    className="relative group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-blue-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative px-6 py-3">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {followingCount}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Following
                      </div>
                    </div>
                  </button>

                  <div className="w-px h-12 bg-gray-200"></div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-pink-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative px-6 py-3">
                      <div className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        {posts.length}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Posts
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-800">Posts</h2>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/20 overflow-hidden">
            {posts.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">📝</span>
                </div>
                <p className="text-gray-500 font-medium">No posts yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  {isMe ? "Share your first post!" : "Check back later for updates"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <div
                    key={post._id}
                    className="p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200"
                  >
                    <PostCard
                      post={post}
                      isLiked={false}
                      isSaved={false}
                      onLike={() => { }}
                      onSave={() => { }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}