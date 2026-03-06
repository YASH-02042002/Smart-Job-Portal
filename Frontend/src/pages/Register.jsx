import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

export default function Register() {
  const [form,  setForm]  = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy,  setBusy]  = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await API.post("/auth/register", { ...form, role: "seeker" });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Create Account 🚀</h2>
        <p className="auth-sub">Naya account banao aur job dhundo</p>

        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" placeholder="Rahul Sharma" value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="rahul@gmail.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Strong password" value={form.password} onChange={handleChange} required />
          </div>

          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Pehle se account hai? <Link to="/login">Login karo</Link>
        </p>
      </div>
    </div>
  );
}
