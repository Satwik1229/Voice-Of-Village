import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ElectricityRequest.css";

const PROBLEM_TYPES = [
  { label: "No power supply",          icon: "🚫⚡" },
  { label: "Frequent power cuts",       icon: "⚡🔁" },
  { label: "Transformer failure",       icon: "🔌💥" },
  { label: "Street light not working",  icon: "🏮❌" },
  { label: "Damaged electric pole/wire",icon: "⚡🪝" },
  { label: "New connection request",    icon: "🆕🔌" },
  { label: "Meter issue/complaint",     icon: "📟⚠️" },
];

export default function ElectricityRequest() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    full_name: user.name || "",
    village_name: "",
    ward_number: "",
    contact_number: "",
    consumer_number: "",
    problem_type: "",
    description: "",
    days_existing: "",
    households_affected: "",
    landmark: "",
    pole_number: "",
    priority: "Medium",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [myRequests, setMyRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) { setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); }
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
      const res = await fetch("http://localhost:5000/api/electricity", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setSuccess("✅ Your electricity request has been submitted successfully! Authorities will review it shortly.");
        setForm({ full_name: user.name || "", village_name: "", ward_number: "", contact_number: "", consumer_number: "", problem_type: "", description: "", days_existing: "", households_affected: "", landmark: "", pole_number: "", priority: "Medium" });
        setPhoto(null); setPhotoPreview(null);
      } else { setError(data.message || "Submission failed."); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const loadMyRequests = async () => {
    if (showRequests) { setShowRequests(false); return; }
    const res = await fetch(`http://localhost:5000/api/electricity?userId=${user.id}`);
    setMyRequests(await res.json());
    setShowRequests(true);
  };

  const statusColor = { Pending: "#f59e0b", "In Progress": "#3b82f6", Resolved: "#16a34a", Rejected: "#dc2626" };
  const priorityColor = { Low: "#64748b", Medium: "#f59e0b", Urgent: "#dc2626" };

  return (
    <div className="er-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="brand">Village Funds</h2>
        <nav className="sidebar-nav-main">
          <a onClick={() => navigate("/dashboard")}>🏠 Dashboard</a>
          <a onClick={() => navigate("/pds-system")}>🌾 PDS System</a>
          <a onClick={() => navigate("/water-request")}>💧 Water Request</a>
          <a className="active" onClick={() => navigate("/electricity-request")}>⚡ Electricity Request</a>
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
      <main className="er-main">
        {/* PAGE HEADER */}
        <div className="er-page-header">
          <div>
            <h1>⚡ Electricity Request</h1>
            <p>Submit an electricity-related complaint or request for your area</p>
          </div>
          <button className="er-history-btn" onClick={loadMyRequests}>
            {showRequests ? "Hide My Requests" : "📋 My Requests"}
          </button>
        </div>

        {/* MY REQUESTS HISTORY */}
        {showRequests && (
          <div className="er-history">
            <h3>My Previous Requests</h3>
            {myRequests.length === 0 ? (
              <p className="er-empty">No requests submitted yet.</p>
            ) : (
              <div className="er-history-list">
                {myRequests.map((r) => (
                  <div className="er-hist-card" key={r.id}>
                    <div className="er-hist-top">
                      <span className="er-hist-type">{r.problem_type}</span>
                      <span className="er-hist-status" style={{ background: statusColor[r.status] + "22", color: statusColor[r.status] }}>
                        {r.status}
                      </span>
                    </div>
                    <p className="er-hist-desc">{r.description.slice(0, 100)}{r.description.length > 100 ? "…" : ""}</p>
                    <div className="er-hist-meta">
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
        <form className="er-form" onSubmit={handleSubmit}>
          {success && <div className="er-success">{success}</div>}
          {error   && <div className="er-error">{error}</div>}

          {/* ── SECTION 1: Basic Details ── */}
          <div className="er-section">
            <div className="er-section-title"><span className="er-section-icon">👤</span>Basic Details</div>
            <div className="er-grid-2">
              <div className="er-field">
                <label>Full Name</label>
                <input type="text" value={form.full_name} readOnly className="readonly" />
              </div>
              <div className="er-field">
                <label>Village Name</label>
                <input type="text" placeholder="Enter your village name" value={form.village_name} onChange={set("village_name")} required />
              </div>
              <div className="er-field">
                <label>Ward Number / Area</label>
                <input type="text" placeholder="e.g. Ward 5, Main Colony" value={form.ward_number} onChange={set("ward_number")} />
              </div>
              <div className="er-field">
                <label>Contact Number</label>
                <input type="tel" placeholder="10-digit mobile number" maxLength="10" value={form.contact_number} onChange={set("contact_number")} required />
              </div>
              <div className="er-field er-span-2">
                <label>Consumer Number <span className="optional">(if existing connection)</span></label>
                <input type="text" placeholder="e.g. AP12345678" value={form.consumer_number} onChange={set("consumer_number")} />
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Request Details ── */}
          <div className="er-section">
            <div className="er-section-title"><span className="er-section-icon">🔍</span>Request Details</div>

            <label className="er-label">Type of Electricity Problem <span className="req">*</span></label>
            <div className="er-problem-grid">
              {PROBLEM_TYPES.map(({ label, icon }) => (
                <div
                  key={label}
                  className={`er-problem-card ${form.problem_type === label ? "selected" : ""}`}
                  onClick={() => setForm({ ...form, problem_type: label })}
                >
                  <span className="er-problem-icon">{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="er-field" style={{ marginTop: "16px" }}>
              <label>Describe the Problem <span className="req">*</span></label>
              <textarea rows="4" placeholder="Explain in detail — when it started, impact on households, any previous complaints raised..." value={form.description} onChange={set("description")} required />
            </div>

            <div className="er-grid-2" style={{ marginTop: "12px" }}>
              <div className="er-field">
                <label>How many days has this problem existed?</label>
                <input type="number" min="0" placeholder="e.g. 3" value={form.days_existing} onChange={set("days_existing")} />
              </div>
              <div className="er-field">
                <label>How many households are affected?</label>
                <input type="number" min="0" placeholder="e.g. 40" value={form.households_affected} onChange={set("households_affected")} />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Supporting Info ── */}
          <div className="er-section">
            <div className="er-section-title"><span className="er-section-icon">📎</span>Supporting Information</div>

            <div className="er-field">
              <label>Upload a Photo <span className="optional">(optional)</span></label>
              <div className="er-upload-box" onClick={() => document.getElementById("er-photo-input").click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="er-photo-preview" />
                ) : (
                  <>
                    <div className="er-upload-icon">📷</div>
                    <p>Click to upload a photo of the issue</p>
                    <span>Max 5MB · JPG, PNG, PDF</span>
                  </>
                )}
              </div>
              <input id="er-photo-input" type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handlePhoto} />
              {photo && <p className="er-file-name">📎 {photo.name}</p>}
            </div>

            <div className="er-grid-2" style={{ marginTop: "12px" }}>
              <div className="er-field">
                <label>Location / Landmark <span className="optional">(optional)</span></label>
                <input type="text" placeholder="e.g. Near the village temple, south side" value={form.landmark} onChange={set("landmark")} />
              </div>
              <div className="er-field">
                <label>Nearest Electric Pole Number <span className="optional">(if visible)</span></label>
                <input type="text" placeholder="e.g. EP/12/45" value={form.pole_number} onChange={set("pole_number")} />
              </div>
            </div>
          </div>

          {/* ── SECTION 4: Priority ── */}
          <div className="er-section">
            <div className="er-section-title"><span className="er-section-icon">🚨</span>Priority Level</div>
            <div className="er-priority-group">
              {["Low", "Medium", "Urgent"].map((p) => (
                <label key={p} className={`er-priority-card ${form.priority === p ? "selected-" + p.toLowerCase() : ""}`}>
                  <input type="radio" name="priority" value={p} checked={form.priority === p} onChange={set("priority")} />
                  <span className="er-priority-icon">
                    {p === "Low" && "🟢"}
                    {p === "Medium" && "🟡"}
                    {p === "Urgent" && "🔴"}
                  </span>
                  <span className="er-priority-label">{p}</span>
                  <span className="er-priority-desc">
                    {p === "Low" && "Can wait a few days"}
                    {p === "Medium" && "Needs attention soon"}
                    {p === "Urgent" && "Immediate action needed"}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="er-submit" disabled={loading}>
            {loading ? "Submitting…" : "⚡ Submit Electricity Request"}
          </button>
        </form>
      </main>
    </div>
  );
}
