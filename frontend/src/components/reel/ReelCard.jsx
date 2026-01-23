import { Heart, MessageCircle, Play, Trash2 } from "lucide-react";

export default function ReelCard({ reel, onClick, onDelete, showDelete = false }) {
  const likesCount = Array.isArray(reel?.likes) ? reel.likes.length : 0;
  const commentsCount = Array.isArray(reel?.comments) ? reel.comments.length : 0;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Delete this reel? This will also remove it from your posts.")) {
      onDelete?.(reel._id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative aspect-[9/16] rounded-xl overflow-hidden cursor-pointer group bg-black"
    >
      {/* Thumbnail/Video Preview */}
      <video
        src={reel.videoUrl}
        className="w-full h-full object-cover"
        muted
        playsInline
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Play Icon */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
          <Play size={32} className="text-white fill-white ml-1" />
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Heart size={18} className="fill-white" />
            <span className="text-sm font-semibold">{likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={18} />
            <span className="text-sm font-semibold">{commentsCount}</span>
          </div>
        </div>
        {reel.caption && (
          <p className="text-xs mt-2 line-clamp-2 opacity-90">{reel.caption}</p>
        )}
      </div>

      {/* Reel Badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full shadow-lg">
        Reel
      </div>

      {/* Delete Button */}
      {showDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
}

