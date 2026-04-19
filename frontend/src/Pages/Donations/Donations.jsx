import { useState } from "react";
import "./Donations.css";

export default function Donations() {
  const [donation, setDonation] = useState({
    name: "",
    email: "",
    amount: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDonation({ ...donation, [name]: value });
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create order
      const orderRes = await fetch("http://localhost:5000/api/donations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donation),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.message || "Failed to create order");

      // 2. Initializing Razorpay Checkout
      const keyRes = await fetch("http://localhost:5000/api/donations/key");
      const keyData = await keyRes.json();
      
      const options = {
        key: keyData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Voice of Village",
        description: "Donation",
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 3. Verify payment signature
            const verifyRes = await fetch("http://localhost:5000/api/donations/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              alert("Payment successful! Thank you for your donation ❤️");
              setDonation({ name: "", email: "", amount: "", message: "" });
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Verification Error:", error);
            alert("Payment verified but failed to save on our server.");
          }
        },
        prefill: {
          name: donation.name,
          email: donation.email,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
          alert("Payment Failed: " + response.error.description);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      alert(error.message || "Server error. Try later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donations-page">
      {/* Background */}
      <div className="donations-bg"></div>

      {/* Content */}
      <div className="donations-content">
        <div className="donation-card">
          <h1>Support Your Village</h1>
          <p className="subtitle">
            Your contribution helps improve village infrastructure and welfare
          </p>

          <form onSubmit={handleDonate} className="donation-form">
            <div className="form-group">
              <label>Donor Name</label>
              <input
                type="text"
                name="name"
                value={donation.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>

            <div className="form-group">
              <label>Donor Email</label>
              <input
                type="email"
                name="email"
                value={donation.email}
                onChange={handleChange}
                placeholder="Your email address"
                required
              />
            </div>

            <div className="form-group">
              <label>Donation Amount (₹)</label>
              <input
                type="number"
                name="amount"
                value={donation.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Message (optional)</label>
              <textarea
                name="message"
                value={donation.message}
                onChange={handleChange}
                placeholder="Leave a message for the village"
                rows="3"
              ></textarea>
            </div>

            <button type="submit" className="donate-btn" disabled={loading}>
              {loading ? "Processing..." : "Donate Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
