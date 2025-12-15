import { Image, Search as SearchIcon, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Search() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [randomPosts, setRandomPosts] = useState([]);
  const [error, setError] = useState("");

  // Fetch random posts on mount
  useEffect(() => {
    fetchRandomPosts();
  }, []);

  const fetchRandomPosts = async () => {
    try {
      const { data } = await api.get("/post");
      // Shuffle and take first 12 posts
      const shuffled = (data.posts || []).sort(() => 0.5 - Math.random());
      setRandomPosts(shuffled.slice(0, 12));
    } catch (err) {
      console.error("Failed to fetch random posts:", err);
    }
  };

  const onSearch = async (e) => {
    e?.preventDefault?.();
    setError("");
    setUsers([]);
    setPosts([]);
    if (!q.trim()) return;
    try {
      setLoading(true);
      const { data } = await api.get("/search/search", { params: { query: q.trim() } });
      setUsers(Array.isArray(data?.userResult) ? data.userResult : []);
      setPosts(Array.isArray(data?.postResult) ? data.postResult : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  const hasSearched = users.length > 0 || posts.length > 0 || error || loading;

  return (
    <div className="min-h-screen pb-28 bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        {/* Search Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl mb-3">
            <SearchIcon size={28} className="text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Discover & Explore
          </h1>
          <p className="text-sm text-gray-500 mt-1">Search for people, posts, and more</p>
        </div>

        {/* Search bar */}
        <form
          onSubmit={onSearch}
          className="relative bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden focus-within:ring-4 focus-within:ring-purple-100 transition-all hover:shadow-xl"
        >
          <div className="flex items-center gap-3 px-5 py-4">
            <SearchIcon size={20} className="text-gray-400 flex-shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users or captions..."
              className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-60 transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching
                </span>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 text-center">
            {error}
          </div>
        )}

        {/* Explore Posts - Show when no search */}
        {!hasSearched && randomPosts.length > 0 && (
          <div className="mt-6">
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-purple-600" />
                  <span className="font-semibold text-gray-800">Explore</span>
                  <span className="ml-auto text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">
                    Trending
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 p-1">
                {randomPosts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/post/${post._id}`}
                    className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                  >
                    {post.image ? (
                      <img
                        src={post.image}
                        alt="post"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : post.video ? (
                      <video
                        className="w-full h-full object-cover bg-black group-hover:scale-110 transition-transform duration-300"
                        src={post.video}
                        muted
                        loop
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex items-end transition-opacity duration-300">
                      <p className="text-white text-xs font-medium p-3 line-clamp-2">
                        {post.caption || "No caption"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && (
          <div className="mt-6 space-y-6">
            {/* Users */}
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-purple-600" />
                  <span className="font-semibold text-gray-800">People</span>
                  {users.length > 0 && (
                    <span className="ml-auto text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {users.length}
                    </span>
                  )}
                </div>
              </div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 mt-3">Searching for people...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users size={28} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">No users found</p>
                </div>
              ) : (
                <ul>
                  {users.map((u) => (
                    <li
                      key={u._id}
                      className="p-4 flex items-center gap-4 border-b last:border-b-0 hover:bg-gradient-to-r hover:from-purple-50/30 hover:to-pink-50/30 transition-colors"
                    >
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-75 blur transition-opacity" />
                        <img
                          to={`/u/${u._id}`}
                          src={u.profilePic || u.profilePicture || "https://via.placeholder.com/40"}
                          alt={u.username}
                          className="relative w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{u.username}</p>
                        <p className="text-xs text-gray-500 truncate">{u.fullName || u.email || ""}</p>
                      </div>
                      <Link
                        to={`/u/${u._id}`}
                        className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Posts */}
            <div className="bg-white rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                <div className="flex items-center gap-2">
                  <Image size={20} className="text-purple-600" />
                  <span className="font-semibold text-gray-800">Posts</span>
                  {posts.length > 0 && (
                    <span className="ml-auto text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {posts.length}
                    </span>
                  )}
                </div>
              </div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 mt-3">Searching for posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Image size={28} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">No posts found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 p-1">
                  {posts.map((p) => (
                    <Link
                      key={p._id}
                      to={`/post/${p._id}`}
                      className="group relative aspect-square rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          alt="post"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : p.video ? (
                        <video
                          className="w-full h-full object-cover bg-black group-hover:scale-110 transition-transform duration-300"
                          src={p.video}
                          muted
                          loop
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 flex items-end transition-opacity duration-300">
                        <p className="text-white text-xs font-medium p-3 line-clamp-2">
                          {p.caption || "No caption"}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}