import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./PdsSlotBooking.css";

const TIME_SLOTS = [
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
];

const MONTHLY_QUOTA = {
  Rice: 5,
  Wheat: 3,
};

export default function PdsSlotBooking() {
  const { state } = useLocation();
  const selectedItem = state?.selectedItem;

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isDealer = user.role === "pds_dealer";
  const userId = user.id;

  const [pdsNumber, setPdsNumber] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [bookingQuantity, setBookingQuantity] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const quantityMap = {
    "Rice": 35,
    "Wheat": 35,
    "Sugar": 1,
    "Kerosene": 3,
    "Salt": 1,
    "Pulses (Dal)": 2,
    "Edible Oil": 1
  };

  useEffect(() => {
    if (selectedItem) {
      const defaultQty = quantityMap[selectedItem.item] || 1;
      setBookingQuantity(defaultQty);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (userId) fetchBookings();
  }, [userId]);

  const fetchBookings = () => {
    fetch(`http://localhost:5000/api/pds/bookings?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => console.error("Failed to fetch bookings:", err));
  };

  const isHoliday = (d) => {
    const day = new Date(d).getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const bookSlot = async () => {
    if (isDealer) {
      alert("Dealers cannot book slots.");
      return;
    }

    if (!selectedItem || !pdsNumber || !date || !slot || !bookingQuantity) {
      alert("Please fill all details");
      return;
    }

    if (bookingQuantity <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (isHoliday(date)) {
      alert("Saturday & Sunday are holidays");
      return;
    }

    const alreadyBooked = bookings.some(
      (b) => b.item === selectedItem.item && b.status === "BOOKED"
    );

    if (alreadyBooked) {
      alert("You already have an active booking for this item");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/pds/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          item: selectedItem.item,
          quantity: `${bookingQuantity} Kg`,
          date: date,
          timeSlot: slot,
          pdsNumber: pdsNumber
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("✅ Slot booked successfully! Stock reserved. Returning to portal...");
        // Auto-redirect to System page after 2 seconds to see the updated stock
        setTimeout(() => {
          navigate("/pds-system");
        }, 2000);
      } else {
        alert(data.message || "Booking failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    }
  };

  /* CANCEL BOOKING */
  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirmCancel) return;

    try {
      const response = await fetch(`http://localhost:5000/api/pds/bookings/${bookingId}/cancel`, {
        method: "PUT",
      });

      if (response.ok) {
        fetchBookings(); // Refresh list after cancellation
      } else {
        alert("Failed to cancel booking");
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
    }
  };

  return (
    <div className="pds-slot-page">
      <div className="pds-bg"></div>

      {/* TOPBAR (Different for Dealer vs Villager) */}
      <header className={`pds-topbar ${!isDealer ? 'villager-topbar' : ''}`}>
        <h3>PDS Slot Booking</h3>
        <nav className="pds-nav">
          <button className="back-btn" onClick={() => navigate("/pds-system")}>
            ← Back to PDS Home
          </button>
        </nav>
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
                localStorage.clear(); 
                navigate("/login", { replace: true }); 
              }}>
                🚪 Logout
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="pds-wrapper">
        {/* LEFT: FORM */}
        <div className="booking-form">
          <h1>PDS Slot Booking</h1>

          {selectedItem && (
            <div className="selected-item">
              <p><strong>Item:</strong> {selectedItem.item}</p>
              <p><strong>Stock Available:</strong> {selectedItem.quantity}</p>
              <p><strong>Quantity to Book:</strong> {bookingQuantity} {selectedItem.item.includes("Oil") || selectedItem.item.includes("Kero") ? "Litres" : "Kg"}</p>
            </div>
          )}

          <label>PDS Number</label>
          <input
            value={pdsNumber}
            onChange={(e) => setPdsNumber(e.target.value)}
            placeholder="Enter PDS Number"
          />

          <label>Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label>Select Time Slot</label>
          <select value={slot} onChange={(e) => setSlot(e.target.value)}>
            <option value="">Choose slot</option>
            {TIME_SLOTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <button onClick={bookSlot} disabled={isDealer}>
            {isDealer ? "Dealers Cannot Book" : "Confirm Booking"}
          </button>

          {successMsg && <p className="success">{successMsg}</p>}
        </div>

        {/* RIGHT: HISTORY */}
        <div className="booking-history">
          <h2>My Bookings</h2>

          {bookings.length === 0 ? (
            <p>No previous bookings found.</p>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="booking-card">
                <div className="booking-top">
                  <span className="item">{b.item} ({b.quantity})</span>
                  <span className={`status ${b.status.toLowerCase()}`}>
                    {b.status}
                  </span>
                </div>

                <p><strong>Date:</strong> {new Date(b.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {b.time_slot}</p>

                {b.status === "BOOKED" && (
                  <>
                    <p className="otp">
                      OTP: <strong>{b.otp}</strong>
                    </p>
                    <QRCodeSVG value={b.qr_data} width={110} height={110} />

                    <button
                      className="cancel-btn"
                      onClick={() => cancelBooking(b.id)}
                    >
                      Cancel Booking
                    </button>
                  </>
                )}

                {b.status === "CANCELLED" && (
                  <p className="cancelled-msg">
                    ❌ Booking Cancelled
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
