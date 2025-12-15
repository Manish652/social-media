import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PostCard from "../components/post/PostCard.jsx";
import StoryCircle from "../components/story/StoryCircle.jsx";
import StoryViewer from "../components/story/StoryViewer.jsx";
import api from "../api/axios.js";
import { userAuth } from "../context/AuthContext.jsx";
import Skaliton from "../components/layout/Skaliton.jsx";

export default function Home() {
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = userAuth();
  // stories
  const [stories, setStories] = useState([]); // raw stories from backend
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerItems, setViewerItems] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/post");
        setPosts(data?.posts || []);
      } catch (err) {
        console.error("Failed to load posts", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchStories = async () => {
      try {
        const { data } = await api.get("/story/following");
        setStories(Array.isArray(data?.stories) ? data.stories : []);
      } catch (e) {
        setStories([]);
      }
    };
    fetchPosts();
    fetchStories();
  }, []);

  const toggleLike = async (post) => {
    const id = post._id || post.id;
    const isLiked =
      Array.isArray(post.likes) && user?._id
        ? post.likes.map(String).includes(String(user._id))
        : likedPosts.has(id);

    try {
      // optimistic UI update
      setPosts((prev) =>
        prev.map((p) => {
          if ((p._id || p.id) !== id) return p;
          const likesArr = Array.isArray(p.likes) ? [...p.likes] : [];
          if (isLiked) {
            const idx = likesArr.map(String).indexOf(String(user?._id));
            if (idx >= 0) likesArr.splice(idx, 1);
            return { ...p, likes: likesArr };
          } else {
            if (user?._id) likesArr.push(user._id);
            return { ...p, likes: likesArr };
          }
        })
      );

      // backend like/unlike
      if (isLiked) {
        await api.post(`/like/${id}/dislike`);
      } else {
        await api.post(`/like/${id}/like`);
      }
    } catch (err) {
      // revert on error by refetching posts
      try {
        const { data } = await api.get("/post");
        setPosts(data?.posts || []);
      } catch {}
      console.error("toggle like failed", err);
    }
  };

  const toggleSave = (postId) => {
    setSavedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  return (
    <>
    <div className="min-h-screen pb-24 bg-[#fafafa]">
      {/* Stories */}
      <div className="bg-white border-b border-gray-200/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {useMemo(() => {
              // distinct users who have stories
              const byUser = new Map();
              for (const s of stories) {
                const uid = s?.user?._id || s?.user;
                if (!uid) continue;
                if (!byUser.has(uid)) {
                  byUser.set(uid, {
                    id: uid,
                    username: s?.user?.username || "User",
                    avatar: s?.user?.profilePicture || "https://via.placeholder.com/40",
                    hasStory: true,
                  });
                }
              }
              return Array.from(byUser.values());
            }, [stories]).map((u) => (
              <StoryCircle
                key={u.id}
                story={u}
                onClick={() => {
                  const items = stories.filter((s) => String(s?.user?._id || s?.user) === String(u.id));
                  setViewerItems(items);
                  setViewerOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {viewerOpen && (
        <StoryViewer items={viewerItems} startIndex={0} onClose={() => setViewerOpen(false)} />
      )}

      {/* Feed */}
      <div className="max-w-2xl mx-auto">
        {loading && (
          <div className="space-y-4">
            <Skaliton />
            <Skaliton />
            <Skaliton />
          </div>
        )}
        {!loading && posts.length === 0 && (
          <div className="text-center py-8 text-gray-500">No posts yet</div>
        )}
        {posts.map((post) => {
          const id = post._id || post.id;
          const isLiked =
            Array.isArray(post.likes) && user?._id
              ? post.likes.map(String).includes(String(user._id))
              : likedPosts.has(id);
          return (
            <PostCard
              key={id}
              post={post}
              isLiked={isLiked}
              isSaved={savedPosts.has(id)}
              onLike={() => toggleLike(post)}
              onSave={() => toggleSave(id)}
            />
          );
        })}
      </div>
    </div>
    </>
  );
}
