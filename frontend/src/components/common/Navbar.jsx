import React, { useEffect, useState, useCallback } from "react";
import { Bell, LogOut } from "lucide-react";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { userAuth } from "../../context/AuthContext.jsx";

export function Navbar({ onNotificationClick }) {
  const { user, token, logout } = userAuth();
  const isAuthed = Boolean(token);
  const avatar = user?.profilePicture || "https://via.placeholder.com/32";
  const profileLink = user?._id ? `/profile/${user._id}` : "/login";

  // Notifications (backend)
  const [openNotif, setOpenNotif] = useState(false);
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotif(true);
      const { data } = await api.get("/notification");
      const list = Array.isArray(data?.notifications) ? data.notifications : [];
      setNotifications(list);
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoadingNotif(false);
    }
  }, []);

  const removeNotification = async (id) => {
    try {
      await api.delete(`/notification/${id}`);
      await fetchNotifications();
    } catch {}
  };

  const clearAll = async () => {
    try {
      await Promise.all((notifications || []).map((n) => api.delete(`/notification/${n._id}`)));
      await fetchNotifications();
    } catch {}
  };

  const markAllRead = async () => {
    try {
      const unread = (notifications || []).filter((n) => !n.read);
      await Promise.all(unread.map((n) => api.put(`/notification/${n._id}/read`)));
      await fetchNotifications();
    } catch {}
  };

  useEffect(() => {
    if (!token) return;
    fetchNotifications();
  }, [token, fetchNotifications]);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      if (!openNotif) fetchNotifications();
    }, 30000);
    return () => clearInterval(id);
  }, [token, openNotif, fetchNotifications]);

  useEffect(() => {
    if (openNotif) {
      markAllRead();
    }
  }, [openNotif]);

  const hasAny = (notifications || []).length > 0;
  const hasUnread = (notifications || []).some((n) => !n.read);

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-gray-200/60 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent hover:scale-105 transition-transform"
        >
          Vibe
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-2xl px-4 py-2.5 w-full max-w-md border border-gray-200/50 focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-100 transition-all">
          <FaSearch className="text-gray-400 mr-3 flex-shrink-0" size={16} />
          <input
            type="text"
            placeholder="Search for people, posts, or tags..."
            className="bg-transparent outline-none w-full text-sm placeholder:text-gray-400"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setOpenNotif((v) => !v)}
              className="relative p-2.5 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 rounded-full transition-all hover:scale-105 active:scale-95 group"
            >
              <Bell size={22} className="text-gray-700 group-hover:text-purple-600 transition-colors" />
              {hasUnread && (
                <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full animate-pulse shadow-lg" />
              )}
            </button>

            {openNotif && (
              <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto bg-white border border-gray-200 rounded-xl shadow-xl z-50">
                <div className="flex items-center justify-between px-4 py-2 border-b">
                  <span className="text-sm font-semibold">Notifications</span>
                  {hasAny && (
                    <div className="flex items-center gap-3">
                      <button onClick={clearAll} className="text-xs text-red-600 hover:underline">Clear all</button>
                    </div>
                  )}
                </div>
                <div className="divide-y">
                  {loadingNotif ? (
                    <div className="p-4 text-sm text-gray-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No notifications</div>
                  ) : (
                    notifications.map((n) => {
                      const from = n?.fromUser?.username || "Someone";
                      const kind = n?.type;
                      const msg = kind === "follow"
                        ? `${from} started following you`
                        : kind === "like"
                        ? `${from} liked your post`
                        : kind === "comment"
                        ? `${from} commented on your post`
                        : kind === "post"
                        ? `${from} posted new content`
                        : `${from} has an update`;
                      return (
                        <div key={n._id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
                          <img src={n?.fromUser?.profilePicture || "https://via.placeholder.com/32"} alt="from" className="w-7 h-7 rounded-full object-cover border" />
                          <div className="flex-1">
                            <div className="text-sm text-gray-800">{msg}</div>
                            <div className="text-[11px] text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                          <button onClick={() => removeNotification(n._id)} className="text-xs text-gray-500 hover:text-red-600">Remove</button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {isAuthed ? (
            <>
              {/* Profile Picture */}
              <Link 
                to={profileLink}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity" />
                <img
                  src={avatar}
                  alt="profile"
                  className="relative w-9 h-9 rounded-full border-2 border-white shadow-md hover:scale-105 transition-transform object-cover"
                />
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <LogOut size={16} />
                <span className="text-sm">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-2xl px-4 py-2.5 border border-gray-200/50 focus-within:border-purple-300 focus-within:ring-4 focus-within:ring-purple-100 transition-all">
          <FaSearch className="text-gray-400 mr-3 flex-shrink-0" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none w-full text-sm placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}

export default Navbar;