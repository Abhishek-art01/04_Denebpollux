import React, { useState } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { DashboardProvider } from "./context/DashboardContext.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

function BillingShell() {
  const { isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <DashboardProvider>
      <div className="portal-shell">
        <Sidebar
          collapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((current) => !current)}
        />
        <div className={`workspace-shell ${isSidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/login" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BillingShell />
    </AuthProvider>
  );
}
