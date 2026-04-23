import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🎓</span>
          <span className="logo-text">SL_Hub</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="nav-link">Browse</Link>
          {user && <Link to="/ask" className="nav-link">Ask</Link>}
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to={`/profile/${user.id}`} className="nav-user">
                <div className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                <div className="nav-user-info">
                  <span className="nav-user-name">{user.name}</span>
                  <span className="nav-user-role">{user.role} · ⭐ {user.reputation || 0}</span>
                </div>
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
