import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HouseRequest.css";

const REQUEST_TYPES = [
  "Building Plan Approval",
  "NOC from Gram Panchayat",
  "Commencement Certificate",
  "Completion Certificate",
  "Occupancy Certificate (OC)",
  "Water & Electricity Connection NOC",
  "Property Tax Registration",
];

const CONSTRUCTION_TYPES = ["New House", "Extension/Addition", "Renovation"];

export default function HouseRequest() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    full_name: user.name || "",
    village_name: "",
    ward_number: "",
    contact_number: "",
    aadhaar_number: "",
    plot_number: "",
    plot_size: "",
    survey_number: "",
    landmark: "",
    request_type: "",
    construction_type: "New House",
    floors_planned: 1,
    estimated_cost: "",
    expected_start_date: "",
    priority: "Normal",
  });

  const [files, setFiles] = useState({
    sale_deed: null,
    house_plan: null,
    encumbrance_cert: null,
    land_record: null,
    prev_approvals: null,
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [myRequests, setMyRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);

  const setF = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleFile = (field) => (e) => {
    if (e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.request_type) { setError("Please select a Type of Request."); return; }
    if (!files.sale_deed) { setError("Sale Deed / Title Deed upload is required."); return; }
    if (!files.house_plan) { setError("House Plan / Blueprint upload is required."); return; }

    setLoading(true); setError(""); setSuccess("");

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    fd.append("user_id", user.id);
    
    Object.entries(files).forEach(([k, v]) => {
      if (v) fd.append(k, v);
    });

    try {
      const res = await fetch("http://localhost:5000/api/house", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setSuccess("🏡 House building/approval request submitted successfully!");
        setForm({ ...form, village_name: "", ward_number: "", contact_number: "", aadhaar_number: "", plot_number: "", plot_size: "", survey_number: "", landmark: "", request_type: "", estimated_cost: "", expected_start_date: "" });
        setFiles({ sale_deed: null, house_plan: null, encumbrance_cert: null, land_record: null, prev_approvals: null });
      } else { setError(data.message || "Submission failed."); }
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  };

  const loadMyRequests = async () => {
    if (showRequests) { setShowRequests(false); return; }
    const res = await fetch(`http://localhost:5000/api/house?userId=${user.id}`);
    setMyRequests(await res.json());
    setShowRequests(true);
  };

  const statusColor = { Pending: "#f59e0b", "In Progress": "#3b82f6", Approved: "#16a34a", Rejected: "#dc2626" };

  return (
    <div className="hr-layout">
      <aside className="sidebar">
        <h2 className="brand">Village Funds</h2>
        <nav className="sidebar-nav-main">
          <a onClick={() => navigate("/dashboard")}>🏠 Dashboard</a>
          <a onClick={() => navigate("/pds-system")}>🌾 PDS System</a>
          <a onClick={() => navigate("/water-request")}>💧 Water Request</a>
          <a onClick={() => navigate("/electricity-request")}>⚡ Electricity Request</a>
          <a className="active" onClick={() => navigate("/house-request")}>🏡 House Request</a>
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

      <main className="hr-main">
        <div className="hr-page-header">
          <div>
            <h1>🏡 House & Building Approvals</h1>
            <p>Apply for panchayat NOCs, building plans, and property tax registrations</p>
          </div>
          <button className="hr-history-btn" onClick={loadMyRequests}>
            {showRequests ? "Hide My Applications" : "📋 My Applications"}
          </button>
        </div>

        {showRequests && (
          <div className="hr-history">
            <h3>My Previous Applications</h3>
            {myRequests.length === 0 ? (
              <p className="hr-empty">No applications submitted yet.</p>
            ) : (
              <div className="hr-history-list">
                {myRequests.map((r) => (
                  <div className="hr-hist-card" key={r.id}>
                    <div className="hr-hist-top">
                      <span className="hr-hist-type">{r.request_type}</span>
                      <span className="hr-hist-status" style={{ background: statusColor[r.status] + "22", color: statusColor[r.status] }}>{r.status}</span>
                    </div>
                    <p className="hr-hist-desc">Plot {r.plot_number || "N/A"}, {r.village_name} — {r.construction_type}</p>
                    <div className="hr-hist-meta">
                      <span style={{ color: r.priority === 'Urgent' ? '#dc2626' : '#64748b' }}>📌 {r.priority}</span>
                      <span>📅 {new Date(r.created_at).toLocaleDateString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <form className="hr-form" onSubmit={handleSubmit}>
          {success && <div className="hr-success">{success}</div>}
          {error   && <div className="hr-error">{error}</div>}

          {/* 1. Basic Details */}
          <div className="hr-section">
            <div className="hr-section-title"><span className="hr-icon">👤</span>Basic Details</div>
            <div className="hr-grid-2">
              <div className="hr-field">
                <label>Full Name</label>
                <input type="text" value={form.full_name} readOnly className="readonly" />
              </div>
              <div className="hr-field">
                <label>Contact Number <span className="req">*</span></label>
                <input type="tel" maxLength="10" placeholder="10-digit mobile number" value={form.contact_number} onChange={setF("contact_number")} required />
              </div>
              <div className="hr-field">
                <label>Aadhaar Number <span className="req">*</span></label>
                <input type="text" maxLength="12" placeholder="12-digit Aadhaar" value={form.aadhaar_number} onChange={setF("aadhaar_number")} required />
              </div>
              <div className="hr-field">
                <label>Village Name <span className="req">*</span></label>
                <input type="text" placeholder="Your village" value={form.village_name} onChange={setF("village_name")} required />
              </div>
            </div>
          </div>

          {/* 2. Plot Details */}
          <div className="hr-section">
            <div className="hr-section-title"><span className="hr-icon">🗺️</span>Plot & Location Details</div>
            <div className="hr-grid-2">
              <div className="hr-field">
                <label>Plot Number <span className="req">*</span></label>
                <input type="text" value={form.plot_number} onChange={setF("plot_number")} required />
              </div>
              <div className="hr-field">
                <label>Plot Size (sq. yards/feet) <span className="req">*</span></label>
                <input type="text" placeholder="e.g. 150 sq. yds" value={form.plot_size} onChange={setF("plot_size")} required />
              </div>
              <div className="hr-field">
                <label>Gram Panchayat Survey Number <span className="req">*</span></label>
                <input type="text" value={form.survey_number} onChange={setF("survey_number")} required />
              </div>
              <div className="hr-field">
                <label>Ward & Location / Landmark <span className="req">*</span></label>
                <input type="text" placeholder="Ward No / Street name" value={form.landmark} onChange={setF("landmark")} required />
              </div>

              <div className="hr-field hr-file-box">
                <label>Upload Sale Deed / Title Deed <span className="req">*</span></label>
                <input type="file" accept=".pdf,image/*" onChange={handleFile("sale_deed")} />
                {files.sale_deed && <span className="hr-file-name">📎 {files.sale_deed.name}</span>}
              </div>
            </div>
          </div>

          {/* 3. Request Type */}
          <div className="hr-section">
            <div className="hr-section-title"><span className="hr-icon">📋</span>Type of Request</div>
            <div className="hr-req-grid">
              {REQUEST_TYPES.map(rt => (
                <div key={rt} className={`hr-req-card ${form.request_type === rt ? 'selected' : ''}`} onClick={() => setForm({...form, request_type: rt})}>
                  {rt}
                </div>
              ))}
            </div>
          </div>

          {/* 4. Construction Details */}
          <div className="hr-section">
            <div className="hr-section-title"><span className="hr-icon">🏗️</span>Construction Details</div>
            
            <div className="hr-const-types">
              {CONSTRUCTION_TYPES.map(ct => (
                <label key={ct} className={`hr-radio-pill ${form.construction_type === ct ? 'active' : ''}`}>
                  <input type="radio" name="ctype" value={ct} checked={form.construction_type === ct} onChange={setF("construction_type")} />
                  {ct}
                </label>
              ))}
            </div>

            <div className="hr-grid-2" style={{ marginTop: "16px" }}>
              <div className="hr-field">
                <label>Number of Floors Planned <span className="req">*</span></label>
                <input type="number" min="1" max="10" value={form.floors_planned} onChange={setF("floors_planned")} required />
              </div>
              <div className="hr-field">
                <label>Estimated Construction Cost <span className="optional">(optional)</span></label>
                <input type="text" placeholder="e.g. ₹ 15,00,000" value={form.estimated_cost} onChange={setF("estimated_cost")} />
              </div>
              <div className="hr-field">
                <label>Expected Start Date <span className="optional">(optional)</span></label>
                <input type="date" value={form.expected_start_date} onChange={setF("expected_start_date")} />
              </div>

              <div className="hr-field hr-file-box">
                <label>Upload House Plan / Blueprint <span className="req">*</span></label>
                <input type="file" accept=".pdf,image/*" onChange={handleFile("house_plan")} />
                {files.house_plan && <span className="hr-file-name">📎 {files.house_plan.name}</span>}
              </div>
            </div>
          </div>

          {/* 5. Supporting Docs */}
          <div className="hr-section">
            <div className="hr-section-title"><span className="hr-icon">📁</span>Supporting Documents <span className="optional" style={{marginLeft: "8px", fontWeight: "normal"}}>(Upload purely if applicable)</span></div>
            <div className="hr-grid-3">
              <div className="hr-field hr-file-box">
                <label>Encumbrance Certificate (EC)</label>
                <input type="file" accept=".pdf,image/*" onChange={handleFile("encumbrance_cert")} />
                {files.encumbrance_cert && <span className="hr-file-name">📎 {files.encumbrance_cert.name}</span>}
              </div>
              <div className="hr-field hr-file-box">
                <label>Patta / Land Record</label>
                <input type="file" accept=".pdf,image/*" onChange={handleFile("land_record")} />
                {files.land_record && <span className="hr-file-name">📎 {files.land_record.name}</span>}
              </div>
              <div className="hr-field hr-file-box">
                <label>Previous Approvals <br/><span className="optional">(If Renovation/Extension)</span></label>
                <input type="file" accept=".pdf,image/*" onChange={handleFile("prev_approvals")} />
                {files.prev_approvals && <span className="hr-file-name">📎 {files.prev_approvals.name}</span>}
              </div>
            </div>
          </div>

          {/* 6. Priority */}
          <div className="hr-section">
            <div className="hr-section-title"><span className="hr-icon">📌</span>Priority Level</div>
            <div className="hr-priority-boxes">
              {['Normal', 'Urgent'].map(p => (
                <label key={p} className={`hr-pri-box ${form.priority === p ? 'active-'+p.toLowerCase() : ''}`}>
                  <input type="radio" value={p} checked={form.priority === p} onChange={setF("priority")} />
                  <span className="pri-title">{p}</span>
                  <span className="pri-sub">{p === 'Normal' ? 'Standard processing time' : 'Emergency / Fast-track'}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" className="hr-submit" disabled={loading}>
            {loading ? "Submitting Application…" : "🏡 Submit House Request"}
          </button>
        </form>
      </main>
    </div>
  );
}
