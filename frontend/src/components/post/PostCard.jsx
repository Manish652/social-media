import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Trash2 } from "lucide-react";
import api from "../../api/axios.js";
import { userAuth } from "../../context/AuthContext.jsx";
function formatTimeAgo(dateStr) {
  try {
    const d = new Date(dateStr);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "";
  } }

export default function PostCard({ post, isLiked, isSaved, onLike, onSave }) {
  const { user, updateFollowing } = userAuth();
  const populatedUser = post?.userId || post?.userID;
  const authorId = populatedUser?._id || populatedUser;
  const username = populatedUser?.username || post?.username || "User";
  const avatar = populatedUser?.profilePicture || post?.avatar || "https://via.placeholder.com/40";
  const timeAgo = post?.createdAt ? formatTimeAgo(post.createdAt) : post?.timeAgo || "";
  const likesCount = Array.isArray(post?.likes) ? post.likes.length : post?.likes || 0;
  const mediaImage = post?.image;
  const mediaVideo = post?.video;
  const isMe = user?._id && authorId && String(user._id) === String(authorId);
  const isFollowing = useMemo(() => {
    if (!user?._id || !authorId || !Array.isArray(user?.following)) return false;
    return user.following.map(String).includes(String(authorId));
  }, [user, authorId]);

  // Comments
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentCount, setCommentCount] = useState(
    Array.isArray(post?.comments) ? post.comments.length : post?.commentsCount || 0
  );

  const postId = post?._id || post?.id;

  const fetchComments = async () => {
    if (!postId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/comment/${postId}/comments`);
      const list = Array.isArray(data?.comments) ? data.comments : data;
      setComments(list);
      setCommentCount(list.length);
    } catch (err) {
      console.error("load comments failed", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleComments = async () => {
    const willOpen = !open;
    setOpen(willOpen);
    if (willOpen && comments.length === 0) {
      await fetchComments();
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post(`/comment/${postId}/comment`, { text: newComment.trim() });
      if (data?.comment) {
        setComments((prev) => [data.comment, ...prev]);
        setCommentCount((c) => c + 1);
      } else {
        await fetchComments();
      }
      setNewComment("");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add comment");
    }
  };

  const deleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await api.delete(`/comment/${postId}/comment/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setCommentCount((c) => Math.max(0, c - 1));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete comment");
    }
  };

  //  Updated Follow / Unfollow with Socket emit
  const handleFollow = async () => {
    updateFollowing(authorId, "follow");
    try {
      await api.post(`/follow/${authorId}/follow`);
    } catch (e) {
      updateFollowing(authorId, "unfollow");
    }
  };

  const handleUnfollow = async () => {
    updateFollowing(authorId, "unfollow");
    try {
      await api.post(`/follow/${authorId}/unfollow`);
    } catch (e) {
      updateFollowing(authorId, "follow");
    }
  };

 return (
  <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-white via-purple-50/20 to-pink-50/20">
      <div className="flex items-center gap-3">
        <Link to={authorId ? `/u/${authorId}` : "#"} className="shrink-0 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity" />
          <img
            src={avatar}
            alt={username}
            className="relative w-11 h-11 rounded-full object-cover border-2 border-white shadow-md"
          />
        </Link>
        <div>
          <Link to={authorId ? `/u/${authorId}` : "#"} className="font-bold text-gray-900 text-sm hover:text-purple-600 transition-colors">
            {username}
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="w-1 h-1 rounded-full bg-purple-400" />
            <p className="text-xs text-gray-500 font-medium">{timeAgo}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isMe && authorId && !isFollowing && (
          <button
            onClick={handleFollow}
            className="px-4 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            Follow
          </button>
        )}
        {!isMe && authorId && isFollowing && (
          <button
            onClick={handleUnfollow}
            className="px-4 py-1.5 text-xs font-semibold rounded-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all"
          >
            Following
          </button>
        )}
        <button className="p-2 hover:bg-purple-50 rounded-full transition-colors">
          <MoreHorizontal size={18} className="text-gray-600" />
        </button>
      </div>
    </div>

    {/* Media */}
    <div className="relative bg-gradient-to-br from-gray-50 to-purple-50/30">
      {mediaImage ? (
        <img src={mediaImage} alt="Post" className="w-full max-h-[550px] object-cover" />
      ) : mediaVideo ? (
        <video controls className="w-full max-h-[550px] bg-black">
          <source src={mediaVideo} />
        </video>
      ) : null}
    </div>

    {/* Actions Bar */}
    <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-purple-50/30 via-white to-pink-50/30">
      <div className="flex items-center gap-5">
        <button
          onClick={onLike}
          className={`group relative p-2 rounded-xl transition-all ${
            isLiked 
              ? "bg-red-50 scale-110" 
              : "hover:bg-purple-50 hover:scale-105"
          }`}
        >
          <Heart 
            size={24} 
            fill={isLiked ? "currentColor" : "none"} 
            className={isLiked ? "text-red-500" : "text-gray-700 group-hover:text-purple-600"}
            strokeWidth={2}
          />
        </button>
        
        <button 
          className="relative p-2 rounded-xl hover:bg-purple-50 hover:scale-105 transition-all group" 
          onClick={toggleComments}
        >
          <MessageCircle size={24} strokeWidth={2} className="text-gray-700 group-hover:text-purple-600" />
          {commentCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 rounded-full shadow-lg">
              {commentCount}
            </span>
          )}
        </button>
      </div>
      
      <button
        onClick={onSave}
        className={`group p-2 rounded-xl transition-all ${
          isSaved 
            ? "bg-yellow-50 scale-110" 
            : "hover:bg-purple-50 hover:scale-105"
        }`} >
        <Bookmark 
          size={24} 
          fill={isSaved ? "currentColor" : "none"} 
          className={isSaved ? "text-yellow-500" : "text-gray-700 group-hover:text-purple-600"}
          strokeWidth={2}
        />
      </button>
    </div>

    {/* Caption & Likes */}
    <div className="px-5 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-400 to-pink-500 border-2 border-white" />
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 border-2 border-white" />
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-yellow-500 border-2 border-white" />
        </div>
        <p className="text-sm font-bold text-gray-800">
          {likesCount.toLocaleString()} <span className="font-normal text-gray-600">likes</span>
        </p>
      </div>
      
      {post?.caption && (
        <p className="text-sm text-gray-800 leading-relaxed">
          <Link to={authorId ? `/profile/${authorId}` : "#"} className="font-bold text-purple-600 hover:underline mr-2">
            {username}
          </Link>
          {post.caption}
        </p>
      )}
    </div>

    {/* Comments Section */}
    {open && (
      <div className="mx-4 mb-4">
        <div className="rounded-2xl border-2 border-purple-100 shadow-lg overflow-hidden bg-gradient-to-br from-white to-purple-50/20">
          <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600">
            <p className="text-sm font-bold text-white">Comments</p>
            <span className="text-xs font-semibold px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full">
              {commentCount}
            </span>
          </div>
          
          <div className="max-h-72 overflow-y-auto bg-white">
            {loading ? (
              <div className="p-6 text-center">
                <div className="inline-block w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle size={28} className="text-purple-600" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Be the first to comment!</p>
              </div>
            ) : (
              comments.map((c, idx) => (
                <div 
                  key={c._id} 
                  className={`px-5 py-4 flex items-start gap-3 hover:bg-purple-50/50 transition-colors ${
                    idx !== comments.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity" />
                    <img
                      src={c.user?.profilePicture || "https://via.placeholder.com/32"}
                      alt={c.user?.username || "User"}
                      className="relative w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-2xl px-4 py-2.5">
                      <p className="text-sm font-bold text-gray-900 mb-1">
                        {c.user?.username || "User"}
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed">{c.text}</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 ml-4 font-medium">
                      {c.createdAt ? formatTimeAgo(c.createdAt) : ""}
                    </p>
                  </div>
                  
                  {user?._id && c.user && String(c.user._id) === String(user._id) && (
                    <button 
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" 
                      onClick={() => deleteComment(c._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={addComment} className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50/50 to-pink-50/50 border-t border-purple-100">
            <div className="flex-1 flex items-center bg-white rounded-2xl px-4 shadow-sm border border-purple-100 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent outline-none text-sm py-3 placeholder:text-gray-400"
              />
            </div>
            <button 
              type="submit" 
              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    )}
  </div>
); }
