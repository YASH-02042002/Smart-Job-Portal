import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        💼 JobPortal
      </Link>

      <div className="nav-links">
        <Link to="/">Jobs</Link>

        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
            {isAdmin && <Link to="/admin" className="admin-link">Admin Panel</Link>}
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
            <span className="nav-user">👋 {user.name}</span>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn-register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
