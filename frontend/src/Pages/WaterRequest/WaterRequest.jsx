import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./WaterRequest.css";

const PROBLEM_TYPES = [
  "No water supply",
  "Low water pressure",
  "Contaminated water",
  "Pipe leakage",
  "New connection request",
];

export default function WaterRequest() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    full_name: user.name || "",
    village_name: "",
    ward_number: "",
    contact_number: "",
    problem_type: "",
    description: "",
    days_existing: "",
    households_affected: "",
    landmark: "",
    priority: "Medium",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // My Requests list
  const [myRequests, setMyRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.problem_type) { setError("Please select a problem type."); return; }
    setLoading(true); setError(""); setSuccess("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("user_id", user.id);
    if (photo) fd.append("photo", photo);

    try {
      const res = await fetch("http://localhost:5000/api/water", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setSuccess("✅ Your water request has been submitted successfully! The authorities will review it shortly.");
        setForm({ full_name: user.name || "", village_name: "", ward_number: "", contact_number: "", problem_type: "", description: "", days_existing: "", households_affected: "", landmark: "", priority: "Medium" });
        setPhoto(null); setPhotoPreview(null);
      } else {
        setError(data.message || "Submission failed.");
      }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const loadMyRequests = async () => {
    if (showRequests) { setShowRequests(false); return; }
    const res = await fetch(`http://localhost:5000/api/water?userId=${user.id}`);
    const data = await res.json();
    setMyRequests(data);
    setShowRequests(true);
  };

  const statusColor = { Pending: "#f59e0b", "In Progress": "#3b82f6", Resolved: "#16a34a", Rejected: "#dc2626" };
  const priorityColor = { Low: "#64748b", Medium: "#f59e0b", Urgent: "#dc2626" };

  return (
    <div className="wr-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="brand">Village Funds</h2>
        <nav className="sidebar-nav-main">
          <a onClick={() => navigate("/dashboard")}>🏠 Dashboard</a>
          <a onClick={() => navigate("/pds-system")}>🌾 PDS System</a>
          <a className="active" onClick={() => navigate("/water-request")}>💧 Water Request</a>
          <a onClick={() => navigate("/electricity-request")}>⚡ Electricity Request</a>
          <a onClick={() => navigate("/house-request")}>🏡 House Request</a>
          <a onClick={() => navigate("/issues")}>⚠️ Issues</a>
          <a onClick={() => navigate("/donations")}>❤️ Donations</a>
          <a onClick={() => navigate("/reports")}>📊 Reports</a>
        </nav>
        <div className="sidebar-divider" />
        <nav className="sidebar-nav-secondary">
          <a onClick={() => navigate("/dashboard")}>Home</a>
          <a onClick={() => navigate("/about")}>About</a>
          <a onClick={() => navigate("/contact")}>Contact</a>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="wr-main">
        {/* PAGE HEADER */}
        <div className="wr-page-header">
          <div>
            <h1>💧 Water Request</h1>
            <p>Submit a water-related complaint or request for your area</p>
          </div>
          <button className="wr-history-btn" onClick={loadMyRequests}>
            {showRequests ? "Hide My Requests" : "📋 My Requests"}
          </button>
        </div>

        {/* MY REQUESTS */}
        {showRequests && (
          <div className="wr-history">
            <h3>My Previous Requests</h3>
            {myRequests.length === 0 ? (
              <p className="wr-empty">No requests submitted yet.</p>
            ) : (
              <div className="wr-history-list">
                {myRequests.map((r) => (
                  <div className="wr-hist-card" key={r.id}>
                    <div className="wr-hist-top">
                      <span className="wr-hist-type">{r.problem_type}</span>
                      <span className="wr-hist-status" style={{ background: statusColor[r.status] + "22", color: statusColor[r.status] }}>
                        {r.status}
                      </span>
                    </div>
                    <p className="wr-hist-desc">{r.description.slice(0, 100)}{r.description.length > 100 ? "…" : ""}</p>
                    <div className="wr-hist-meta">
                      <span style={{ color: priorityColor[r.priority] }}>⚡ {r.priority} Priority</span>
                      <span>📅 {new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FORM */}
        <form className="wr-form" onSubmit={handleSubmit}>
          {success && <div className="wr-success">{success}</div>}
          {error   && <div className="wr-error">{error}</div>}

          {/* ── SECTION 1: Basic Details ── */}
          <div className="wr-section">
            <div className="wr-section-title">
              <span className="wr-section-icon">👤</span>
              Basic Details
            </div>
            <div className="wr-grid-2">
              <div className="wr-field">
                <label>Full Name</label>
                <input type="text" value={form.full_name} onChange={set("full_name")} required readOnly className="readonly" />
              </div>
              <div className="wr-field">
                <label>Village Name</label>
                <input type="text" placeholder="Enter your village name" value={form.village_name} onChange={set("village_name")} required />
              </div>
              <div className="wr-field">
                <label>Ward Number / Area</label>
                <input type="text" placeholder="e.g. Ward 5, Peddapalli Area" value={form.ward_number} onChange={set("ward_number")} />
              </div>
              <div className="wr-field">
                <label>Contact Number</label>
                <input type="tel" placeholder="10-digit mobile number" maxLength="10" value={form.contact_number} onChange={set("contact_number")} required />
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Request Details ── */}
          <div className="wr-section">
            <div className="wr-section-title">
              <span className="wr-section-icon">🔍</span>
              Request Details
            </div>

            {/* Problem Type Cards */}
            <label className="wr-label">Type of Water Problem <span className="req">*</span></label>
            <div className="wr-problem-grid">
              {PROBLEM_TYPES.map((pt) => (
                <div
                  key={pt}
                  className={`wr-problem-card ${form.problem_type === pt ? "selected" : ""}`}
                  onClick={() => setForm({ ...form, problem_type: pt })}
                >
                  <span className="wr-problem-icon">
                    {pt === "No water supply" && "🚫💧"}
                    {pt === "Low water pressure" && "📉💧"}
                    {pt === "Contaminated water" && "☣️💧"}
                    {pt === "Pipe leakage" && "🔧💧"}
                    {pt === "New connection request" && "🆕🔌"}
                  </span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <div className="wr-field" style={{ marginTop: "16px" }}>
              <label>Describe the Problem <span className="req">*</span></label>
              <textarea rows="4" placeholder="Explain the problem in detail — when it started, how it affects daily life, what was tried before..." value={form.description} onChange={set("description")} required />
            </div>

            <div className="wr-grid-2" style={{ marginTop: "12px" }}>
              <div className="wr-field">
                <label>How many days has this problem existed?</label>
                <input type="number" min="0" placeholder="e.g. 7" value={form.days_existing} onChange={set("days_existing")} />
              </div>
              <div className="wr-field">
                <label>How many households are affected?</label>
                <input type="number" min="0" placeholder="e.g. 25" value={form.households_affected} onChange={set("households_affected")} />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Supporting Info ── */}
          <div className="wr-section">
            <div className="wr-section-title">
              <span className="wr-section-icon">📎</span>
              Supporting Information
            </div>

            <div className="wr-field">
              <label>Upload a Photo <span className="optional">(optional)</span></label>
              <div className="wr-upload-box" onClick={() => document.getElementById("wr-photo-input").click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="wr-photo-preview" />
                ) : (
                  <>
                    <div className="wr-upload-icon">📷</div>
                    <p>Click to upload a photo of the issue</p>
                    <span>Max 5MB · JPG, PNG, PDF</span>
                  </>
                )}
              </div>
              <input id="wr-photo-input" type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handlePhoto} />
              {photo && <p className="wr-file-name">📎 {photo.name}</p>}
            </div>

            <div className="wr-field" style={{ marginTop: "12px" }}>
              <label>Location / Landmark Description <span className="optional">(optional)</span></label>
              <input type="text" placeholder="e.g. Near the old panchayat office, main road" value={form.landmark} onChange={set("landmark")} />
            </div>
          </div>

          {/* ── SECTION 4: Priority ── */}
          <div className="wr-section">
            <div className="wr-section-title">
              <span className="wr-section-icon">🚨</span>
              Priority Level
            </div>
            <div className="wr-priority-group">
              {["Low", "Medium", "Urgent"].map((p) => (
                <label key={p} className={`wr-priority-card ${form.priority === p ? "selected-" + p.toLowerCase() : ""}`}>
                  <input type="radio" name="priority" value={p} checked={form.priority === p} onChange={set("priority")} />
                  <span className="wr-priority-icon">
                    {p === "Low" && "🟢"}
                    {p === "Medium" && "🟡"}
                    {p === "Urgent" && "🔴"}
                  </span>
                  <span className="wr-priority-label">{p}</span>
                  <span className="wr-priority-desc">
                    {p === "Low" && "Can wait a few days"}
                    {p === "Medium" && "Needs attention soon"}
                    {p === "Urgent" && "Immediate action needed"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="wr-submit" disabled={loading}>
            {loading ? "Submitting…" : "💧 Submit Water Request"}
          </button>
        </form>
      </main>
    </div>
  );
}
