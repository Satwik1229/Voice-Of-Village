import { useEffect, useState } from "react";
import "./DonationsDashboard.css";

export default function DonationsDashboard() {
  const [donations, setDonations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/donations")
      .then((res) => res.json())
      .then((data) => {
        setDonations(data);

        const sum = data.reduce(
          (acc, item) => acc + Number(item.amount),
          0
        );
        setTotalAmount(sum);

        setLoading(false);
      })
      .catch(() => {
        // Dummy data fallback
        const dummy = [
          {
            id: 1,
            name: "Ramesh",
            amount: 1000,
            paymentMode: "UPI",
            date: "2026-08-10",
            message: "For village development",
          },
          {
            id: 2,
            name: "Sita",
            amount: 2500,
            paymentMode: "Net Banking",
            date: "2026-08-11",
            message: "Happy to contribute",
          },
          {
            id: 3,
            name: "Anil",
            amount: 1500,
            paymentMode: "UPI",
            date: "2026-08-12",
            message: "",
          },
        ];

        setDonations(dummy);
        setTotalAmount(
          dummy.reduce((acc, d) => acc + d.amount, 0)
        );
        setLoading(false);
      });
  }, []);

  return (
    <div className="donations-dashboard">

      {/* HEADER */}
      <div className="donations-header">
        <h1>Donations Dashboard</h1>
        <p>Transparency of village contributions</p>
      </div>

      {/* SUMMARY */}
      <div className="donation-summary">
        <div className="summary-card">
          <span>Total Donations</span>
          <h2>₹ {totalAmount.toLocaleString()}</h2>
        </div>

        <div className="summary-card">
          <span>Total Donors</span>
          <h2>{donations.length}</h2>
        </div>
      </div>

      {/* TABLE */}
      <div className="donations-table-wrapper">
        {loading ? (
          <p className="loading-text">Loading donations...</p>
        ) : (
          <table className="donations-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount (₹)</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Message</th>
              </tr>
            </thead>

            <tbody>
              {donations.map((d) => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td className="amount">₹ {d.amount}</td>
                  <td>{d.paymentMode}</td>
                  <td>{new Date(d.date).toLocaleDateString()}</td>
                  <td>{d.message || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
