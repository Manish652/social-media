import { Navigate, useLocation } from "react-router-dom";
import { userAuth } from "../../context/AuthContext.jsx";
import getToken from "../../utils/getToken.js";

export default function ProtectedRoute({ children }) {
  const { token } = userAuth() || {};
  const location = useLocation();
  const hasToken = token || getToken();

  if (!hasToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
