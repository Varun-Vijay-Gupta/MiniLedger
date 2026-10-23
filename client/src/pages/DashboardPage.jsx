import React, { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import LoanForm from "../components/LoanForm.jsx";
import LoanList from "../components/LoanList.jsx";
import SummaryCards from "../components/SummaryCards.jsx";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loans, setLoans] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [summaryData, loanData] = await Promise.all([api("/api/summary"), api("/api/loans")]);
    setSummary(summaryData);
    setLoans(loanData.loans);
  }, []);

  useEffect(() => {
    load()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [load]);

  async function refresh() {
    setError("");
    try {
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="layout">
      <header className="topbar">
        <div>
          <h1>MiniLedger</h1>
          <p className="muted">Signed in as {user.phone}</p>
        </div>
        <button type="button" className="button-secondary" onClick={logout}>
          Log out
        </button>
      </header>

      {error ? <p className="error">{error}</p> : null}
      {loading ? <p className="muted">Loading dashboard…</p> : null}

      {!loading ? (
        <>
          <SummaryCards summary={summary} />
          <LoanForm onCreated={refresh} />
          <LoanList loans={loans} onChanged={refresh} />
        </>
      ) : null}
    </div>
  );
}
