import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Issues.css";

/* Dummy fallback data */
const dummyIssues = [
  {
    id: 1,
    title: "No water supply",
    category: "Water",
    description: "No water supply for the last 3 days in Ward 4.",
    status: "Pending",
    reportedBy: "Ramesh",
    date: "2026-01-20",
    images: [
      "https://via.placeholder.com/600x400?text=Water+Issue+1",
      "https://via.placeholder.com/600x400?text=Water+Issue+2",
    ],
  },
  {
    id: 2,
    title: "Street lights not working",
    category: "Electricity",
    description: "Street lights near temple road are not working.",
    status: "In Progress",
    reportedBy: "Sita",
    date: "2026-01-18",
    images: [
      "https://via.placeholder.com/600x400?text=Electricity+Issue",
    ],
  },
  {
    id: 3,
    title: "Road damaged",
    category: "Road",
    description: "Large potholes on the main road causing accidents.",
    status: "Resolved",
    reportedBy: "Anil",
    date: "2026-01-15",
    images: [],
  },
];

const categories = ["All", "Water", "Electricity", "Road", "Temples", "Drainage"];

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeIssue, setActiveIssue] = useState(null);
  const [showImages, setShowImages] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/issues", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        const formattedIssues = data.map(issue => ({
          ...issue,
          reportedBy: issue.submitted_by_name || "Unknown",
          date: new Date(issue.created_at).toLocaleDateString(),
          images: issue.image_url ? [`http://localhost:5000/uploads/${issue.image_url}`] : []
        }));
        setIssues(formattedIssues);
      })
      .catch(() => setIssues(dummyIssues));
  }, []);

  const filteredIssues =
    selectedCategory === "All"
      ? issues
      : issues.filter(
          (i) => (i.category || "").toLowerCase() === selectedCategory.toLowerCase()
        );

  return (
    <div className="issues-layout">

      {/* CATEGORY SIDEBAR */}
      <aside className="issues-sidebar">
        <h3>Categories</h3>
        {categories.map((cat) => (
          <div
            key={cat}
            className={`category ${selectedCategory === cat ? "active" : ""}`}
            onClick={() => {
              setSelectedCategory(cat);
              setActiveIssue(null);
            }}
          >
            {cat}
          </div>
        ))}
      </aside>

      {/* ISSUES LIST */}
      <main className="issues-content">
        <div className="issues-header">
          <h2>{selectedCategory} Issues</h2>
          <button className="report-btn" onClick={() => navigate("/report-issue")}>+ Report Issue</button>
        </div>

        <div className="issues-list">
          {filteredIssues.map((issue) => (
            <div
              key={issue.id}
              className="issue-card"
              onMouseEnter={() => setActiveIssue(issue)}
              onClick={() => setActiveIssue(issue)}
            >
              <h4>{issue.title}</h4>
              <p>{issue.description}</p>

              <div className="issue-meta">
                <span
                  className={`status ${(issue.status || "pending")
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {issue.status}
                </span>
                <span>{issue.category}</span>

                {issue.images?.length > 0 && (
                  <button
                    className="view-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIssue(issue);
                      setShowImages(true);
                    }}
                  >
                    View
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* DETAILS CARD */}
      <aside className="issue-details-wrapper">
        <div className={`issue-details ${activeIssue ? "show" : ""}`}>
          {activeIssue ? (
            <>
              <h3>{activeIssue.title}</h3>

              <div className="detail-row">
                <span>Category</span>
                <strong>{activeIssue.category}</strong>
              </div>

              <div className="detail-row">
                <span>Status</span>
                <strong>{activeIssue.status}</strong>
              </div>

              <div className="detail-row">
                <span>Reported By</span>
                <strong>{activeIssue.reportedBy}</strong>
              </div>

              <div className="detail-row">
                <span>Date</span>
                <strong>{activeIssue.date}</strong>
              </div>

              <p className="detail-desc">
                {activeIssue.description}
              </p>

              {activeIssue.images && activeIssue.images.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <span style={{ fontWeight: "600", fontSize: "0.85rem", color: "#666" }}>Uploaded Image</span>
                  <img
                    src={activeIssue.images[0]}
                    alt="Issue"
                    style={{
                      width: "100%",
                      borderRadius: "8px",
                      marginTop: "0.5rem",
                      objectFit: "cover",
                      maxHeight: "200px"
                    }}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="hover-hint">
              Hover over an issue to view details
            </p>
          )}
        </div>
      </aside>

      {/* IMAGE MODAL */}
      {showImages && activeIssue && (
        <div className="image-modal">
          <div className="image-modal-content">
            <span
              className="close-btn"
              onClick={() => setShowImages(false)}
            >
              ×
            </span>

            <h3>Issue Images</h3>

            <div className="image-grid">
              {activeIssue.images.length > 0 ? (
                activeIssue.images.map((img, index) => (
                  <img key={index} src={img} alt="Issue" />
                ))
              ) : (
                <p>No images available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
