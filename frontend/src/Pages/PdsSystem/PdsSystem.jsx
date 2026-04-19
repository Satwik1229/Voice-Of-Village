import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PdsSystem.css";

export default function PdsSystem() {
  const [pdsItems, setPdsItems] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editAvailability, setEditAvailability] = useState("Available");
  const [dealerBookings, setDealerBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [otpInputs, setOtpInputs] = useState({});

  // Card type state
  const [cardInfo, setCardInfo] = useState({ card_type: null, family_members: 1 });
  const [showCardSetup, setShowCardSetup] = useState(false);
  const [cardTypeInput, setCardTypeInput] = useState("PHH");
  const [familyMembersInput, setFamilyMembersInput] = useState(1);
  const [savingCard, setSavingCard] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const isDealer = user.role === "pds_dealer";
  const isVillager = user.role === "user";

  useEffect(() => {
    if (isVillager) {
      fetchCardInfo();
    }
    fetchItems();
    if (isDealer) {
      fetchDealerBookings();
    } else if (user.id) {
      fetchUserBookings();
    }
  }, [isDealer, user.id]);

  const fetchCardInfo = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/pds/card-info", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCardInfo(data);
      if (!data.card_type) {
        setShowCardSetup(true); // Show setup modal if not set
      }
    } catch (err) {
      console.error("Error fetching card info:", err);
    }
  };

  const saveCardInfo = async () => {
    setSavingCard(true);
    try {
      const res = await fetch("http://localhost:5000/api/pds/card-info", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ card_type: cardTypeInput, family_members: parseInt(familyMembersInput) })
      });
      const data = await res.json();
      if (res.ok) {
        setCardInfo({ card_type: cardTypeInput, family_members: parseInt(familyMembersInput) });
        setShowCardSetup(false);
        fetchItems(); // Refresh items with quota info
      } else {
        alert(data.message || "Failed to save card info");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setSavingCard(false);
    }
  };

  const fetchItems = () => {
    fetch("http://localhost:5000/api/pds", {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.json())
      .then((data) => setPdsItems(data))
      .catch((err) => console.error("Error fetching PDS items:", err));
  };

  const fetchDealerBookings = () => {
    fetch("http://localhost:5000/api/pds/bookings")
      .then((res) => res.json())
      .then((data) => setDealerBookings(data))
      .catch((err) => console.error("Error fetching PDS bookings:", err));
  };

  const fetchUserBookings = () => {
    fetch(`http://localhost:5000/api/pds/bookings?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => setUserBookings(data))
      .catch((err) => console.error("Error fetching user bookings:", err));
  };


  const handleVerifyOtp = async (bookingId) => {
    const otp = otpInputs[bookingId];
    if (!otp) {
      alert("Please enter the OTP");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/pds/bookings/${bookingId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        fetchDealerBookings(); // Refresh list to show 'COLLECTED'
        setOtpInputs((prev) => ({ ...prev, [bookingId]: "" })); // Clear input
      } else {
        alert(data.message || "Verification failed");
      }
    } catch (err) {
      console.error("Error verifying OTP", err);
      alert("Network error. Please try again.");
    }
  };

  const bookSlot = (item) => {
    navigate("/pds-slot", {
      state: { selectedItem: item },
    });
  };

  const startEditing = (item) => {
    setEditingItem(item.id);
    setEditQuantity(item.quantity);
    setEditPrice(item.price);
    setEditAvailability(item.availability);
  };

  const saveEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/pds/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: editQuantity,
          price: editPrice,
          availability: editAvailability,
        }),
      });

      if (response.ok) {
        setEditingItem(null);
        fetchItems(); // Refresh items
      } else {
        alert("Failed to update item");
      }
    } catch (err) {
      console.error("Error updating item", err);
    }
  };

  return (
    <div className="pds-page">
      <div className="pds-bg"></div>

      {/* CARD TYPE SETUP MODAL — shows on first visit if no card type set */}
      {showCardSetup && isVillager && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '16px', padding: '36px', maxWidth: '480px', width: '90%', color: '#fff'
          }}>
            <h2 style={{ marginBottom: '8px', color: '#60a5fa' }}>🌾 Setup Your Ration Card</h2>
            <p style={{ color: '#94a3b8', marginBottom: '24px', fontSize: '0.9rem' }}>
              This information is saved permanently and determines your monthly ration quota. You only need to set this once.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Ration Card Type</label>
              <select value={cardTypeInput} onChange={e => setCardTypeInput(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', fontSize: '1rem' }}>
                <option value="PHH">PHH — Priority Household (BPL)</option>
                <option value="AAY">AAY — Antyodaya Anna Yojana (Poorest of Poor)</option>
                <option value="APL">APL — Above Poverty Line</option>
              </select>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Number of Family Members</label>
              <input type="number" min="1" max="20" value={familyMembersInput}
                onChange={e => setFamilyMembersInput(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', fontSize: '1rem', boxSizing: 'border-box' }} />
              {cardTypeInput === 'PHH' && (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
                  💡 PHH quota = 6 Kg Rice × {familyMembersInput} members = {6 * familyMembersInput} Kg/month
                </p>
              )}
              {cardTypeInput === 'AAY' && (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '6px' }}>
                  💡 AAY quota = 35 Kg Rice per family per month (regardless of family size)
                </p>
              )}
            </div>

            <button onClick={saveCardInfo} disabled={savingCard}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}>
              {savingCard ? 'Saving...' : '💾 Save & Continue'}
            </button>
          </div>
        </div>
      )}

      {/* TOPBAR (Different for Dealer vs Villager) */}
      <header className={`pds-topbar ${!isDealer ? 'villager-topbar' : ''}`}>
        <h3>PDS System {isDealer ? "(Dealer View)" : ""}</h3>
        
        {/* If Villager, allow going back to Dashboard */}
        {!isDealer && (
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        )}

        <div className="user-account" onClick={() => setShowMenu(!showMenu)}>
          <div className="avatar">
            {user.name?.charAt(0) || "P"}
          </div>
          <span className="username">
            {user.name || "PDS User"}
          </span>
          {showMenu && (
            <div className="account-menu">
              <div onClick={(e) => { 
                e.stopPropagation(); 
                setShowMenu(false);
                navigate("/profile"); 
              }}>
                👤 Profile
              </div>
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

      <div className="pds-content">
        <h1>Public Distribution System</h1>
        <p className="subtitle">
          {isDealer 
            ? "Manage Ration Inventory and View Bookings" 
            : "Select an item and book your ration slot"}
        </p>

        {/* CARD INFO BANNER — for villagers with a card type set */}
        {isVillager && cardInfo.card_type && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: '10px', padding: '12px 20px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px'
          }}>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <span>🪪 <strong>Card:</strong> {cardInfo.card_type}</span>
              <span>👨‍👩‍👧‍👦 <strong>Family:</strong> {cardInfo.family_members} members</span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Quota resets every 1st of the month</span>
            </div>
            <button onClick={() => { setCardTypeInput(cardInfo.card_type); setFamilyMembersInput(cardInfo.family_members); setShowCardSetup(true); }}
              style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
              ✏️ Update
            </button>
          </div>
        )}

        <div className="pds-table-wrapper">
          <table className="pds-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>In Stock</th>
                <th>Price</th>
                <th>Availability</th>
                {isVillager && cardInfo.card_type && <th>Monthly Quota</th>}
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {pdsItems.map((item) => (
                <tr key={item.id} style={item.quotaExhausted ? { opacity: 0.6 } : {}}>
                  <td><strong>{item.item}</strong></td>
                  
                  {/* Quantity */}
                  <td>
                    {editingItem === item.id ? (
                      <input 
                        type="text" 
                        value={editQuantity} 
                        onChange={(e) => setEditQuantity(e.target.value)} 
                        className="edit-input"
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>

                  {/* Price */}
                  <td>
                    {editingItem === item.id ? (
                      <input 
                        type="text" 
                        value={editPrice} 
                        onChange={(e) => setEditPrice(e.target.value)} 
                        className="edit-input"
                      />
                    ) : (
                      item.price
                    )}
                  </td>

                  {/* Availability */}
                  <td>
                    {editingItem === item.id ? (
                      <select 
                        value={editAvailability} 
                        onChange={(e) => setEditAvailability(e.target.value)}
                        className="edit-select"
                      >
                        <option value="Available">Available</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    ) : (
                      <span className={`status ${item.availability === 'Available' ? 'available' : 'unavailable'}`}>
                        {item.availability}
                      </span>
                    )}
                  </td>

                  {/* Action Buttons */}
                  {isDealer ? (
                    <td>
                      {editingItem === item.id ? (
                        <div className="action-buttons">
                          <button className="save-btn" onClick={() => saveEdit(item.id)}>Save</button>
                          <button className="cancel-edit-btn" onClick={() => setEditingItem(null)}>Cancel</button>
                        </div>
                      ) : (
                        <button className="edit-btn" onClick={() => startEditing(item)}>
                          ✎ Edit
                        </button>
                      )}
                    </td>
                  ) : (
                    <>
                      {/* Monthly Quota Cell (villager only) */}
                      {isVillager && cardInfo.card_type && (
                        <td>
                          {item.remainingQuota === null ? (
                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No limit</span>
                          ) : (
                            <span style={{ color: item.quotaExhausted ? '#ef4444' : item.remainingQuota < 3 ? '#eab308' : '#22c55e', fontWeight: '600' }}>
                              {item.remainingQuota} / {item.monthlyQuota} {item.unit}
                              {item.quotaExhausted && <span style={{ display: 'block', fontSize: '0.75rem', color: '#ef4444' }}>Quota Full</span>}
                            </span>
                          )}
                        </td>
                      )}
                      <td>
                        <button
                          className="book-btn"
                          onClick={() => bookSlot(item)}
                          disabled={item.availability === 'Out of Stock' || item.quotaExhausted}
                          title={item.quotaExhausted ? 'Monthly quota exhausted' : ''}
                        >
                          {item.availability === 'Out of Stock' ? 'Out of Stock' : item.quotaExhausted ? '🚫 Quota Full' : 'Book Slot'}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* DEALER VIEW: RECENT BOOKINGS */}
        {isDealer && (
          <div className="dealer-bookings-section">
            <h2>Recent Villager Bookings</h2>
            <div className="pds-table-wrapper">
              <table className="pds-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Villager Name</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dealerBookings.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No bookings found.</td>
                    </tr>
                  ) : (
                    dealerBookings.map((b) => (
                      <tr key={b.id}>
                        <td>{b.id}</td>
                        <td>{b.user_name}</td>
                        <td>{b.item}</td>
                        <td>{b.quantity}</td>
                        <td>{new Date(b.date).toLocaleDateString()}</td>
                        <td>{b.time_slot}</td>
                        <td>
                          <span className={`status ${b.status.toLowerCase()}`}>
                            {b.status}
                          </span>
                        </td>
                        <td>
                          {b.status === "BOOKED" ? (
                            <div className="otp-verify-box">
                              <input 
                                type="text" 
                                placeholder="Enter OTP" 
                                className="otp-input-tiny"
                                value={otpInputs[b.id] || ""}
                                onChange={(e) => setOtpInputs({ ...otpInputs, [b.id]: e.target.value })}
                              />
                              <button 
                                className="verify-small-btn" 
                                onClick={() => handleVerifyOtp(b.id)}
                              >
                                Verify
                              </button>
                            </div>
                          ) : (
                            <span className="action-done">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* VILLAGER VIEW: MY BOOKINGS history */}
        {!isDealer && userBookings.length > 0 && (
          <div className="user-bookings-container">
            {/* 1. UPCOMING BOOKINGS (Active) */}
            {userBookings.some((b) => b.status === "BOOKED") && (
              <div className="bookings-section-upcoming">
                <h2 className="pds-sec-title">My Upcoming Bookings</h2>
                <div className="bookings-grid">
                  {userBookings
                    .filter((b) => b.status === "BOOKED")
                    .map((b) => (
                      <div key={b.id} className="user-booking-card upcoming">
                        <div className="card-header">
                          <span className="item-name">{b.item}</span>
                          <span className="status-badge booked">{b.status}</span>
                        </div>
                        <div className="card-body">
                          <p>Qty: <strong>{b.quantity}</strong></p>
                          <p>Date: <strong>{new Date(b.date).toLocaleDateString()}</strong></p>
                          <p>Time: <strong>{b.time_slot}</strong></p>
                        </div>
                        <button className="view-details-btn" onClick={() => navigate("/pds-slot")}>
                          View Details (OTP/QR)
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 2. BOOKING HISTORY (Completed/Cancelled) */}
            {userBookings.some((b) => b.status !== "BOOKED") && (
              <div className="bookings-section-history">
                <h2 className="pds-sec-title">Booking History</h2>
                <div className="history-list">
                  <div className="history-header">
                    <span>Item</span>
                    <span>Quantity</span>
                    <span>Date</span>
                    <span>Status</span>
                  </div>
                  {userBookings
                    .filter((b) => b.status !== "BOOKED")
                    .map((b) => (
                      <div key={b.id} className="history-row">
                        <span className="h-item">{b.item}</span>
                        <span className="h-qty">{b.quantity}</span>
                        <span className="h-date">{new Date(b.date).toLocaleDateString()}</span>
                        <span className={`h-status ${b.status.toLowerCase()}`}>{b.status}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
