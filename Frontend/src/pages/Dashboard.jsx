import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

const STATUS_CONFIG = {
  "Applied":    { color: "#6366f1", icon: "📨", label: "Applied" },
  "Reviewing":  { color: "#f59e0b", icon: "🔍", label: "Under Review" },
  "Interview":  { color: "#3b82f6", icon: "🤝", label: "Interview" },
  "Selected":   { color: "#22c55e", icon: "🎉", label: "Selected!" },
  "Rejected":   { color: "#ef4444", icon: "❌", label: "Rejected" },
};

export default function Dashboard() {
  const { user }   = useAuth();
  const [apps,     setApps]    = useState([]);
  const [loading,  setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await API.get("/applications/my");
        setApps(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const counts = {
    total:     apps.length,
    selected:  apps.filter(a => a.status === "Selected").length,
    interview: apps.filter(a => a.status === "Interview").length,
    rejected:  apps.filter(a => a.status === "Rejected").length,
  };

  return (
    <div className="dashboard">
      <div className="dash-header">
        <h2>Welcome back, {user?.name} 👋</h2>
        <p>Tumhare sab job applications ka status yahan dekhte hain</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card blue">
          <span className="stat-num">{counts.total}</span>
          <span>Total Applied</span>
        </div>
        <div className="stat-card yellow">
          <span className="stat-num">{counts.interview}</span>
          <span>Interviews</span>
        </div>
        <div className="stat-card green">
          <span className="stat-num">{counts.selected}</span>
          <span>Selected</span>
        </div>
        <div className="stat-card red">
          <span className="stat-num">{counts.rejected}</span>
          <span>Rejected</span>
        </div>
      </div>

      <div className="section">
        <h3>My Applications</h3>

        {loading ? (
          <p>Loading...</p>
        ) : apps.length === 0 ? (
          <div className="empty-state">
            <span>📭</span>
            <p>Abhi koi application nahi hai.</p>
            <Link to="/" className="btn-primary">Jobs Dekho</Link>
          </div>
        ) : (
          <div className="app-list">
            {apps.map(app => {
              const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG["Applied"];
              return (
                <div key={app._id} className="app-row">
                  <div className="app-info">
                    <h4>{app.job_title}</h4>
                    <span>🏢 {app.company}</span>
                    <span className="date">Applied: {new Date(app.applied_at).toLocaleDateString("en-IN")}</span>
                  </div>

                  <div className="status-tracker">
                    {Object.keys(STATUS_CONFIG).map((step, i) => {
                      const stepCfg = STATUS_CONFIG[step];
                      const isActive  = app.status === step;
                      const isDone    = Object.keys(STATUS_CONFIG).indexOf(app.status) > i;
                      return (
                        <div key={step} className={`tracker-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                          <div className="tracker-dot" style={{ background: isActive ? cfg.color : isDone ? "#22c55e" : "#d1d5db" }}>
                            {isActive || isDone ? stepCfg.icon : ""}
                          </div>
                          <span>{stepCfg.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="status-badge" style={{ background: cfg.color }}>
                    {cfg.icon} {app.status}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
