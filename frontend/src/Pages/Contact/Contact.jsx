import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Contact.css";
import contactImg from "../../assets/contact_illustration.png";

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 2000);
  };

  const faqs = [
    { q: "How can I report a problem in my village?", a: "Log in to your dashboard and click on 'Raise an Issue' to submit a report with images." },
    { q: "How are village funds managed?", a: "All funds are tracked via our Fund Transparency portal, accessible to all registered citizens." },
    { q: "Can I donate to a specific village project?", a: "Yes, our donations module allows you to select specific initiatives or general development funds." },
  ];

  return (
    <div className="contact-layout animate-fade-in">
      {/* SIDEBAR */}
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
          <a onClick={() => navigate("/about")}>About</a>
          <a className="active" onClick={() => navigate("/contact")}>Contact</a>
        </nav>
      </aside>

      <main className="contact-main">
        <section className="contact-hero">
            <h1>Get in <span className="highlight">Touch</span></h1>
            <p>Have questions or suggestions? We'd love to hear from you. Our team is here to help and empower your community.</p>
        </section>

        <div className="contact-grid">
            {/* CONTACT FORM */}
            <div className="contact-form-container glass">
                <h2>Send us a Message</h2>
                {submitted ? (
                    <div className="success-msg">
                        <div className="check-icon">✓</div>
                        <h3>Message Sent!</h3>
                        <p>Thank you for reaching out. We will get back to you shortly.</p>
                        <button className="btn-primary" onClick={() => setSubmitted(false)}>Send Another</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input 
                                type="text" 
                                required 
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                            <label>Full Name</label>
                        </div>
                        <div className="input-group">
                            <input 
                                type="email" 
                                required 
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                            <label>Email Address</label>
                        </div>
                        <div className="input-group">
                            <input 
                                type="text" 
                                required 
                                value={formData.subject}
                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            />
                            <label>Subject</label>
                        </div>
                        <div className="input-group">
                            <textarea 
                                required 
                                rows="4"
                                value={formData.message}
                                onChange={(e) => setFormData({...formData, message: e.target.value})}
                            ></textarea>
                            <label>Your Message</label>
                        </div>
                        <button className={`btn-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                )}
            </div>

            {/* CONTACT INFO */}
            <div className="contact-info-panel">
                <div className="info-card animate-slide-right">
                    <div className="info-icon">📍</div>
                    <div className="info-text">
                        <h4>Our Location</h4>
                        <p>123 Village Dev Road, District Hub, Andhra Pradesh 522001</p>
                    </div>
                </div>
                <div className="info-card animate-slide-right" style={{ animationDelay: '0.1s' }}>
                    <div className="info-icon">📞</div>
                    <div className="info-text">
                        <h4>Call Us</h4>
                        <p>+91 98765 43210</p>
                    </div>
                </div>
                <div className="info-card animate-slide-right" style={{ animationDelay: '0.2s' }}>
                    <div className="info-icon">✉️</div>
                    <div className="info-text">
                        <h4>Email Us</h4>
                        <p>support@voiceofvillage.org</p>
                    </div>
                </div>

                <div className="contact-visual">
                    <img src={contactImg} alt="Contact Illustration" className="contact-img" />
                </div>
            </div>
        </div>

        {/* FAQ SECTION */}
        <section className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-grid">
                {faqs.map((faq, i) => (
                    <div key={i} className="faq-card">
                        <h4>{faq.q}</h4>
                        <p>{faq.a}</p>
                    </div>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
}
