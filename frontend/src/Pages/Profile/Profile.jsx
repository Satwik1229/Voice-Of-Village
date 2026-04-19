import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

// Map raw DB role to a human-readable label
const ROLE_LABELS = {
  user:       "Villager",
  admin:      "Admin",
  pds_dealer: "PDS Dealer",
};

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Change-password form state
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwMsg, setPwMsg] = useState({ text: "", ok: true });
  const [pwLoading, setPwLoading] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);

  useEffect(() => {
    if (!user.id) { navigate("/login"); return; }
    fetch(`http://localhost:5000/api/profile/${user.id}`)
      .then((r) => r.json())
      .then((d) => { setProfile(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user.id]);

  const handleBack = () => {
    if (user.role === "admin") navigate("/admin");
    else if (user.role === "pds_dealer") navigate("/pds-system");
    else navigate("/dashboard");
  };

  const memberSince = (dateStr) => {
    if (!dateStr) return "N/A";
    const months =
      (new Date().getFullYear() - new Date(dateStr).getFullYear()) * 12 +
      (new Date().getMonth() - new Date(dateStr).getMonth());
    if (months < 1) return "Less than a month";
    if (months < 12) return `${months} month${months > 1 ? "s" : ""}`;
    const y = Math.floor(months / 12), m = months % 12;
    return `${y} year${y > 1 ? "s" : ""}${m ? `, ${m} month${m > 1 ? "s" : ""}` : ""}`;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) {
      setPwMsg({ text: "New passwords do not match.", ok: false });
      return;
    }
    if (pwForm.newPw.length < 6) {
      setPwMsg({ text: "Password must be at least 6 characters.", ok: false });
      return;
    }
    setPwLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/profile/${user.id}/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwMsg({ text: "✅ Password changed successfully!", ok: true });
        setPwForm({ current: "", newPw: "", confirm: "" });
        setShowPwForm(false);
      } else {
        setPwMsg({ text: data.message || "Failed to change password.", ok: false });
      }
    } catch {
      setPwMsg({ text: "Network error. Try again.", ok: false });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return <div className="profile-loading">Loading profile…</div>;

  const roleLabel = ROLE_LABELS[profile?.role || user.role] || "Villager";

  const fields = [
    { icon: "👤", label: "Full Name",     value: profile?.name || user.name || "—" },
    { icon: "📧", label: "Email Address", value: profile?.email || user.email || "—" },
    { icon: "🏷️", label: "Role",          value: roleLabel },
    { icon: "🌾", label: "PDS Number",    value: profile?.pds_number || "Not assigned" },
    { icon: "🎂", label: "Date of Birth", value: profile?.dob ? new Date(profile.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "Not set" },
    { icon: "📍", label: "Address",       value: profile?.address || "Not set" },
    { icon: "📅", label: "Member Since",  value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—" },
    { icon: "⏳", label: "Using App For", value: memberSince(profile?.created_at) },
  ];

  return (
    <div className="profile-page">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="brand">Village Funds</h2>
        <nav className="sidebar-nav-main">
          <a onClick={handleBack}>
            🏠 {user.role === 'admin' ? 'Admin Panel' : user.role === 'pds_dealer' ? 'PDS Dashboard' : 'Dashboard'}
          </a>
          {user.role === 'user' && (
            <>
              <a onClick={() => navigate("/pds-system")}>🌾 PDS System</a>
              <a onClick={() => navigate("/issues")}>⚠️ Issues</a>
              <a onClick={() => navigate("/donations")}>❤️ Donations</a>
            </>
          )}
        </nav>
        <div className="sidebar-divider" />
        <nav className="sidebar-nav-secondary">
          <a onClick={handleBack}>Home</a>
          <a onClick={() => navigate("/about")}>About</a>
          <a onClick={() => navigate("/contact")}>Contact</a>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="profile-main">
        <button className="profile-back" onClick={handleBack}>← Back to Home</button>

        {/* Header card */}
        <div className="profile-header">
          <div className="profile-avatar-big">
            {(profile?.name || user.name || "G").charAt(0).toUpperCase()}
          </div>
          <div>
            <h1>{profile?.name || user.name || "Guest"}</h1>
            <p className="profile-role">{roleLabel}</p>
          </div>
        </div>

        {/* Detail grid */}
        <div className="profile-grid">
          {fields.map((f) => (
            <div className="profile-field" key={f.label}>
              <div className="profile-field-icon">{f.icon}</div>
              <div className="profile-field-body">
                <span className="profile-field-label">{f.label}</span>
                <span className="profile-field-value">{f.value}</span>
              </div>
            </div>
          ))}

          {/* Password card — special */}
          <div className="profile-field password-card">
            <div className="profile-field-icon">🔒</div>
            <div className="profile-field-body" style={{ flex: 1 }}>
              <span className="profile-field-label">Password</span>
              {!showPwForm ? (
                <div className="pw-row">
                  <span className="profile-field-value">••••••••••</span>
                  <button className="change-pw-btn" onClick={() => { setShowPwForm(true); setPwMsg({ text: "", ok: true }); }}>
                    Change
                  </button>
                </div>
              ) : (
                <form className="pw-form" onSubmit={handleChangePassword}>
                  <input
                    type="password"
                    placeholder="Current password"
                    value={pwForm.current}
                    onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={pwForm.newPw}
                    onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                    required
                  />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={pwForm.confirm}
                    onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    required
                  />
                  {pwMsg.text && (
                    <p className={`pw-msg ${pwMsg.ok ? "pw-ok" : "pw-err"}`}>{pwMsg.text}</p>
                  )}
                  <div className="pw-actions">
                    <button type="submit" className="pw-submit" disabled={pwLoading}>
                      {pwLoading ? "Saving…" : "Save Password"}
                    </button>
                    <button type="button" className="pw-cancel" onClick={() => { setShowPwForm(false); setPwMsg({ text: "", ok: true }); }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
