import { useEffect, useState } from "react";
import "./Announcements.css";

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/announcements", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch announcements");
        }
        return res.json();
      })
      .then((data) => {
        setAnnouncements(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="announcements-page">
      <div className="announcements-bg" />

      <div className="announcements-content">
        <h1>Village Announcements</h1>
        <p className="subtitle">
          Stay updated with the latest notices and public information
        </p>

        {/* LOADING */}
        {loading && <p className="info-text">Loading announcements...</p>}

        {/* ERROR */}
        {!loading && error && (
          <p className="info-text warning">{error}</p>
        )}

        {/* EMPTY STATE */}
        {!loading && announcements.length === 0 && (
          <p className="info-text">No announcements available</p>
        )}

        {/* ANNOUNCEMENTS */}
        <div className="announcement-list">
          {announcements.map((item) => (
            <div key={item.id} className="announcement-card" style={{ borderLeft: item.priority === 'urgent' ? '4px solid #ef4444' : item.priority === 'high' ? '4px solid #f97316' : '4px solid #3b82f6' }}>
              <div className="card-header">
                <span className="category" style={{ background: item.priority === 'urgent' ? '#fee2e2' : item.priority === 'high' ? '#ffedd5' : '#e0f2fe', color: item.priority === 'urgent' ? '#ef4444' : item.priority === 'high' ? '#f97316' : '#0284c7' }}>
                  {item.priority?.toUpperCase()}
                </span>
                <span className="date">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              <h3>{item.title}</h3>
              <p>{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
