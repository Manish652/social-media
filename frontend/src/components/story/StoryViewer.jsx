import { useEffect, useRef, useState } from "react";

export default function StoryViewer({ items = [], startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);
  const videoRef = useRef(null);

  const current = items[index] || null;
  const total = items.length;

  const next = () => setIndex((i) => (i + 1 < total ? i + 1 : 0));
  const prev = () => setIndex((i) => (i - 1 >= 0 ? i - 1 : total - 1));

  useEffect(() => {
    if (!current) return;
    let t;
    if (current.mediaType === "text" || current.mediaType === "image") {
      t = setTimeout(next, 5000);
    }
    return () => clearTimeout(t);
  }, [current?.mediaType, index]);

  useEffect(() => {
    if (current?.mediaType === "video" && videoRef.current) {
      const v = videoRef.current;
      const onLoaded = () => {
        const duration = (v.duration || 5) * 1000;
        setTimeout(next, duration);
      };
      v.addEventListener("loadedmetadata", onLoaded, { once: true });
      return () => v.removeEventListener("loadedmetadata", onLoaded);
    }
  }, [current?.mediaType, current?.mediaUrl, index]);

  if (!current) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <img src={current.user?.profilePicture || "https://via.placeholder.com/32"} alt="u" className="w-8 h-8 rounded-full object-cover" />
          <div className="text-sm font-medium">{current.user?.username || "User"}</div>
        </div>
        <button onClick={onClose} className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded">Close</button>
      </div>

      {/* Media */}
      <div className="w-full max-w-md h-[80vh] flex items-center justify-center">
        {current.mediaType === "image" && (
          <img src={current.mediaUrl} alt="story" className="max-h-full max-w-full object-contain" />
        )}
        {current.mediaType === "video" && (
          <video ref={videoRef} src={current.mediaUrl} controls className="max-h-full max-w-full bg-black" />
        )}
        {current.mediaType === "text" && (
          <div className="w-full h-full flex items-center justify-center rounded-xl" style={{ backgroundColor: current.bgColor || "#000" }}>
            <div className="px-6 text-white text-center whitespace-pre-wrap font-semibold text-lg">{current.text}</div>
          </div>
        )}
      </div>

      {/* Controls */}
      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-2xl">‹</button>
      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-2xl">›</button>
    </div>
  );
}
