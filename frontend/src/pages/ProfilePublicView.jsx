import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios.js";
import { userAuth } from "../context/AuthContext.jsx";
import PostCard from "../components/post/PostCard.jsx";

export default function ProfilePublicView() {
  const { id } = useParams();
  const { user, updateFollowing } = userAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } catch {}
    };
    if (id) loadPosts();
  }, [id]);

  const handleFollow = async () => {
    updateFollowing(id, "follow");
    try {
      await api.post(`/follow/${id}/follow`);
    } catch (e) {
      updateFollowing(id, "unfollow");
    }
  };

  const handleUnfollow = async () => {
    updateFollowing(id, "unfollow");
    try {
      await api.post(`/follow/${id}/unfollow`);
    } catch (e) {
      updateFollowing(id, "follow");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
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
      {/* Header with gradient backdrop */}
      <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 h-34">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 backdrop-blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-32 pb-12">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          {/* Profile Header */}
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar with gradient ring */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-300"></div>
                <img
                  src={profile.profilePicture || "https://via.placeholder.com/150"}
                  alt="avatar"
                  className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {!isMe && (
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full p-1">
                    <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center">
                      {isFollowing ? (
                        <span className="text-purple-600">✓</span>
                      ) : (
                        <span className="text-purple-600">+</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {profile.username}
                    </h1>
                    {profile.bio && (
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed max-w-md">
                        {profile.bio}
                      </p>
                    )}
                  </div>

                  {/* Follow Button */}
                  {!isMe && (
                    <div>
                      {!isFollowing ? (
                        <button
                          onClick={handleFollow}
                          className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                        >
                          Follow
                        </button>
                      ) : (
                        <button
                          onClick={handleUnfollow}
                          className="px-8 py-3 rounded-full bg-white border-2 border-purple-200 text-purple-600 font-semibold hover:bg-purple-50 transition-all duration-200"
                        >
                          Following
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-center md:justify-start gap-8 mt-6">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-purple-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative px-6 py-3">
                      <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {followersCount}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Followers
                      </div>
                    </div>
                  </div>

                  <div className="w-px h-12 bg-gray-200"></div>

                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-blue-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                    <div className="relative px-6 py-3">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {followingCount}
                      </div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                        Following
                      </div>
                    </div>
                  </div>

                  <div className="w-px h-12 bg-gray-200"></div>

                  <div className="relative group cursor-pointer">
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

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
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
                      onLike={() => {}}
                      onSave={() => {}}
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