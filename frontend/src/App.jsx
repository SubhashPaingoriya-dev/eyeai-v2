import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Result from "./pages/Result";
import History from "./pages/History";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const location = useLocation();
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-surface-0 bg-grid">
      {user && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/result/:id" element={<ProtectedRoute><Result /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
      <Toaster position="top-right" toastOptions={{
        style: { background:"#1a2332", color:"#f0f6ff", border:"1px solid rgba(6,182,212,0.2)", borderRadius:"12px" },
        success: { iconTheme: { primary:"#10b981", secondary:"#070a0f" } },
        error: { iconTheme: { primary:"#f43f5e", secondary:"#070a0f" } },
      }} />
    </div>
  );
}
