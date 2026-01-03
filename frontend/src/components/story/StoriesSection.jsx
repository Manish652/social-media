import { Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios.js";
import { userAuth } from "../../context/AuthContext.jsx";
import CreateStoryModal from "./CreateStoryModal.jsx";
import StoryCircle from "./StoryCircle.jsx";
import StoryViewer from "./StoryViewer.jsx";

export default function StoriesSection({ showCreateButton = true }) {
  const { user } = userAuth();
  const [stories, setStories] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerItems, setViewerItems] = useState([]);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/story/all");
      setStories(Array.isArray(data?.stories) ? data.stories : []);
    } catch (e) {
      console.error("Failed to fetch stories:", e);
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (userId) => {
    const items = stories.filter((s) => String(s?.user?._id || s?.user) === String(userId));
    setViewerItems(items);
    setViewerOpen(true);
  };

  const groupedStories = useMemo(() => {
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
          isCurrentUser: String(uid) === String(user?._id),
        });
      }
    }
    // Sort to show current user's story first
    const allUsers = Array.from(byUser.values());
    return allUsers.sort((a, b) => {
      if (a.isCurrentUser) return -1;
      if (b.isCurrentUser) return 1;
      return 0;
    });
  }, [stories, user?._id]);

  return (
    <>
      <div className="bg-white border-b border-gray-200/50 sticky top-[60px] z-30">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Stories
          </h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {/* Create Story Button */}
            {showCreateButton && (
              <button
                onClick={() => setCreateStoryOpen(true)}
                className="flex flex-col items-center cursor-pointer flex-shrink-0"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
                    <Plus size={28} className="text-white" />
                  </div>
                </div>
                <p className="text-xs mt-1 text-gray-700 truncate w-16 text-center font-medium">
                  Create
                </p>
              </button>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-gray-200 animate-pulse" />
                    <div className="w-12 h-3 bg-gray-200 rounded mt-1 animate-pulse" />
                  </div>
                ))}
              </div>
            )}

            {/* User Stories */}
            {!loading &&
              groupedStories.map((u) => (
                <StoryCircle
                  key={u.id}
                  story={u}
                  onClick={() => handleStoryClick(u.id)}
                />
              ))}

            {/* Empty State */}
            {!loading && stories.length === 0 && (
              <div className="flex items-center justify-center w-full py-4 text-gray-400 text-sm">
                No stories available. {showCreateButton ? "Create your first story!" : "Follow people to see their stories!"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Story Viewer */}
      {viewerOpen && (
        <StoryViewer
          items={viewerItems}
          startIndex={0}
          onClose={() => setViewerOpen(false)}
        />
      )}

      {/* Create Story Modal */}
      {showCreateButton && (
        <CreateStoryModal
          isOpen={createStoryOpen}
          onClose={() => setCreateStoryOpen(false)}
          onSuccess={fetchStories}
        />
      )}
    </>
  );
}
