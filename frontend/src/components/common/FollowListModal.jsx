import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";

export default function FollowListModal({ isOpen, onClose, userId, type, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/user/profile/${userId}`);
        const userIds = type === "followers" ? data.followers : data.following;

        if (!Array.isArray(userIds) || userIds.length === 0) {
          setUsers([]);
          setLoading(false);
          return;
        }

        // Fetch user details for each ID
        const userPromises = userIds.map(id =>
          api.get(`/user/profile/${id}`).catch(() => null)
        );
        const responses = await Promise.all(userPromises);
        const fetchedUsers = responses
          .filter(res => res?.data)
          .map(res => res.data);

        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, userId, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {type === "followers" ? "Followers" : "Following"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <img
                src="/src/assets/animations/Spinner-3.gif"
                alt="Loading"
                className="w-16 h-16"
              />
              <p className="text-gray-500 text-sm mt-3">Loading...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-3">
                <span className="text-3xl">👥</span>
              </div>
              <p className="text-gray-500 font-medium">
                No {type === "followers" ? "followers" : "following"} yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((user) => (
                <Link
                  key={user._id}
                  to={`/u/${user._id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-6 py-4 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all"
                >
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-75"></div>
                    <img
                      src={user.profilePicture || "https://via.placeholder.com/48"}
                      alt={user.username}
                      className="relative w-12 h-12 rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {user.username}
                    </p>
                    {user.bio && (
                      <p className="text-sm text-gray-500 truncate">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  {String(user._id) === String(currentUserId) && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
                      You
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
