import React from "react";
import { useAuth } from "./auth.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-center">
        <p className="muted">Loading MiniLedger…</p>
      </div>
    );
  }

  return user ? <DashboardPage /> : <LoginPage />;
}
