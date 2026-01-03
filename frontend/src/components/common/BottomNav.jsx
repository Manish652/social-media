import { Film, Home, Plus, Search, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { userAuth } from "../../context/AuthContext.jsx";

export default function BottomTab() {
  const { pathname } = useLocation();
  const { user } = userAuth();

  const Item = ({ to, active, children, isCreate }) => (
    <Link
      to={to}
      className={`relative flex flex-col items-center justify-center flex-1 py-2 transition-all duration-300 ${isCreate ? "" : active ? "text-black" : "text-gray-400 hover:text-gray-600"
        }`}
    >
      {/* Active indicator line */}
      {active && !isCreate && (
        <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full" />
      )}

      {/* Icon with scale animation */}
      <div className={`transition-all duration-300 ${active && !isCreate ? "scale-110" : "scale-100 hover:scale-105"}`}>
        {children}
      </div>

      {/* Active dot indicator */}
      {active && !isCreate && (
        <div className="w-1 h-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 mt-1" />
      )}
    </Link>
  );

  const profileHref = "/profile";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/50 bg-white/95 backdrop-blur-xl shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      <div className="max-w-2xl mx-auto h-16 px-4 flex items-center justify-around">
        <Item to="/" active={pathname === "/"}>
          <Home size={24} strokeWidth={pathname === "/" ? 2.5 : 2} />
        </Item>

        <Item to="/search" active={pathname.startsWith("/search")}>
          <Search size={24} strokeWidth={pathname.startsWith("/search") ? 2.5 : 2} />
        </Item>

        {/* Create Reel button with special styling */}
        <Link
          to="/create-reel"
          className="relative flex items-center justify-center w-12 h-12 -mt-6 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 blur opacity-50" />
          <Plus size={28} className="relative text-white" strokeWidth={2.5} />
        </Link>

        <Item to="/reels" active={pathname.startsWith("/reels")}>
          <Film size={24} strokeWidth={pathname.startsWith("/reels") ? 2.5 : 2} />
        </Item>

        {/* Create button with special styling */}


        <Item to={profileHref} active={pathname.startsWith("/profile")}>
          {pathname.startsWith("/profile") ? (
            <div className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center">
              <User size={16} strokeWidth={2.5} />
            </div>
          ) : (
            <User size={24} strokeWidth={2} />
          )}
        </Item>
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
}