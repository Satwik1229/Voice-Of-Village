import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportIssue.css";

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    location: "",
    image: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const data = new FormData();
    data.append("title", formData.title);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("location", formData.location);

    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/issues/submit", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Issue submitted successfully! Redirecting...");
        setTimeout(() => navigate("/issues"), 1500);
      } else {
        setError(result.message || "Failed to report issue. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error. Make sure you are logged in and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="report-layout">
      <div className="bg-image"></div>

      <div className="content-wrapper">
        <div className="report-card">
          <h2>Report an Issue</h2>
          <p className="subtitle">
            Help improve village infrastructure by reporting issues
          </p>

          {error && <p style={{ color: "red", marginBottom: "1rem", fontWeight: "bold" }}>{error}</p>}
          {success && <p style={{ color: "green", marginBottom: "1rem", fontWeight: "bold" }}>{success}</p>}

          <form className="report-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Issue Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Short issue title"
                required
              />
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                <option>Water</option>
                <option>Electricity</option>
                <option>Road</option>
                <option>Drainage</option>
                <option>Temple</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the issue"
                required
              />
            </div>

            <div className="form-group">
              <label>Upload Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Street / Ward / Landmark"
              />
            </div>

            <button type="submit" className="submit-btn">
              Submit Issue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
