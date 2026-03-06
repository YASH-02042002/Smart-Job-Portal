import { useState, useEffect } from "react";
import API from "../utils/api";

const STATUSES = ["Applied", "Reviewing", "Interview", "Selected", "Rejected"];

const STATUS_COLORS = {
  Applied:   "#6366f1",
  Reviewing: "#f59e0b",
  Interview: "#3b82f6",
  Selected:  "#22c55e",
  Rejected:  "#ef4444",
};

export default function AdminPanel() {
  const [tab,    setTab]    = useState("stats");
  const [stats,  setStats]  = useState(null);
  const [apps,   setApps]   = useState([]);
  const [jobs,   setJobs]   = useState([]);
  const [loading, setLoading] = useState(false);

  // New job form
  const [jobForm, setJobForm] = useState({
    title: "", company: "", location: "", description: "",
    salary: "", type: "Full-time", skills: "", vacancies: 1, deadline: ""
  });
  const [jobMsg, setJobMsg] = useState("");

  useEffect(() => {
    if (tab === "stats")   fetchStats();
    if (tab === "apps")    fetchApps();
    if (tab === "jobs")    fetchJobs();
    if (tab === "addjob")  setJobMsg("");
  }, [tab]);

  async function fetchStats() {
    setLoading(true);
    try {
      const res = await API.get("/admin/stats");
      setStats(res.data);
    } finally { setLoading(false); }
  }

  async function fetchApps() {
    setLoading(true);
    try {
      const res = await API.get("/admin/applications");
      setApps(res.data);
    } finally { setLoading(false); }
  }

  async function fetchJobs() {
    setLoading(true);
    try {
      const res = await API.get("/jobs/");
      setJobs(res.data);
    } finally { setLoading(false); }
  }

  async function updateStatus(appId, status) {
    try {
      await API.put(`/applications/${appId}/status`, { status });
      setApps(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  }

  async function deleteJob(jobId) {
    if (!window.confirm("Job delete karna chahte ho?")) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      setJobs(prev => prev.filter(j => j._id !== jobId));
    } catch (err) {
      alert("Delete failed");
    }
  }

  async function handleAddJob(e) {
    e.preventDefault();
    try {
      const payload = {
        ...jobForm,
        skills:    jobForm.skills.split(",").map(s => s.trim()).filter(Boolean),
        vacancies: parseInt(jobForm.vacancies),
      };
      await API.post("/jobs/", payload);
      setJobMsg("✅ Job post ho gayi!");
      setJobForm({ title: "", company: "", location: "", description: "", salary: "", type: "Full-time", skills: "", vacancies: 1, deadline: "" });
    } catch (err) {
      setJobMsg("❌ " + (err.response?.data?.error || "Error"));
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>⚙️ Admin Panel</h2>
      </div>

      <div className="admin-tabs">
        {["stats", "apps", "jobs", "addjob"].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {{ stats: "📊 Stats", apps: "📋 Applications", jobs: "💼 Jobs", addjob: "➕ Add Job" }[t]}
          </button>
        ))}
      </div>

      {/* STATS */}
      {tab === "stats" && (
        <div className="stats-grid">
          {loading ? <p>Loading...</p> : stats && Object.entries({
            "Total Users":    stats.total_users,
            "Total Jobs":     stats.total_jobs,
            "Total Applied":  stats.total_apps,
            "Reviewing":      stats.reviewing,
            "Interview":      stats.interview,
            "Selected":       stats.selected,
            "Rejected":       stats.rejected,
          }).map(([key, val]) => (
            <div key={key} className="admin-stat-card">
              <span className="stat-num">{val}</span>
              <span>{key}</span>
            </div>
          ))}
        </div>
      )}

      {/* APPLICATIONS */}
      {tab === "apps" && (
        <div className="admin-table-wrap">
          {loading ? <p>Loading...</p> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Job</th>
                  <th>Company</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app._id}>
                    <td>
                      <strong>{app.user_info?.name || "—"}</strong>
                      <br /><small>{app.user_info?.email}</small>
                    </td>
                    <td>{app.job_title}</td>
                    <td>{app.company}</td>
                    <td>{new Date(app.applied_at).toLocaleDateString("en-IN")}</td>
                    <td>
                      <span className="status-pill" style={{ background: STATUS_COLORS[app.status] }}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app._id, e.target.value)}
                        className="status-select"
                      >
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* JOBS LIST */}
      {tab === "jobs" && (
        <div className="admin-table-wrap">
          {loading ? <p>Loading...</p> : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th><th>Company</th><th>Location</th><th>Type</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.company}</td>
                    <td>{job.location}</td>
                    <td>{job.type}</td>
                    <td>
                      <button className="btn-delete" onClick={() => deleteJob(job._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ADD JOB */}
      {tab === "addjob" && (
        <div className="add-job-form">
          <h3>New Job Post Karo</h3>
          {jobMsg && <div className={`alert ${jobMsg.startsWith("✅") ? "success" : "error"}`}>{jobMsg}</div>}

          <form onSubmit={handleAddJob}>
            <div className="form-row">
              <div className="form-group">
                <label>Job Title *</label>
                <input value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Company *</label>
                <input value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Location *</label>
                <input value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Salary</label>
                <input placeholder="e.g. ₹5-8 LPA" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <select value={jobForm.type} onChange={e => setJobForm({...jobForm, type: e.target.value})}>
                  {["Full-time","Part-time","Remote","Internship","Contract"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Vacancies</label>
                <input type="number" min="1" value={jobForm.vacancies} onChange={e => setJobForm({...jobForm, vacancies: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={jobForm.deadline} onChange={e => setJobForm({...jobForm, deadline: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label>Skills (comma separated)</label>
              <input placeholder="React, Python, MongoDB" value={jobForm.skills} onChange={e => setJobForm({...jobForm, skills: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea rows={5} value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} required />
            </div>
            <button type="submit" className="btn-primary">Post Job 🚀</button>
          </form>
        </div>
      )}
    </div>
  );
}
