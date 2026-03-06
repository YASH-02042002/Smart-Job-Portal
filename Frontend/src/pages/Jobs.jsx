import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";

const TYPE_COLORS = {
  "Full-time":  "#22c55e",
  "Part-time":  "#f59e0b",
  "Remote":     "#6366f1",
  "Internship": "#ec4899",
  "Contract":   "#14b8a6",
};

export default function Jobs() {
  const [jobs,     setJobs]     = useState([]);
  const [search,   setSearch]   = useState("");
  const [location, setLocation] = useState("");
  const [type,     setType]     = useState("");
  const [loading,  setLoading]  = useState(true);

  async function fetchJobs() {
    setLoading(true);
    try {
      const params = {};
      if (search)   params.search   = search;
      if (location) params.location = location;
      if (type)     params.type     = type;
      const res = await API.get("/jobs/", { params });
      setJobs(res.data);
    } catch (err) {
      console.error("Jobs fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    fetchJobs();
  }

  return (
    <div className="jobs-page">
      <div className="hero">
        <h1>Apna Dream Job Dhundo 🎯</h1>
        <p>Thousands of jobs — filter karo, apply karo, track karo</p>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            placeholder="Job title, company, skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            placeholder="City / Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All Types</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Remote</option>
            <option>Internship</option>
            <option>Contract</option>
          </select>
          <button type="submit" className="btn-primary">Search</button>
        </form>
      </div>

      <div className="jobs-container">
        <h3>{loading ? "Loading..." : `${jobs.length} Jobs Available`}</h3>

        {loading ? (
          <div className="skeleton-list">
            {[1,2,3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <span>😔</span>
            <p>Koi job nahi mili. Search change karo.</p>
          </div>
        ) : (
          <div className="job-grid">
            {jobs.map(job => (
              <Link to={`/jobs/${job._id}`} key={job._id} className="job-card">
                <div className="job-card-top">
                  <div>
                    <h4>{job.title}</h4>
                    <span className="company">🏢 {job.company}</span>
                  </div>
                  <span
                    className="badge"
                    style={{ background: TYPE_COLORS[job.type] || "#6b7280" }}
                  >
                    {job.type}
                  </span>
                </div>

                <div className="job-meta">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary}</span>
                  <span>👥 {job.vacancies} vacancy</span>
                </div>

                {job.skills?.length > 0 && (
                  <div className="skills-row">
                    {job.skills.slice(0, 4).map((s, i) => (
                      <span key={i} className="skill-tag">{s}</span>
                    ))}
                  </div>
                )}

                <div className="job-footer">
                  <span className="date">🗓 {new Date(job.created_at).toLocaleDateString("en-IN")}</span>
                  <span className="view-btn">View Details →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
