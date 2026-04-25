import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("eyeai_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [backendStatus, setBackendStatus] = useState("checking"); // checking | ready | warming | offline

  // Poll backend health
  const checkBackend = useCallback(async () => {
    try {
      const res = await axios.get("/api/health", { timeout: 4000 });
      setBackendStatus(res.data?.model_loaded === false ? "warming" : "ready");
    } catch {
      setBackendStatus("offline");
    }
  }, []);

  useEffect(() => {
    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => clearInterval(interval);
  }, [checkBackend]);

  const login = (data) => {
    const userData = {
      name: data.name,
      email: data.email,
      occupation: data.occupation,
      avatar: data.name.slice(0, 2).toUpperCase(),
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem("eyeai_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("eyeai_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, backendStatus, checkBackend }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
