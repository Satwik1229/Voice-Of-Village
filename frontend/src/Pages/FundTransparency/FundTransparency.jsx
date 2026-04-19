import { useEffect, useState } from "react";
import "./FundTransparency.css";

export default function FundTransparency() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/funds", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => res.json())
      .then((data) => {
        setDocuments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="funds-page">
      <div className="funds-bg" />

      <div className="funds-content">
        <h1>Village Fund Transparency</h1>
        <p className="subtitle">
          Access all financial records, audit reports, and budget details.
        </p>

        {loading && <p style={{color: 'white'}}>Loading records...</p>}
        {!loading && documents.length === 0 && <p style={{color: 'white'}}>No records found.</p>}

        <div className="fund-list">
          {documents.map((doc) => (
            <div key={doc.id} className="fund-card">
              <div className="card-header">
                <span className="fund-category">{doc.category}</span>
                <span className="fund-date">{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
              
              <h3>{doc.title}</h3>
              {doc.financial_year && (
                <div className="fy-tag">📅 FY: {doc.financial_year}</div>
              )}
              {doc.description && <p>{doc.description}</p>}
              
              <a 
                href={`http://localhost:5000/uploads/${doc.document_url}`} 
                target="_blank" 
                rel="noreferrer" 
                className="view-btn"
              >
                View Document
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
