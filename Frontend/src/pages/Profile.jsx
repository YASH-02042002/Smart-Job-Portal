import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

export default function Profile() {
  const { user } = useAuth();
  const [file,  setFile]  = useState(null);
  const [msg,   setMsg]   = useState("");
  const [error, setError] = useState("");
  const [busy,  setBusy]  = useState(false);

  async function handleResumeUpload() {
    if (!file) {
      setError("Pehle PDF file select karo");
      return;
    }
    setBusy(true);
    setMsg("");
    setError("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await API.post("/applications/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="avatar">
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <h2>{user?.name}</h2>
        <span className="role-badge">{user?.role}</span>
        <p>📧 {user?.email}</p>
        {user?.phone && <p>📞 {user?.phone}</p>}
      </div>

      <div className="resume-card">
        <h3>📄 Resume Upload</h3>
        <p>Apna latest resume upload karo (PDF only)</p>

        {msg   && <div className="alert success">{msg}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="upload-area">
          <input
            type="file"
            accept=".pdf"
            id="resume-input"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <label htmlFor="resume-input" className="upload-label">
            {file ? `✅ ${file.name}` : "📁 PDF file choose karo"}
          </label>
        </div>

        <button
          className="btn-primary"
          onClick={handleResumeUpload}
          disabled={busy}
        >
          {busy ? "Uploading..." : "Upload Resume"}
        </button>
      </div>
    </div>
  );
}
