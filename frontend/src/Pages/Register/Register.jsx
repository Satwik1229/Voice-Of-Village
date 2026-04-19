import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";
import logo from "../../assets/logo.png";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [address, setAddress] = useState("");
  const [document, setDocument] = useState(null);
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!document) {
      setError("Please upload a verification document.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("role", role);
      formData.append("address", address);
      formData.append("document", document);

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setAadhaar("");
        setAddress("");
        setDocument(null);
        // Redirect after delay
        setTimeout(() => navigate("/login"), 5000);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-hero">
        <h1>Villager Registration</h1>
        <p>
          Register by submitting your Aadhaar number and required documents.
          Your account will be activated after admin verification.
        </p>
      </div>

      <div className="register-card">
        <div className="register-header">
          <img src={logo} alt="Village Logo" />
          <div>
            <h2>Village Funds & Transparency</h2>
            <span>Management System</span>
          </div>
        </div>

        {error && <p style={{ color: "red", textAlign: "center", marginBottom: "1rem", backgroundColor: "rgba(255,0,0,0.1)", padding: "10px", borderRadius: "8px" }}>{error}</p>}
        {success && <p style={{ color: "#0d6a36", textAlign: "center", marginBottom: "1rem", backgroundColor: "#e6f4ea", padding: "15px", borderRadius: "8px", fontWeight: "600", border: "1px solid #cce8d5" }}>{success}</p>}

        <form onSubmit={handleRegister}>
          <label>Full Name</label>
          <input 
            type="text" 
            placeholder="Enter your full name" 
            required 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label>Aadhaar Number</label>
          <input
            type="text"
            placeholder="12-digit Aadhaar number"
            maxLength="12"
            value={aadhaar}
            onChange={(e) => setAadhaar(e.target.value)}
          />

          <label>Email</label>
          <input 
            type="email" 
            placeholder="Enter your email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Address</label>
          <textarea
            placeholder="Enter your full address (house no, street, village, district)"
            rows="3"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            style={{ resize: "vertical", padding: "10px", borderRadius: "8px", border: "1.5px solid #e5e7eb", fontFamily: "inherit", fontSize: "14px", width: "100%" }}
          />

          <label>Register As</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Villager</option>
            <option value="pds_dealer">PDS Dealer</option>
          </select>

          <label>Password</label>
          <input 
            type="password" 
            placeholder="Create password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label htmlFor="verification-doc">Upload Verification Document (Aadhaar / Address Proof)</label>
          <input 
            id="verification-doc"
            type="file" 
            className="file-input"
            required
            onChange={(e) => setDocument(e.target.files[0])}
            accept=".pdf,image/*"
          />
          <p className="upload-hint">Upload Aadhaar / Address Proof (PDF or Image)</p>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Submitting..." : "Submit for Verification"}
          </button>
          
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <Link to="/login" style={{ color: "#4f46e5", textDecoration: "none" }}>Already have an account? Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
