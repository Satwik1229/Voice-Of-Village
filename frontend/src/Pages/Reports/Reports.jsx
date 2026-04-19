import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import "./Reports.css";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("Issues");
  const [issueCategory, setIssueCategory] = useState("General Issues");
  const [timeframe, setTimeframe] = useState("Monthly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);

  const colors = {
    primary: "#3b82f6",
    success: "#22c55e",
    warning: "#eab308",
    danger: "#ef4444",
    purple: "#a855f7",
    teal: "#14b8a6",
  };
  
  const PIE_COLORS = [colors.success, colors.warning, colors.danger, colors.primary];

  const fetchGlobalData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/reports/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.total) {
        setTotalUsers(res.data.total);
      } else if (res.data) {
        setTotalUsers(res.data.count || res.data.totalUsers || 0); // fallback heuristics
      }
    } catch (err) {
      // Fallback if /api/reports/users isn't right, try admin summary
      try {
        const token = localStorage.getItem("token");
        const res2 = await axios.get("http://localhost:5000/api/admin/summary", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res2.data && res2.data.totalUsers !== undefined) {
          setTotalUsers(res2.data.totalUsers);
        }
      } catch (err2) {
        console.error("Failed to fetch total users", err2);
      }
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      if (activeTab === "Issues") {
        if (issueCategory === "General Issues") endpoint = "/api/reports/issues";
        else if (issueCategory === "Water") endpoint = "/api/reports/water";
        else if (issueCategory === "Electricity") endpoint = "/api/reports/electricity";
        else if (issueCategory === "House") endpoint = "/api/reports/house";
        else endpoint = `/api/reports/issues?category=${issueCategory}`;
      } else if (activeTab === "Donations") {
        endpoint = "/api/reports/donations";
      } else if (activeTab === "PDS") {
        endpoint = "/api/reports/pds";
      }

      if (!endpoint) return;
      
      const token = localStorage.getItem("token");
      const separator = endpoint.includes('?') ? '&' : '?';
      const periodParam = timeframe === 'All Time' ? 'all' : timeframe.toLowerCase();
      
      const response = await axios.get(`http://localhost:5000${endpoint}${separator}period=${periodParam}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
    fetchReportData();
  }, [activeTab, issueCategory, timeframe]);

  const getTrendData = () => {
    if (!data) return [];
    if (timeframe === "Weekly") return data.weeklyTrends || [];
    if (timeframe === "Monthly") return data.monthlyTrends || [];
    if (timeframe === "Yearly") return data.yearlyTrends || [];
    if (timeframe === "All Time") return data.allTimeTrends || data.monthlyTrends || [];
    return [];
  };

  const formatTrendData = (trendRows) => {
    return trendRows.map(row => ({
      name: row.week || row.month || row.year || row.period || 'N/A',
      count: row.count || 0,
      amount: row.totalAmount || 0
    }));
  };

  const renderCharts = () => {
    if (loading || !data) {
      return (
        <div className="reports-loading">
          <div className="spinner"></div>
          <p>Analyzing Village Data...</p>
        </div>
      );
    }

    const trendDataRows = getTrendData();
    const formattedTrends = formatTrendData(trendDataRows);

    if (activeTab === "Issues") {
      const isGeneral = issueCategory === "General Issues" || issueCategory === "Road" || issueCategory === "Drainage" || issueCategory === "Temple";
      const statusCounts = (data.statusCounts || []).map(s => ({ name: s.status.toUpperCase(), value: s.count }));
      const barSplitData = isGeneral ? (data.categorySplit || []) : (data.typeSplit || []);
      const splitLabelField = isGeneral ? 'category' : (issueCategory === 'House' ? 'construction_type' : 'problem_type');
      const categoryData = barSplitData.map(s => ({ name: s[splitLabelField] || 'Unknown', count: s.count }));

      return (
        <>
          <div className="reports-summary" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div className="chart-card glass-panel" style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <h3>Total {issueCategory === 'General Issues' ? 'Issues' : issueCategory} {issueCategory === 'General Issues' || isGeneral ? "" : "Requests"}</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#3b82f6' }}>{data.total || 0}</h2>
            </div>
            {isGeneral && (
              <div className="chart-card glass-panel" style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
                <h3>Resolved Percentage</h3>
                <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#22c55e' }}>{data.percentageSolved || 0}%</h2>
              </div>
            )}
          </div>
          <div className="charts-grid">
            <div className="chart-card glass-panel">
              <h3>Status Overview</h3>
              <div className="chart-container" style={{ height: '300px' }}>
                {statusCounts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                        {statusCounts.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <p>No status data</p>}
              </div>
            </div>
            <div className="chart-card glass-panel span-2">
              <h3>Category Breakdown</h3>
              <div className="chart-container" style={{ height: '300px' }}>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill={colors.primary} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p>No category data</p>}
              </div>
            </div>
            <div className="chart-card glass-panel span-full">
              <h3>{timeframe} Trend</h3>
              <div className="chart-container" style={{ height: '300px' }}>
                {formattedTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="count" stroke={colors.purple} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : <p>No trend data</p>}
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === "Donations") {
      const topDonorsData = (data.topDonors || []).map(s => ({ name: s.name, amount: s.totalAmount }));

      return (
        <>
          <div className="reports-summary" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div className="chart-card glass-panel" style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <h3>Total Funds Collected</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#22c55e' }}>₹{data.totalAmount || 0}</h2>
            </div>
            <div className="chart-card glass-panel" style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <h3>Total Donations Count</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#3b82f6' }}>{data.totalDonations || 0}</h2>
            </div>
          </div>
          <div className="charts-grid">
            <div className="chart-card glass-panel span-2">
              <h3>{timeframe} Trend (₹)</h3>
              <div className="chart-container" style={{ height: '300px' }}>
                {formattedTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="amount" fill={colors.success} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p>No trend data available.</p>}
              </div>
            </div>
            <div className="chart-card glass-panel">
              <h3>Top Contributors</h3>
              <div className="chart-container" style={{ height: '300px' }}>
                {topDonorsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topDonorsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="amount" fill={colors.teal} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p>No donor data available.</p>}
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === "PDS") {
      const pieData = [
        { name: "Collected", value: data.collectedCount || 0 },
        { name: "Pending Pickup", value: data.bookedCount || 0 },
        { name: "Cancelled", value: data.cancelledCount || 0 },
      ].filter(d => d.value > 0); // hide zero-value slices

      return (
        <>
          <div className="reports-summary" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div className="chart-card glass-panel" style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <h3>PDS Members</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#3b82f6' }}>{data.pdsMembers || 0}</h2>
            </div>
            <div className="chart-card glass-panel" style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <h3>Total Bookings</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#a855f7' }}>{data.totalBookings || 0}</h2>
            </div>
            <div className="chart-card glass-panel" style={{ flex: 1, textAlign: 'center', padding: '20px' }}>
              <h3>Collection Rate</h3>
              <h2 style={{ fontSize: '2.5rem', margin: '10px 0', color: '#22c55e' }}>{data.collectionRate || 0}%</h2>
            </div>
          </div>
          <div className="charts-grid">
            <div className="chart-card glass-panel">
              <h3>Collection Status</h3>
              <div className="chart-container" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                      <Cell fill={colors.success} />
                      <Cell fill={colors.danger} />
                      <Cell fill={colors.warning} />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="chart-card glass-panel span-2">
              <h3>{timeframe} Booking Rate</h3>
              <div className="chart-container" style={{ height: '300px' }}>
                {formattedTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formattedTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill={colors.purple} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p>No trend data available.</p>}
              </div>
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <div className="reports-page">
      <div className="reports-bg"></div>
      
      <div className="reports-content container">
        <div className="reports-header glass-panel" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1>Village Metrics & Analytics</h1>
            <p>Interactive data visualizations for better village governance</p>
          </div>
          <div style={{ textAlign: "right" }}>
             <h3 style={{ color: "#94a3b8", margin: 0, fontSize: "1rem" }}>Total Registered Users</h3>
             <h2 style={{ color: "#3b82f6", margin: "5px 0 0 0", fontSize: "2rem" }}>{totalUsers}</h2>
          </div>
        </div>

        <div className="reports-filters glass-panel" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '15px', marginBottom: '20px', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="reports-tabs" style={{ display: 'flex', gap: '10px' }}>
            {["Issues", "Donations", "PDS"].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => { setActiveTab(tab); setIssueCategory("General Issues"); setTimeframe("Monthly"); }}
                style={{
                  padding: '10px 20px',
                  background: activeTab === tab ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  border: `1px solid ${activeTab === tab ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
                  color: activeTab === tab ? '#fff' : '#94a3b8',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="filter-dropdowns" style={{ display: 'flex', gap: '15px' }}>
            {activeTab === "Issues" && (
              <select 
                value={issueCategory} 
                onChange={(e) => setIssueCategory(e.target.value)}
                style={{ cursor: 'pointer', padding: '10px 15px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', outline: 'none', fontWeight: '500' }}
              >
                <option value="General Issues">General Issues</option>
                <option value="Water">Water Requests</option>
                <option value="Electricity">Electricity Requests</option>
                <option value="House">House Requests</option>
                <option value="Road">Road Issues</option>
                <option value="Drainage">Drainage Issues</option>
                <option value="Temple">Temple Issues</option>
              </select>
            )}
            
            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value)}
              style={{ cursor: 'pointer', padding: '10px 15px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', outline: 'none', fontWeight: '500' }}
            >
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="All Time">All Time</option>
            </select>
          </div>
        </div>

        <div className="reports-dashboard">
          {renderCharts()}
        </div>
      </div>
    </div>
  );
}
