import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import heroImg from "../../assets/dashboard-hero.png";

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalFunds: 0, totalExpenses: 0, totalDonations: 0 });
  const [myBookings, setMyBookings] = useState([]);
  const [topAnnouncements, setTopAnnouncements] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/summary")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => setStats({ totalFunds: 500000, totalExpenses: 200000, totalDonations: 50000 }));

    if (user.id) {
      fetch(`http://localhost:5000/api/pds/bookings?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setMyBookings(data))
        .catch(() => {});
    }

    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/announcements", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTopAnnouncements(data.slice(0, 5));
      })
      .catch(() => {});
  }, [user.id]);

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2 className="brand">Village Funds</h2>
        <nav className="sidebar-nav-main">
          <a className="active" onClick={() => navigate("/dashboard")}>🏠 Dashboard</a>
          <a onClick={() => navigate("/pds-system")}>🌾 PDS System</a>
          <a onClick={() => navigate("/water-request")}>💧 Water Request</a>
          <a onClick={() => navigate("/electricity-request")}>⚡ Electricity Request</a>
          <a onClick={() => navigate("/house-request")}>🏡 House Request</a>
          <a onClick={() => navigate("/issues")}>⚠️ Issues</a>
          <a onClick={() => navigate("/donations")}>❤️ Donations</a>
          <a onClick={() => navigate("/reports")}>📊 Reports</a>
          <a onClick={() => navigate("/funds")}>📄 Fund Transparency</a>
        </nav>

        {/* Bottom separator + secondary links */}
        <div className="sidebar-divider" />
        <nav className="sidebar-nav-secondary">
          <a onClick={() => navigate("/dashboard")}>Home</a>
          <a onClick={() => navigate("/about")}>About</a>
          <a onClick={() => navigate("/contact")}>Contact</a>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="main-content">
        {/* TOPBAR — no nav links here anymore */}
        <header className="topbar">
          <h3>Village Funds & Transparency</h3>
          <div className="user-account" onClick={() => setShowMenu(!showMenu)}>
            <div className="avatar">{user.name?.charAt(0) || "G"}</div>
            <span className="username">{user.name || "Guest"}</span>
            {showMenu && (
              <div className="account-menu">
                <div onClick={() => { setShowMenu(false); navigate("/profile"); }}>👤 My Profile</div>
                <div onClick={(e) => { 
                  e.stopPropagation(); 
                  setShowMenu(false);
                  localStorage.clear(); 
                  navigate("/login", { replace: true }); 
                }}>
                  🚪 Logout
                </div>
              </div>
            )}
          </div>
        </header>

        {/* LATEST ANNOUNCEMENTS (VERY TOP) */}
        {topAnnouncements.length > 0 && (
          <section style={{ margin: "2rem", padding: "1.5rem", background: "#fff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>📢 Latest Announcements</h3>
              <button 
                onClick={() => navigate("/announcements")}
                style={{ padding: "6px 12px", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer", fontSize: "0.9rem" }}
              >
                View All Announcements
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topAnnouncements.map(a => (
                <div key={a.id} style={{ 
                  padding: "1rem", borderRadius: "8px", background: "#f9fafb", 
                  border: "1px solid", 
                  borderColor: a.priority === "urgent" ? "#ef4444" : a.priority === "high" ? "#f97316" : "#e5e7eb"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <strong style={{ fontSize: "1.1rem" }}>{a.title}</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "0.8rem", padding: "2px 8px", borderRadius: "10px", background: a.priority === "urgent" ? "#fee2e2" : a.priority === "high" ? "#ffedd5" : "#e0f2fe", color: a.priority === "urgent" ? "#ef4444" : a.priority === "high" ? "#f97316" : "#0284c7" }}>
                        {a.priority.toUpperCase()}
                      </span>
                      <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p style={{ margin: 0, color: "#4b5563", fontSize: "0.95rem" }}>{a.content}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* HERO */}
        <section className="hero">
          <div className="hero-text">
            <h1>Empowering Villages <br /> through Transparency</h1>
            <p>Track funds, request essential services, raise issues, and support villages through donations.</p>
          </div>
          <img src={heroImg} alt="Village Illustration" className="hero-img" />
        </section>

        {/* STATS */}
        <section className="stats">
          <div className="stat-card">
            <span>Total Funds</span>
            <h2>₹ {stats.totalFunds.toLocaleString()}</h2>
          </div>
          <div className="stat-card">
            <span>Total Expenses</span>
            <h2>₹ {stats.totalExpenses.toLocaleString()}</h2>
          </div>
          <div className="stat-card">
            <span>Total Donations</span>
            <h2>₹ {stats.totalDonations.toLocaleString()}</h2>
          </div>
        </section>

        {/* PDS BOOKINGS */}
        <section className="dashboard-bookings">
          <h3>My PDS Bookings</h3>
          {myBookings.filter(b => b.status === "BOOKED").length === 0 ? (
            <p className="no-bookings-msg">You have no upcoming PDS bookings.</p>
          ) : (
            <div className="bookings-scroll-row">
              {myBookings
                .filter(b => b.status === "BOOKED")
                .map((b) => (
                  <div 
                    key={b.id} 
                    className="dash-booking-card clickable" 
                    onClick={() => navigate("/pds-slot")}
                    title="Click to view QR/OTP"
                  >
                  <div className="dash-booking-top">
                    <span className="b-item">{b.item} ({b.quantity})</span>
                    <span className={`b-status ${b.status.toLowerCase()}`}>{b.status}</span>
                  </div>
                  <div className="dash-booking-info">
                    <p><strong>Date:</strong> {new Date(b.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {b.time_slot}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* QUICK LINKS */}
        <section className="quick-links">
          <h3>Quick Actions</h3>
          <div className="links">
            <div className="link-card" onClick={() => navigate("/announcements")}>📢 Announcements</div>
            <div className="link-card" onClick={() => navigate("/issues")}>⚠️ Raise an Issue</div>
            <div className="link-card" onClick={() => navigate("/donations")}>❤️ Make a Donation</div>
            <div className="link-card" onClick={() => navigate("/pds-system")}>🌾 PDS Details</div>
          </div>
        </section>
      </main>
    </div>
  );
}
