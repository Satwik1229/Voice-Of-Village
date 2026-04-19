import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";
import logo from "../../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === "admin" || data.user.role === "sarpanch") {
          navigate("/admin");
        } else if (data.user.role === "pds_dealer") {
          navigate("/pds-system");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-content">
        <h1>
          Empowering Villages<br />
          through Transparency
        </h1>
        <p>Track funds, report issues, donate to village development.</p>
      </div>

      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="Village Logo" />
          <div>
            <h2>Village Funds & Transparency</h2>
            <span>Management System</span>
          </div>
        </div>

        <div className="login-tab">
          <span>Login</span>
        </div>

        {error && <p style={{ color: "red", textAlign: "center", marginBottom: "1rem" }}>{error}</p>}

        <form onSubmit={handleLogin}>
          <label>Login as</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="user">Villager</option>
            <option value="admin">Admin</option>
            <option value="sarpanch">Sarpanch</option>
            <option value="pds_dealer">PDS Dealer</option>
          </select>

          <label>Email</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
          />

          <label>Password</label>
          <div style={{ position: "relative" }}>
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              style={{ width: "100%", paddingRight: "40px", boxSizing: "border-box" }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ 
                position: "absolute", 
                right: "10px", 
                top: "50%", 
                transform: "translateY(-50%)", 
                background: "none", 
                border: "none", 
                cursor: "pointer", 
                fontSize: "1.2rem",
                color: "#6b7280"
              }}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <button type="submit" className="login-btn">Login</button>

          <p className="forgot">Forgot password?</p>

          <div className="signup">
            <span>New to the system?</span>
            <Link to="/register"><button type="button">Create Account</button></Link>
          </div>
        </form>
      </div>
    </div>
  );
}
