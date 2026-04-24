import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import VerifyBanner from "./components/VerifyBanner";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AskQuestion from "./pages/AskQuestion";
import QuestionDetail from "./pages/QuestionDetail";
import Profile from "./pages/Profile";
import VerifyEmail from "./pages/VerifyEmail";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page-loading">Loading...</div>;
  return user ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <VerifyBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/ask" element={<ProtectedRoute><AskQuestion /></ProtectedRoute>} />
        <Route path="/questions/:id" element={<QuestionDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="*" element={
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: "3rem" }}>🔍</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", marginTop: 12 }}>Page not found</h2>
            <a href="/" style={{ color: "var(--accent)", marginTop: 8, display: "inline-block" }}>Go home →</a>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
