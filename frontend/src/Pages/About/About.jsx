import { useNavigate } from "react-router-dom";
import "./About.css";
import missionImg from "../../assets/village_mission.png";

export default function About() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const stats = [
    { label: "Villages Impacted", value: "50+", icon: "🏘️" },
    { label: "Families Supported", value: "10k+", icon: "👨‍👩‍👧‍👦" },
    { label: "Funds Transferred", value: "₹ 2Cr+", icon: "💰" },
    { label: "Issues Resolved", value: "95%", icon: "✅" },
  ];

  const values = [
    {
      title: "Transparency",
      desc: "Every rupee tracked, every expense justified. We believe honesty is the foundation of community trust.",
      color: "#1e7f43",
    },
    {
      title: "Empowerment",
      desc: "Giving villagers the tools to request services and voice concerns directly to the authorities.",
      color: "#2a9d8f",
    },
    {
      title: "Efficiency",
      desc: "Streamlining PDS delivery and service requests to eliminate middlemen and delays.",
      color: "#264653",
    },
  ];

  return (
    <div className="about-layout animate-fade-in">
      {/* SIDEBAR (Consistent with Dashboard) */}
      <aside className="sidebar">
        <h2 className="brand" onClick={() => navigate("/dashboard")}>Village Funds</h2>
        <nav className="sidebar-nav-main">
          <a onClick={() => navigate("/dashboard")}>🏠 Dashboard</a>
          <a onClick={() => navigate("/pds-system")}>🌾 PDS System</a>
          <a onClick={() => navigate("/water-request")}>💧 Water Request</a>
          <a onClick={() => navigate("/electricity-request")}>⚡ Electricity Request</a>
          <a onClick={() => navigate("/house-request")}>🏡 House Request</a>
          <a onClick={() => navigate("/issues")}>⚠️ Issues</a>
          <a onClick={() => navigate("/donations")}>❤️ Donations</a>
          <a onClick={() => navigate("/reports")}>📊 Reports</a>
          <a onClick={() => navigate("/funds")}>📄 Fund Transparency</a>
        </nav>
        <div className="sidebar-divider" />
        <nav className="sidebar-nav-secondary">
          <a onClick={() => navigate("/dashboard")}>Home</a>
          <a className="active" onClick={() => navigate("/about")}>About</a>
          <a onClick={() => navigate("/contact")}>Contact</a>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="about-main">
        {/* HERO SECTION */}
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="badge">Our Mission</span>
            <h1>Transforming Villages with <span className="highlight">Digital Integrity</span></h1>
            <p>
              Voice of Village is a revolutionary platform designed to bridge the gap between rural communities and local governance. 
              We empower every citizen with transparency, accountability, and direct access to essential services.
            </p>
            <div className="hero-btns">
              <button className="btn-primary" onClick={() => navigate("/donations")}>Support Our Cause</button>
              <button className="btn-secondary" onClick={() => navigate("/contact")}>Get in Touch</button>
            </div>
          </div>
          <div className="about-hero-image">
            <img src={missionImg} alt="Village Development" className="floating-img" />
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="about-stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card-premium" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="stat-icon">{s.icon}</div>
              <div className="stat-info">
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* CORE VALUES */}
        <section className="about-values">
          <div className="section-header">
            <h2>Our Core Values</h2>
            <div className="underline"></div>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <div key={i} className="value-card" style={{ borderColor: v.color }}>
                <div className="value-glow" style={{ background: v.color }}></div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* JOURNEY SECTION */}
        <section className="about-journey">
          <div className="journey-content">
            <h2>Our Journey</h2>
            <p>
              Started in 2024, our initiative began with a single village and a vision to make every transaction transparent. 
              Today, we are scaling across multiple districts, ensuring that no villager is left behind in the digital era.
            </p>
            <div className="journey-timeline">
                <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-date">Phase 1</div>
                    <div className="timeline-text">Digital PDS Integration</div>
                </div>
                <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-date">Phase 2</div>
                    <div className="timeline-text">Transparency Portals</div>
                </div>
                <div className="timeline-item active">
                    <div className="timeline-dot"></div>
                    <div className="timeline-date">Phase 3</div>
                    <div className="timeline-text">Direct Service Requests</div>
                </div>
            </div>
          </div>
        </section>

        {/* TEAM CTA */}
        <section className="about-cta">
            <div className="cta-card">
                <h2>Join the Revolution</h2>
                <p>Be a part of the change. Whether you are a villager, a sarpanch, or a donor, your voice matters.</p>
                <button className="btn-white" onClick={() => navigate("/register")}>Get Started</button>
            </div>
        </section>
      </main>
    </div>
  );
}
