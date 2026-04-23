import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set axios default auth header
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("tutorly_token");
    const savedUser = localStorage.getItem("tutorly_user");

    if (token && savedUser) {
      setAuthHeader(token);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });
    const { token, user } = res.data;

    localStorage.setItem("tutorly_token", token);
    localStorage.setItem("tutorly_user", JSON.stringify(user));
    setAuthHeader(token);
    setUser(user);
    return user;
  };

  const register = async (name, email, password, role, subjects) => {
    const res = await axios.post("/api/auth/register", {
      name, email, password, role, subjects,
    });
    const { token, user } = res.data;

    localStorage.setItem("tutorly_token", token);
    localStorage.setItem("tutorly_user", JSON.stringify(user));
    setAuthHeader(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("tutorly_token");
    localStorage.removeItem("tutorly_user");
    setAuthHeader(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};