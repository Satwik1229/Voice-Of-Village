import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const STATUS_OPTIONS = ["pending", "in-progress", "resolved"];

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("issues");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [requests, setRequests] = useState({ house: [], water: [], electricity: [] });
  const [requestTab, setRequestTab] = useState("house");
  const [requestRemarks, setRequestRemarks] = useState({});
  const [issueFilter, setIssueFilter] = useState("pending");
  const [requestFilter, setRequestFilter] = useState("pending");
  const [funds, setFunds] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [newFund, setNewFund] = useState({ title: "", description: "", financial_year: "", category: "other", file: null });
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", priority: "medium" });
  const [docPreview, setDocPreview] = useState(null); // { url, name }
  const navigate = useNavigate();

  const filteredIssues = issues.filter(issue => issueFilter === "history" ? issue.status === "resolved" : issue.status !== "resolved");
  const filteredRequests = requests[requestTab] ? requests[requestTab].filter(req => {
    const isHistory = req.status?.toLowerCase() === "approved" || req.status?.toLowerCase() === "rejected" || req.status?.toLowerCase() === "resolved";
    return requestFilter === "history" ? isHistory : !isHistory;
  }) : [];

  const token = localStorage.getItem("token");
  const admin = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchSummary();
    fetchIssues();
    fetchUsers();
    fetchUnverifiedUsers();
    fetchRequests("house");
    fetchRequests("water");
    fetchRequests("electricity");
    fetchFunds();
    fetchAnnouncements();
  }, []);

  async function fetchRequests(type) {
    try {
      const res = await fetch(`http://localhost:5000/api/${type}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRequests((prev) => ({ ...prev, [type]: Array.isArray(data) ? data : [] }));
    } catch {}
  }

  async function fetchFunds() {
    try {
      const res = await fetch(`http://localhost:5000/api/funds`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFunds(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function fetchAnnouncements() {
    try {
      const res = await fetch(`http://localhost:5000/api/announcements`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function handleDeleteFund(id) {
    if (!window.confirm("Delete this document?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/funds/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchFunds();
    } catch (err) { console.error(err); }
  }

  async function handleDeleteAnnouncement(id) {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchAnnouncements();
    } catch (err) { console.error(err); }
  }

  async function handleUploadFund(e) {
    e.preventDefault();
    if (!newFund.file || !newFund.title) return alert("Title and File are required");
    const formData = new FormData();
    formData.append("title", newFund.title);
    formData.append("description", newFund.description);
    formData.append("financial_year", newFund.financial_year);
    formData.append("category", newFund.category);
    formData.append("file", newFund.file);

    try {
      const res = await fetch("http://localhost:5000/api/funds/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        setNewFund({ title: "", description: "", financial_year: "", category: "other", file: null });
        fetchFunds();
      } else {
        alert("Upload failed");
      }
    } catch (err) { console.error(err); }
  }

  async function handlePostAnnouncement(e) {
    e.preventDefault();
    if (!newAnnouncement.title || !newAnnouncement.content) return alert("Title and Content are required");
    try {
      const res = await fetch("http://localhost:5000/api/announcements", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAnnouncement),
      });
      if (res.ok) {
        setNewAnnouncement({ title: "", content: "", priority: "medium" });
        fetchAnnouncements();
      } else {
        alert("Failed to post announcement");
      }
    } catch (err) { console.error(err); }
  }

  async function handleRequestStatus(type, id, newStatus) {
    const remarks = requestRemarks[id] || "";
    try {
      const res = await fetch(`http://localhost:5000/api/${type}/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus, remarks }),
      });
      if (res.ok) {
        fetchRequests(type);
        setRequestRemarks((prev) => ({ ...prev, [id]: "" }));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  }

  async function apiGet(path) {
    const res = await fetch(`http://localhost:5000/api/admin/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  }

  async function fetchSummary() {
    try {
      const data = await apiGet("summary");
      setSummary(data);
    } catch {}
  }

  async function fetchIssues() {
    try {
      const data = await apiGet("issues");
      setIssues(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function fetchUsers() {
    try {
      const data = await apiGet("users");
      setUsers(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function fetchUnverifiedUsers() {
    try {
      const data = await apiGet("unverified-users");
      setUnverifiedUsers(Array.isArray(data) ? data : []);
    } catch {}
  }

  async function verifyUserAction(userId) {
    setUpdatingId(userId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/verify`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUnverifiedUsers((prev) => prev.filter((u) => u.id !== userId));
        fetchSummary();
        fetchUsers();
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function rejectUserAction(userId) {
    if (!window.confirm("Are you sure you want to REJECT and remove this user?")) return;
    setUpdatingId(userId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/reject`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUnverifiedUsers((prev) => prev.filter((u) => u.id !== userId));
        fetchSummary();
        fetchUsers();
      } else {
        alert("Rejection failed. Please try again.");
      }
    } finally {
      setUpdatingId(null);
    }
  }

  async function updateStatus(issueId, newStatus) {
    setUpdatingId(issueId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/issues/${issueId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setIssues((prev) =>
          prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
        );
        if (selectedIssue?.id === issueId) {
          setSelectedIssue((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function handleLogout() {
    localStorage.clear();
    navigate("/login");
  }

  const statCards = summary
    ? [
        { label: "Total Users", value: summary.totalUsers, icon: "👥", color: "#4da3ff" },
        { label: "Pending Issues", value: summary.pendingIssues, icon: "📋", color: "#ffc107" },
        { label: "Resolved", value: summary.resolvedIssues, icon: "✅", color: "#52c77e" },
        { label: "Unverified", value: summary.pendingVerifications, icon: "🛡️", color: "#ff7b54" },
      ]
    : [];

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-icon">🏛️</span>
          <div>
            <h2>Admin Panel</h2>
            <p>Village Management</p>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-btn ${activeTab === "issues" ? "active" : ""}`}
            onClick={() => setActiveTab("issues")}
          >
            <span>📋</span> Issues
          </button>
          <button
            className={`admin-nav-btn ${activeTab === "verifications" ? "active" : ""}`}
            onClick={() => setActiveTab("verifications")}
          >
            <span>🛡️</span> Verifications
          </button>
          <button
            className={`admin-nav-btn ${activeTab === "users" ? "active" : ""}`}
            onClick={() => setActiveTab("users")}
          >
            <span>👥</span> Users
          </button>
          <button
            className={`admin-nav-btn ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => setActiveTab("requests")}
          >
            <span>📝</span> Requests
          </button>
          <button
            className={`admin-nav-btn ${activeTab === "funds" ? "active" : ""}`}
            onClick={() => setActiveTab("funds")}
          >
            <span>💰</span> Funds
          </button>
          <button
            className={`admin-nav-btn ${activeTab === "announcements" ? "active" : ""}`}
            onClick={() => setActiveTab("announcements")}
          >
            <span>📢</span> Announcements
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">{admin.name?.charAt(0) || "A"}</div>
            <div>
              <p className="admin-name">{admin.name || "Admin"}</p>
              <p className="admin-role">Administrator</p>
            </div>
          </div>
          <button className="logout-btn" onClick={() => navigate("/profile")} style={{marginBottom: '5px', background: '#3b82f6', color: 'white'}}>
            Profile
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* HEADER */}
        <div className="admin-header">
          <div>
            <h1>
              {activeTab === "issues" ? "Issue Management" : activeTab === "users" ? "User Management" : "Pending Verifications"}
            </h1>
            <p>
              {activeTab === "issues"
                ? "View and update the status of all reported issues"
                : activeTab === "users"
                ? "View all registered villagers and their roles"
                : "Verify new user registrations and their uploaded documents"}
            </p>
          </div>
          <button className="refresh-btn" onClick={() => { fetchSummary(); fetchIssues(); fetchUsers(); fetchUnverifiedUsers(); }}>
            ↻ Refresh
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="admin-stats">
          {statCards.map((s) => (
            <div className="stat-card" key={s.label}>
              <div className="stat-icon" style={{ background: `${s.color}22`, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="stat-value">{s.value ?? "—"}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ISSUES TABLE */}
        {activeTab === "issues" && (
          <div className="admin-table-section">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <button className={`admin-nav-btn ${issueFilter === "pending" ? "active" : ""}`} onClick={() => setIssueFilter("pending")}>Active Issues</button>
              <button className={`admin-nav-btn ${issueFilter === "history" ? "active" : ""}`} onClick={() => setIssueFilter("history")}>History</button>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Reported By</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssues.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", color: "#666", padding: "2rem" }}>
                      No {issueFilter === "history" ? "resolved" : "active"} issues found
                    </td>
                  </tr>
                )}
                {filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className={selectedIssue?.id === issue.id ? "selected-row" : ""}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <td>{issue.id}</td>
                    <td className="title-cell">{issue.title}</td>
                    <td>
                      <span className="category-tag">{issue.category}</span>
                    </td>
                    <td>{issue.submitted_by_name}</td>
                    <td>{new Date(issue.created_at).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${issue.status?.replace(" ", "-")}`}>
                        {issue.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className="status-select"
                        value={issue.status}
                        disabled={updatingId === issue.id}
                        onChange={(e) => updateStatus(issue.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ISSUE DETAIL PANEL */}
            {selectedIssue && (
              <div className="issue-detail-panel">
                <div className="panel-header">
                  <h3>{selectedIssue.title}</h3>
                  <button className="close-panel" onClick={() => setSelectedIssue(null)}>×</button>
                </div>
                <div className="panel-row">
                  <span>Category</span><strong>{selectedIssue.category}</strong>
                </div>
                <div className="panel-row">
                  <span>Status</span>
                  <span className={`status-badge ${selectedIssue.status?.replace(" ", "-")}`}>
                    {selectedIssue.status}
                  </span>
                </div>
                <div className="panel-row">
                  <span>Reported by</span><strong>{selectedIssue.submitted_by_name}</strong>
                </div>
                <div className="panel-row">
                  <span>Date</span><strong>{new Date(selectedIssue.created_at).toLocaleDateString()}</strong>
                </div>
                <p className="panel-desc">{selectedIssue.description}</p>
                {selectedIssue.image_url && (
                  <img
                    className="panel-image"
                    src={`http://localhost:5000/uploads/${selectedIssue.image_url}`}
                    alt="Issue"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                )}
                <div style={{ marginTop: "1.5rem" }}>
                  <p style={{ fontSize: "12px", color: "#666", marginBottom: "8px" }}>Update Status:</p>
                  <div className="status-btn-group">
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        className={`status-action-btn ${s} ${selectedIssue.status === s ? "active" : ""}`}
                        onClick={() => updateStatus(selectedIssue.id, s)}
                        disabled={updatingId === selectedIssue.id}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VERIFICATIONS CARDS */}
        {activeTab === "verifications" && (
          <div className="admin-table-section">
            <p style={{ color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
              Review submitted documents carefully before approving or rejecting user accounts.
            </p>

            {unverifiedUsers.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", background: "#f9fafb", borderRadius: "12px", color: "#6b7280" }}>
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>No pending verifications!</p>
                <p>All user accounts have been reviewed.</p>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
              {unverifiedUsers.map((u) => (
                <div key={u.id} style={{
                  background: "#fff",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb"
                }}>
                  {/* Card Header */}
                  <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea, #764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "1.1rem" }}>
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: "700", color: "#111827", fontSize: "1rem" }}>{u.name}</p>
                        <p style={{ margin: 0, color: "#6b7280", fontSize: "0.85rem" }}>{u.email}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "20px", fontWeight: "600" }}>PENDING</span>
                  </div>

                  {/* Card Body */}
                  <div style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", fontSize: "0.9rem", color: "#4b5563" }}>
                      <span>📅 Joined: {new Date(u.created_at).toLocaleDateString()}</span>
                      <span>🆔 ID: #{u.id}</span>
                    </div>

                    {/* Document Viewer */}
                    {u.document_path ? (
                      <div style={{ marginBottom: "1rem" }}>
                        <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "8px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Submitted Document</p>
                        <div
                          onClick={() => setDocPreview({ url: `http://localhost:5000/uploads/${u.document_path}`, name: u.name })}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 14px", background: "#eff6ff", border: "1px solid #bfdbfe",
                            borderRadius: "8px", cursor: "pointer", transition: "background 0.2s"
                          }}
                        >
                          <span style={{ fontSize: "1.5rem" }}>📄</span>
                          <div>
                            <p style={{ margin: 0, fontWeight: "600", color: "#1d4ed8", fontSize: "0.9rem" }}>View Document</p>
                            <p style={{ margin: 0, color: "#6b7280", fontSize: "0.8rem" }}>Click to preview in modal</p>
                          </div>
                          <span style={{ marginLeft: "auto", color: "#3b82f6", fontSize: "1.2rem" }}>↗</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ marginBottom: "1rem", padding: "10px 14px", background: "#fef2f2", borderRadius: "8px", color: "#ef4444", fontSize: "0.9rem" }}>
                        ⚠️ No document submitted
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => verifyUserAction(u.id)}
                        disabled={updatingId === u.id}
                        style={{
                          flex: 1, padding: "10px", background: "#22c55e", color: "#fff",
                          border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700",
                          fontSize: "0.95rem", opacity: updatingId === u.id ? 0.6 : 1,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                        }}
                      >
                        {updatingId === u.id ? "..." : "✅ Approve"}
                      </button>
                      <button
                        onClick={() => rejectUserAction(u.id)}
                        disabled={updatingId === u.id}
                        style={{
                          flex: 1, padding: "10px", background: "#ef4444", color: "#fff",
                          border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700",
                          fontSize: "0.95rem", opacity: updatingId === u.id ? 0.6 : 1,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"
                        }}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS TABLE */}
        {activeTab === "users" && (
          <div className="admin-table-section">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center", color: "#666", padding: "2rem" }}>
                      No users found
                    </td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.is_verified ? "resolved" : "pending"}`}>
                        {u.is_verified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REQUESTS TABLE */}
        {activeTab === "requests" && (
          <div className="admin-table-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className={`admin-nav-btn ${requestTab === "house" ? "active" : ""}`} onClick={() => setRequestTab("house")}>House</button>
                <button className={`admin-nav-btn ${requestTab === "water" ? "active" : ""}`} onClick={() => setRequestTab("water")}>Water</button>
                <button className={`admin-nav-btn ${requestTab === "electricity" ? "active" : ""}`} onClick={() => setRequestTab("electricity")}>Electricity</button>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className={`admin-nav-btn ${requestFilter === "pending" ? "active" : ""}`} onClick={() => setRequestFilter("pending")} style={{ background: requestFilter === "pending" ? 'rgba(59, 130, 246, 0.2)' : 'transparent', border: `1px solid ${requestFilter === "pending" ? '#3b82f6' : 'rgba(255,255,255,0.1)'}` }}>Active Requests</button>
                <button className={`admin-nav-btn ${requestFilter === "history" ? "active" : ""}`} onClick={() => setRequestFilter("history")} style={{ background: requestFilter === "history" ? 'rgba(59, 130, 246, 0.2)' : 'transparent', border: `1px solid ${requestFilter === "history" ? '#3b82f6' : 'rgba(255,255,255,0.1)'}` }}>History</button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredRequests.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: "center", color: "#6b7280", padding: "2.5rem", background: '#ffffff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.04)' }}>
                  No {requestFilter === "history" ? "completed" : "pending"} {requestTab} requests
                </div>
              )}
              {filteredRequests.map((req) => (
                <div key={req.id} style={{ background: '#ffffff', border: 'none', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#111827' }}>{req.user_name || req.name || 'Unknown Applicant'}</h3>
                    <span className={`status-badge ${req.status?.toLowerCase() === 'approved' ? 'resolved' : req.status?.toLowerCase() === 'rejected' ? 'danger' : 'pending'}`} style={{ whiteSpace: 'nowrap', marginLeft: '10px' }}>
                      {req.status}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem', color: '#4b5563' }}>
                    <p style={{ margin: 0 }}><strong>Request ID:</strong> #{req.id}</p>
                    <p style={{ margin: 0 }}><strong>Date:</strong> {new Date(req.created_at).toLocaleDateString()}</p>
                    {req.description && <p style={{ margin: 0 }}><strong>Details:</strong> {req.description}</p>}
                    {req.address && <p style={{ margin: 0 }}><strong>Address:</strong> {req.address}</p>}
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {requestFilter === "history" ? (
                      req.remarks && (
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                          <strong>Admin Remarks:</strong> {req.remarks}
                        </p>
                      )
                    ) : (
                      <>
                        <input 
                          type="text" 
                          placeholder="Add remarks..." 
                          value={requestRemarks[req.id] || ""}
                          onChange={(e) => setRequestRemarks({...requestRemarks, [req.id]: e.target.value})}
                          style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', background: '#f9fafb', color: '#111827', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <button style={{ flex: 1, padding: '8px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', minWidth: '80px' }} onClick={() => handleRequestStatus(requestTab, req.id, 'Approved')}>Approve</button>
                          <button style={{ flex: 1, padding: '8px', background: '#eab308', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', minWidth: '80px' }} onClick={() => handleRequestStatus(requestTab, req.id, 'In Progress')}>In Progress</button>
                          <button style={{ flex: 1, padding: '8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', minWidth: '80px' }} onClick={() => handleRequestStatus(requestTab, req.id, 'Rejected')}>Reject</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FUNDS TABLE */}
        {activeTab === "funds" && (
          <div className="admin-table-section">
            <h2 style={{ marginBottom: "1rem" }}>Upload Fund Document</h2>
            <form onSubmit={handleUploadFund} style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "2rem", background: "#f9fafb", padding: "1rem", borderRadius: "8px" }}>
              <input type="text" placeholder="Title" required style={{ flex: 1, padding: "8px" }} value={newFund.title} onChange={e => setNewFund({...newFund, title: e.target.value})} />
              <input type="text" placeholder="Description (optional)" style={{ flex: 2, padding: "8px" }} value={newFund.description} onChange={e => setNewFund({...newFund, description: e.target.value})} />
              <input type="text" placeholder="Fin Year (e.g. 2025-26)" style={{ flex: 1, padding: "8px" }} value={newFund.financial_year} onChange={e => setNewFund({...newFund, financial_year: e.target.value})} />
              <select style={{ padding: "8px" }} value={newFund.category} onChange={e => setNewFund({...newFund, category: e.target.value})}>
                <option value="other">Other</option><option value="budget">Budget</option><option value="expenditure">Expenditure</option><option value="audit">Audit</option><option value="tender">Tender</option>
              </select>
              <input type="file" required style={{ padding: "8px" }} onChange={e => setNewFund({...newFund, file: e.target.files[0]})} />
              <button type="submit" style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px" }}>Upload</button>
            </form>

            <table className="admin-table">
              <thead>
                <tr>
                   <th>#</th><th>Title</th><th>Category</th><th>Fin Year</th><th>Uploaded By</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {funds.length === 0 && <tr><td colSpan={7} style={{textAlign: "center", padding: "2rem"}}>No documents uploaded</td></tr>}
                {funds.map(f => (
                  <tr key={f.id}>
                    <td>{f.id}</td><td>{f.title}</td><td><span className="category-tag">{f.category}</span></td>
                    <td>{f.financial_year || "-"}</td><td>{f.uploader_name}</td><td>{new Date(f.created_at).toLocaleDateString()}</td>
                    <td>
                      <a href={`http://localhost:5000/uploads/${f.document_url}`} target="_blank" rel="noreferrer" style={{marginRight: "10px", color: "#3b82f6"}}>View</a>
                      <button onClick={() => handleDeleteFund(f.id)} style={{background: "none", color: "#ef4444", border: "none", cursor: "pointer"}}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ANNOUNCEMENTS TABLE */}
        {activeTab === "announcements" && (
          <div className="admin-table-section">
            <h2 style={{ marginBottom: "1rem" }}>Post Announcement</h2>
            <form onSubmit={handlePostAnnouncement} style={{ display: "flex", gap: "10px", flexDirection: "column", marginBottom: "2rem", background: "#f9fafb", padding: "1rem", borderRadius: "8px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <input type="text" placeholder="Announcement Title" required style={{ flex: 2, padding: "8px" }} value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} />
                <select style={{ flex: 1, padding: "8px" }} value={newAnnouncement.priority} onChange={e => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}>
                  <option value="low">Low Priority</option><option value="medium">Medium Priority</option><option value="high">High Priority</option><option value="urgent">Urgent</option>
                </select>
              </div>
              <textarea placeholder="Announcement Content" required rows="3" style={{ padding: "8px" }} value={newAnnouncement.content} onChange={e => setNewAnnouncement({...newAnnouncement, content: e.target.value})}></textarea>
              <button type="submit" style={{ padding: "8px 16px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: "6px", alignSelf: "flex-start" }}>Post Announcement</button>
            </form>

            <table className="admin-table">
              <thead>
                <tr>
                   <th>#</th><th>Title</th><th>Priority</th><th>Posted By</th><th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.length === 0 && <tr><td colSpan={6} style={{textAlign: "center", padding: "2rem"}}>No announcements found</td></tr>}
                {announcements.map(a => (
                  <tr key={a.id}>
                    <td>{a.id}</td><td style={{maxWidth: "300px"}}>{a.title}</td>
                    <td>
                      <span className={`status-badge ${a.priority === 'urgent' ? 'danger' : a.priority === 'high' ? 'pending' : a.priority === 'low' ? 'resolved' : 'medium'}`}>
                        {a.priority}
                      </span>
                    </td>
                    <td>{a.posted_by_name}</td><td>{new Date(a.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => handleDeleteAnnouncement(a.id)} style={{background: "none", color: "#ef4444", border: "none", cursor: "pointer"}}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* DOCUMENT PREVIEW MODAL */}
      {docPreview && (
        <div
          onClick={() => setDocPreview(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "2rem"
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: "16px", width: "100%",
              maxWidth: "900px", maxHeight: "90vh", display: "flex",
              flexDirection: "column", overflow: "hidden",
              boxShadow: "0 25px 50px rgba(0,0,0,0.4)"
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "700", color: "#111827" }}>📄 Verification Document</p>
                <p style={{ margin: 0, color: "#6b7280", fontSize: "0.85rem" }}>Submitted by: {docPreview.name}</p>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <a
                  href={docPreview.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: "8px 14px", background: "#3b82f6", color: "#fff", borderRadius: "8px", textDecoration: "none", fontSize: "0.9rem", fontWeight: "600" }}
                >
                  Open in New Tab ↗
                </a>
                <button
                  onClick={() => setDocPreview(null)}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  ×
                </button>
              </div>
            </div>
            {/* Modal Content */}
            <div style={{ flex: 1, overflow: "hidden", background: "#f3f4f6" }}>
              {docPreview.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img
                  src={docPreview.url}
                  alt="Document"
                  style={{ width: "100%", height: "100%", objectFit: "contain", maxHeight: "75vh" }}
                />
              ) : (
                <iframe
                  src={docPreview.url}
                  title="Document Preview"
                  style={{ width: "100%", height: "75vh", border: "none" }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
