import { createContext, useContext, useState, useEffect } from "react";
import api from "./utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("tutorly_user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const { token, user } = res.data;
    localStorage.setItem("tutorly_token", token);
    localStorage.setItem("tutorly_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (name, email, password, role, subjects) => {
    const res = await api.post("/api/auth/register", { name, email, password, role, subjects });
    const { token, user } = res.data;
    localStorage.setItem("tutorly_token", token);
    localStorage.setItem("tutorly_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem("tutorly_token");
    localStorage.removeItem("tutorly_user");
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
