
import { Navigate } from "react-router-dom";
import { userAuth } from "../../context/AuthContext.jsx";
import getToken from "../../utils/getToken.js";

function PublicRoute({ children }) {
  const { token, loading } = userAuth() || {};
  if (loading) return null; // or a loader
  const hasToken = token || getToken();
  if (hasToken) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default PublicRoute;
