import { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const normalizeIds = (arr) => {
    if (!Array.isArray(arr)) return [];
    const seen = new Set();
    const out = [];
    for (const v of arr) {
      const s = String(v);
      if (!seen.has(s)) { seen.add(s); out.push(s); }
    }
    return out;
  };
  const normalizeUserData = (u) => {
    if (!u) return u;
    return {
      ...u,
      followers: normalizeIds(u.followers),
      following: normalizeIds(u.following),
    };
  };
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");
      if (savedToken) setToken(savedToken);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const normalized = normalizeUserData(parsed);
        setUser(normalized);
        try { localStorage.setItem("user", JSON.stringify(normalized)); } catch {}
      }
    } catch (err) {
      console.error("Failed to load auth data:", err);
    }
    setLoading(false);
  }, []);

  const login = (userData, userToken) => {
    const normalized = normalizeUserData(userData);
    setUser(normalized);
    setToken(userToken);
    localStorage.setItem("token", userToken);
    localStorage.setItem("user", JSON.stringify(normalized));

  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const updateFollowing = (targetUserId, action) => {
    setUser((prev) => {
      if (!prev?._id) return prev;
      const tid = String(targetUserId);
      let following = Array.isArray(prev.following) ? prev.following.map(String) : [];
      if (action === "follow") {
        if (!following.includes(tid)) following.push(tid);
      } else if (action === "unfollow") {
        following = following.filter((id) => id !== tid);
      }
      const next = { ...prev, following };
      try {
        localStorage.setItem("user", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, loading, updateFollowing }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const userAuth = () => useContext(AuthContext);
