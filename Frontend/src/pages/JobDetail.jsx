import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

export default function JobDetail() {
  const { id }  = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [job,    setJob]    = useState(null);
  const [cover,  setCover]  = useState("");
  const [msg,    setMsg]    = useState("");
  const [error,  setError]  = useState("");
  const [busy,   setBusy]   = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await API.get(`/jobs/${id}`);
        setJob(res.data);
      } catch {
        setError("Job nahi mili");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleApply() {
    if (!user) {
      navigate("/login");
      return;
    }
    setBusy(true);
    setError("");
    setMsg("");
    try {
      await API.post("/applications/apply", { job_id: id, cover_letter: cover });
      setMsg("✅ Apply ho gaya! Dashboard pe status check karo.");
    } catch (err) {
      setError(err.response?.data?.error || "Apply karne mein error");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="loading">Loading job details...</div>;
  if (!job)    return <div className="error-page">{error}</div>;

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div>
          <h1>{job.title}</h1>
          <span className="company-big">🏢 {job.company}</span>
        </div>
        <div className="detail-meta-right">
          <span className="badge">{job.type}</span>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-main">
          <div className="detail-meta-row">
            <span>📍 {job.location}</span>
            <span>💰 {job.salary}</span>
            <span>👥 {job.vacancies} Vacancies</span>
            {job.deadline && <span>⏰ Deadline: {job.deadline}</span>}
          </div>

          <h3>Job Description</h3>
          <p className="description">{job.description}</p>

          {job.skills?.length > 0 && (
            <>
              <h3>Required Skills</h3>
              <div className="skills-row">
                {job.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
              </div>
            </>
          )}
        </div>

        <div className="apply-box">
          <h3>Apply for this Job</h3>

          {msg   && <div className="alert success">{msg}</div>}
          {error && <div className="alert error">{error}</div>}

          {!msg && (
            <>
              <textarea
                placeholder="Cover letter likhna chahte ho? (optional)"
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                rows={5}
              />
              <button
                className="btn-primary full"
                onClick={handleApply}
                disabled={busy}
              >
                {busy ? "Applying..." : user ? "Apply Now 🚀" : "Login to Apply"}
              </button>
            </>
          )}

          <div className="job-quick-info">
            <div><strong>Company</strong><span>{job.company}</span></div>
            <div><strong>Type</strong><span>{job.type}</span></div>
            <div><strong>Location</strong><span>{job.location}</span></div>
            <div><strong>Salary</strong><span>{job.salary}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
