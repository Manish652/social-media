import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import InputField from "../components/common/InputField.jsx";
import api from "../api/axios.js";
import { userAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = userAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const { data } = await api.post("/user/login", formData);
      if (data?.token) {
        login(data.user, data.token);
      }
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Login failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-8 w-96"
      >
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
        <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} />

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4"
          disabled={loading}
        >
          {loading ? "Logging In..." : "Login"}
        </button>

        <p className="text-center text-sm mt-3">
          Don’t have an account? <a href="/signup" className="text-blue-500">Sign Up</a>
        </p>
      </form>
    </div>
  );
}
