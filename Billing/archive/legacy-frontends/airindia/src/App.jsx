import React from "react";
import { Routes, Route } from "react-router-dom";
import { DashboardProvider } from "./context/DashboardContext.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";

export default function App() {
  return (
    <DashboardProvider>
      <div className="app-shell">
        <Navbar />
        <div className="app-body">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </DashboardProvider>
  );
}
