import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./Pages/Login/Login";
import Register from "./Pages/Register/Register";
import Dashboard from "./Pages/HomePage/Dashboard";
import Issues from "./Pages/Issues/Issues";
import ReportIssue from "./Pages/ReportIssue/ReportIssue";
import Announcements from "./Pages/Announcements/Announcements";
import Donations from "./Pages/Donations/Donations";
import DonationsDashboard from "./Pages/DonationsDashboard/DonationsDashboard";
import PdsSystem from "./Pages/PdsSystem/PdsSystem";
import PdsSlotBooking from "./Pages/PdsSlotBooking/PdsSlotBooking";
import AdminDashboard from "./Pages/AdminDashboard/AdminDashboard";
import Profile from "./Pages/Profile/Profile";
import WaterRequest from "./Pages/WaterRequest/WaterRequest";
import ElectricityRequest from "./Pages/ElectricityRequest/ElectricityRequest";
import HouseRequest from "./Pages/HouseRequest/HouseRequest";
import Reports from "./Pages/Reports/Reports";
import FundTransparency from "./Pages/FundTransparency/FundTransparency";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* User Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/issues" element={<ProtectedRoute><Issues /></ProtectedRoute>} />
      <Route path="/report-issue" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
      <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
      <Route path="/donations" element={<ProtectedRoute><Donations /></ProtectedRoute>} />
      <Route path="/donations-dashboard" element={<ProtectedRoute><DonationsDashboard /></ProtectedRoute>} />
      <Route path="/pds-system" element={<ProtectedRoute allowedRoles={["user", "admin", "sarpanch", "pds_dealer"]}><PdsSystem /></ProtectedRoute>} />
      <Route path="/pds-slot" element={<ProtectedRoute allowedRoles={["user", "admin", "sarpanch", "pds_dealer"]}><PdsSlotBooking /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={["user", "admin", "sarpanch", "pds_dealer"]}><Profile /></ProtectedRoute>} />
      <Route path="/water-request" element={<ProtectedRoute><WaterRequest /></ProtectedRoute>} />
      <Route path="/electricity-request" element={<ProtectedRoute><ElectricityRequest /></ProtectedRoute>} />
      <Route path="/house-request" element={<ProtectedRoute><HouseRequest /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/funds" element={<ProtectedRoute><FundTransparency /></ProtectedRoute>} />

      {/* Admin + Sarpanch Route — both use same AdminDashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<h2>Page Not Found</h2>} />
    </Routes>
  );
}




