import { Navigate } from "react-router-dom";

// ProtectedRoute: checks if logged in + optionally a required role or allowed roles
export default function ProtectedRoute({ children, requiredRole, allowedRoles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Treat sarpanch same as admin for route access
  const effectiveRole = user.role === 'sarpanch' ? 'admin' : user.role;

  // Handle single requiredRole (backward compatibility for Admin)
  if (requiredRole && effectiveRole !== requiredRole) {
    if (user.role === "pds_dealer") return <Navigate to="/pds-system" replace />;
    if (user.role === "sarpanch") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Handle an array of allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "pds_dealer") return <Navigate to="/pds-system" replace />;
    if (user.role === "sarpanch") return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Block pds_dealer from general dashboard paths
  if (!requiredRole && !allowedRoles && user.role === "pds_dealer") {
    return <Navigate to="/pds-system" replace />;
  }

  // Block sarpanch from villager-only paths — redirect to admin
  if (!requiredRole && !allowedRoles && user.role === "sarpanch") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}
