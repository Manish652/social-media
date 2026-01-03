import { Heart, MessageCircle, MoreVertical, Pause, Play, Send, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { userAuth } from "../context/AuthContext.jsx";

export default function Reels() {
  const { user } = userAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.play().catch(err => console.log("Play failed:", err));
      setIsPlaying(true);
    }

    return () => {
      videoRefs.current.forEach(video => {
        if (video) video.pause();
      });
    };
  }, [currentIndex]);

  const fetchReels = async () => {
    try {
      const { data } = await api.get("/reel/all");
      console.log("Fetched reels:", data);
      setReels(data.reels || []);
    } catch (err) {
      console.error("Failed to fetch reels:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (reelId, index) => {
    try {
      await api.post(`/reel/like/${reelId}`);
      setReels(prev =>
        prev.map((reel, i) => {
          if (i === index) {
            const isLiked = reel.likes.includes(user._id);
            return {
              ...reel,
              likes: isLiked
                ? reel.likes.filter(id => id !== user._id)
                : [...reel.likes, user._id]
            };
          }
          return reel;
        })
      );
    } catch (err) {
      console.error("Failed to like reel:", err);
    }
  };

  const openComments = async (reelId) => {
    setShowComments(true);
    setLoadingComments(true);
    try {
      const { data } = await api.get(`/reel/comments/${reelId}`);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const closeComments = () => {
    setShowComments(false);
    setComments([]);
    setCommentText("");
  };

  const submitComment = async (reelId) => {
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const { data } = await api.post(`/reel/comment/${reelId}`, {
        text: commentText,
      });
      setComments(prev => [data.comment, ...prev]);
      setCommentText("");

      setReels(prev =>
        prev.map(reel => {
          if (reel._id === reelId) {
            return {
              ...reel,
              comments: [...(reel.comments || []), data.comment._id]
            };
          }
          return reel;
        })
      );
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const itemHeight = e.target.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      setProgress(0);

      videoRefs.current.forEach((video, i) => {
        if (video) {
          if (i === newIndex) {
            video.currentTime = 0;
            video.play().catch(err => console.log("Play failed:", err));
          } else {
            video.pause();
            video.currentTime = 0;
          }
        }
      });
    }
  };

  const togglePlayPause = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.pause();
      } else {
        currentVideo.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoClick = () => {
    togglePlayPause();
    showControlsTemporarily();
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  const handleTimeUpdate = (index) => {
    if (index === currentIndex) {
      const video = videoRefs.current[index];
      if (video) {
        const progressPercent = (video.currentTime / video.duration) * 100;
        setProgress(progressPercent);
      }
    }
  };

  const navigateReel = (direction) => {
    const container = containerRef.current;
    if (!container) return;

    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < reels.length) {
      container.scrollTo({
        top: newIndex * container.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 absolute top-0 left-1/2 -translate-x-1/2"></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading reels...</p>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="text-center px-4">
          <div className="text-7xl mb-6 animate-bounce">🎬</div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
            No Reels Yet
          </h2>
          <p className="text-gray-600 mb-8 text-lg">Be the first to create a reel!</p>
          <Link
            to="/create-reel"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all inline-block"
          >
            Create Reel
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        div::-webkit-scrollbar { display: none; }
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>

      {reels.map((reel, index) => {
        const isLiked = reel.likes?.includes(user._id);

        return (
          <div
            key={reel._id}
            className="h-screen w-full snap-start relative flex items-center justify-center"
          >
            <video
              ref={el => (videoRefs.current[index] = el)}
              src={reel.videoUrl}
              className="h-full w-full object-contain bg-black"
              loop
              muted={muted}
              playsInline
              autoPlay={index === 0}
              onTimeUpdate={() => handleTimeUpdate(index)}
              onClick={handleVideoClick}
            />

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 backdrop-blur-sm z-20">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Overlay Controls */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top Gradient */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/70 via-black/30 to-transparent"></div>

              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>

              {/* Play/Pause Overlay */}
              {showControls && (
                <div
                  onClick={togglePlayPause}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-white/40 transition-all shadow-2xl animate-fade-in"
                >
                  {isPlaying ? (
                    <Pause className="w-10 h-10 text-white" fill="white" />
                  ) : (
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  )}
                </div>
              )}

              {/* Navigation Arrows */}
              {index > 0 && (
                <button
                  onClick={() => navigateReel(-1)}
                  className="absolute top-1/2 left-4 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-all pointer-events-auto opacity-0 hover:opacity-100 shadow-lg border border-white/20"
                >
                  <span className="text-white text-xl font-bold">↑</span>
                </button>
              )}

              {index < reels.length - 1 && (
                <button
                  onClick={() => navigateReel(1)}
                  className="absolute bottom-1/2 left-4 translate-y-1/2 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/25 transition-all pointer-events-auto opacity-0 hover:opacity-100 shadow-lg border border-white/20"
                >
                  <span className="text-white text-xl font-bold">↓</span>
                </button>
              )}

              {/* User Info & Caption */}
              <div className="absolute bottom-24 left-4 right-20 pointer-events-none z-10">
                <Link
                  to={`/profile/${reel.userId.username}`}
                  className="inline-flex items-center gap-3 mb-3 pointer-events-auto group"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 ring-2 ring-white/50 group-hover:ring-white/80 transition-all">
                    <img
                      src={reel.userId.profilePicture}
                      alt={reel.userId.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <span className="text-white font-semibold text-lg drop-shadow-lg group-hover:scale-105 transition-transform">
                    @{reel.userId.username}
                  </span>
                </Link>

                {reel.caption && (
                  <div className="text-white text-sm leading-relaxed drop-shadow-lg backdrop-blur-sm bg-black/20 rounded-lg p-3 max-w-md">
                    {reel.caption}
                  </div>
                )}
              </div>

              {/* Right Side Actions */}
              <div className="absolute right-4 bottom-24 flex flex-col gap-6 pointer-events-auto z-10">
                {/* Like */}
                <button
                  onClick={() => handleLike(reel._id, index)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
                    isLiked 
                      ? 'bg-gradient-to-br from-pink-500 to-red-500 scale-110' 
                      : 'bg-white/20 hover:bg-white/30 hover:scale-110'
                  }`}>
                    <Heart
                      className={`w-7 h-7 transition-all ${
                        isLiked ? 'text-white' : 'text-white'
                      }`}
                      fill={isLiked ? 'white' : 'none'}
                    />
                  </div>
                  <span className="text-white text-sm font-semibold drop-shadow-lg">
                    {reel.likes?.length || 0}
                  </span>
                </button>

                {/* Comment */}
                <button
                  onClick={() => openComments(reel._id)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all shadow-lg">
                    <MessageCircle className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-white text-sm font-semibold drop-shadow-lg">
                    {reel.comments?.length || 0}
                  </span>
                </button>

                {/* Share */}
                <button className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all shadow-lg">
                    <Send className="w-7 h-7 text-white" />
                  </div>
                </button>

                {/* More */}
                <button className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all shadow-lg">
                    <MoreVertical className="w-7 h-7 text-white" />
                  </div>
                </button>

                {/* Mute/Unmute */}
                <button
                  onClick={() => setMuted(!muted)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all shadow-lg">
                    {muted ? (
                      <VolumeX className="w-7 h-7 text-white" />
                    ) : (
                      <Volume2 className="w-7 h-7 text-white" />
                    )}
                  </div>
                </button>
              </div>

              {/* Reel Counter */}
              <div className="absolute top-6 right-4 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg border border-white/20">
                {index + 1} / {reels.length}
              </div>
            </div>
          </div>
        );
      })}

      {/* Comments Modal */}
      {showComments && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
          <div className="bg-white w-full md:w-[500px] md:rounded-2xl rounded-t-3xl shadow-2xl max-h-[85vh] md:max-h-[700px] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Comments
              </h3>
              <button
                onClick={closeComments}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loadingComments ? (
                <div className="flex justify-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200"></div>
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent border-t-purple-600 absolute top-0 left-0"></div>
                  </div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-500 text-lg font-medium">No comments yet</p>
                  <p className="text-gray-400 text-sm mt-2">Be the first to comment!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment._id} className="flex gap-3 mb-5 group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 flex-shrink-0">
                      <img
                        src={comment.user.profilePicture}
                        alt={comment.user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 group-hover:bg-gray-100 transition-colors">
                      <p className="font-semibold text-gray-900 text-sm mb-1">
                        {comment.user.username}
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">{comment.text}</p>
                      <p className="text-gray-400 text-xs mt-2">
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitComment(reels[currentIndex]._id);
                    }
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 border-2 border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors bg-white"
                />
                <button
                  onClick={() => submitComment(reels[currentIndex]._id)}
                  disabled={!commentText.trim() || submittingComment}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                >
                  {submittingComment ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Post
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  );
}