import { Heart, MessageCircle, MoreVertical, Send, Volume2, VolumeX, Play, Pause } from "lucide-react";
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
  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  useEffect(() => {
    fetchReels();
  }, []);

  useEffect(() => {
    // Play current video when index changes
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.play().catch(err => console.log("Play failed:", err));
      setIsPlaying(true);
    }

    return () => {
      // Cleanup
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

      setReels(prev => prev.map((reel, i) => {
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
      }));
    } catch (err) {
      console.error("Failed to like reel:", err);
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    const itemHeight = e.target.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      setProgress(0);

      // Pause all videos except current
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
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white">
        <div className="text-6xl mb-4">🎬</div>
        <h2 className="text-xl font-semibold mb-2">No Reels Yet</h2>
        <p className="text-gray-400 mb-6">Be the first to create a reel!</p>
        <Link
          to="/create-reel"
          className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
        >
          Create Reel
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide"
      onScroll={handleScroll}
    >
      {reels.map((reel, index) => {
        const isLiked = reel.likes?.includes(user._id);

        return (
          <div
            key={reel._id}
            className="h-screen w-full snap-start relative flex items-center justify-center"
          >
            {/* Video */}
            <video
              ref={el => videoRefs.current[index] = el}
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
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-10">
              <div
                className="h-full bg-white transition-all duration-100"
                style={{ width: `${index === currentIndex ? progress : 0}%` }}
              />
            </div>

            {/* Overlay Controls */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top Gradient */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />

              {/* Bottom Gradient */}
              <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 to-transparent" />
            </div>

            {/* Play/Pause Overlay */}
            {showControls && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                  {isPlaying ? (
                    <Pause size={40} className="text-white fill-white ml-1" />
                  ) : (
                    <Play size={40} className="text-white fill-white ml-2" />
                  )}
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            {index > 0 && (
              <button
                onClick={() => navigateReel(-1)}
                className="absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all pointer-events-auto opacity-0 hover:opacity-100"
              >
                <span className="text-white text-2xl">↑</span>
              </button>
            )}

            {index < reels.length - 1 && (
              <button
                onClick={() => navigateReel(1)}
                className="absolute bottom-1/2 left-4 translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all pointer-events-auto opacity-0 hover:opacity-100"
              >
                <span className="text-white text-2xl">↓</span>
              </button>
            )}

            {/* User Info & Caption */}
            <div className="absolute bottom-20 left-4 right-20 pointer-events-auto">
              <Link
                to={`/u/${reel.userId._id}`}
                className="flex items-center gap-3 mb-3 group"
              >
                <img
                  src={reel.userId.profilePicture || "https://via.placeholder.com/40"}
                  alt={reel.userId.username}
                  className="w-12 h-12 rounded-full border-2 border-white object-cover group-hover:scale-110 transition-transform"
                />
                <span className="text-white font-semibold text-sm group-hover:underline">
                  {reel.userId.username}
                </span>
              </Link>

              {reel.caption && (
                <p className="text-white text-sm line-clamp-2 drop-shadow-lg">
                  {reel.caption}
                </p>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6 pointer-events-auto">
              {/* Like */}
              <button
                onClick={() => handleLike(reel._id, index)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isLiked
                  ? "bg-red-500 scale-110"
                  : "bg-white/20 backdrop-blur-sm hover:bg-white/30 group-hover:scale-110"
                  }`}>
                  <Heart
                    size={24}
                    className={isLiked ? "fill-white text-white" : "text-white"}
                  />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {reel.likes?.length || 0}
                </span>
              </button>

              {/* Comment */}
              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all group-hover:scale-110">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {reel.comments?.length || 0}
                </span>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all group-hover:scale-110">
                  <Send size={24} className="text-white" />
                </div>
              </button>

              {/* More */}
              <button className="flex flex-col items-center gap-1 group">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all group-hover:scale-110">
                  <MoreVertical size={24} className="text-white" />
                </div>
              </button>

              {/* Mute/Unmute */}
              <button
                onClick={() => setMuted(!muted)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all group-hover:scale-110">
                  {muted ? (
                    <VolumeX size={24} className="text-white" />
                  ) : (
                    <Volume2 size={24} className="text-white" />
                  )}
                </div>
              </button>
            </div>

            {/* Reel Counter */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full pointer-events-none">
              <span className="text-white text-xs font-semibold">
                {index + 1} / {reels.length}
              </span>
            </div>
          </div>
        );
      })}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}