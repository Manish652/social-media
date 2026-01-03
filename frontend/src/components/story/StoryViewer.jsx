import { ChevronLeft, ChevronRight, Pause, Play, Volume2, VolumeX, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function StoryViewer({ items = [], startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const current = items[index] || null;
  const total = items.length;

  const next = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prev = () => {
    if (index > 0) {
      setIndex(index - 1);
      setProgress(0);
    }
  };

  // Calculate time remaining
  const getTimeRemaining = (story) => {
    if (!story?.expiresAt) return "24h";
    const now = new Date();
    const expires = new Date(story.expiresAt);
    const diff = expires - now;

    if (diff <= 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  // Auto-advance for image/text stories
  useEffect(() => {
    if (!current || isPaused) return;

    const duration = current.mediaType === "video" ? 0 : 5000; // 5 seconds for image/text

    if (duration > 0) {
      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = (elapsed / duration) * 100;
        setProgress(newProgress);

        if (newProgress >= 100) {
          clearInterval(progressIntervalRef.current);
          next();
        }
      }, 50);

      return () => clearInterval(progressIntervalRef.current);
    }
  }, [current, index, isPaused]);

  // hydra -l manishbhunia81@gmail.com -P ~/small_pass.txt localhost http-post-form "/api/user/login:email=^USER^&password=^PASS^:F=invalid" -t 4 -vV -f
  useEffect(() => {
    if (current?.mediaType === "video" && videoRef.current) {
      const video = videoRef.current;
      video.muted = isMuted;

      const updateProgress = () => {
        if (video.duration) {
          const newProgress = (video.currentTime / video.duration) * 100;
          setProgress(newProgress);
        }
      };

      const handleEnded = () => {
        next();
      };

      video.addEventListener("timeupdate", updateProgress);
      video.addEventListener("ended", handleEnded);

      if (!isPaused) {
        video.play().catch(() => { });
      } else {
        video.pause();
      }

      return () => {
        video.removeEventListener("timeupdate", updateProgress);
        video.removeEventListener("ended", handleEnded);
      };
    }
  }, [current?.mediaType, current?.mediaUrl, index, isPaused, isMuted]);

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
        {items.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-100"
              style={{
                width: i < index ? "100%" : i === index ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-50 px-4 mt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={current.user?.profilePicture || "https://via.placeholder.com/40"}
                alt="user"
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
              />
            </div>
            <div>
              <div className="text-white font-semibold text-sm drop-shadow-lg">
                {current.user?.username || "User"}
              </div>
              <div className="text-white/80 text-xs drop-shadow-lg">
                {getTimeRemaining(current)} remaining
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pause/Play */}
            <button
              onClick={togglePause}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all"
            >
              {isPaused ? (
                <Play size={18} className="text-white" />
              ) : (
                <Pause size={18} className="text-white" />
              )}
            </button>

            {/* Mute/Unmute (only for videos) */}
            {current.mediaType === "video" && (
              <button
                onClick={toggleMute}
                className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all"
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-white" />
                ) : (
                  <Volume2 size={18} className="text-white" />
                )}
              </button>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Story Content */}
      <div className="relative w-full max-w-md h-[85vh] flex items-center justify-center">
        {/* Click areas for navigation */}
        <div className="absolute inset-0 flex z-10">
          <div className="w-1/3 h-full cursor-pointer" onClick={prev} />
          <div className="w-1/3 h-full cursor-pointer" onClick={togglePause} />
          <div className="w-1/3 h-full cursor-pointer" onClick={next} />
        </div>

        {/* Media Content */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          {current.mediaType === "image" && (
            <img
              src={current.mediaUrl}
              alt="story"
              className="w-full h-full object-cover"
            />
          )}

          {current.mediaType === "video" && (
            <video
              ref={videoRef}
              src={current.mediaUrl}
              className="w-full h-full object-cover"
              playsInline
              loop={false}
            />
          )}

          {current.mediaType === "text" && (
            <div
              className="w-full h-full flex items-center justify-center p-8"
              style={{ backgroundColor: current.bgColor || "#000" }}
            >
              <p className="text-white text-center text-2xl font-bold leading-relaxed drop-shadow-lg">
                {current.text}
              </p>
            </div>
          )}

          {/* Caption Overlay */}
          {current.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
              <p className="text-white text-sm leading-relaxed drop-shadow-lg">
                {current.caption}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      {index > 0 && (
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all hover:scale-110"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      )}

      {index < total - 1 && (
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all hover:scale-110"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      )}

      {/* Story Counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full">
        <span className="text-white text-sm font-semibold">
          {index + 1} / {total}
        </span>
      </div>
    </div>
  );
}
