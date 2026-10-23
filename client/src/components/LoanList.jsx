import React, { useState } from "react";
import { api } from "../api.js";

function formatRupees(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function LoanList({ loans, onChanged }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function markRepaid(id) {
    setBusyId(id);
    setError("");
    try {
      await api(`/api/loans/${id}/repay`, { method: "PATCH" });
      await onChanged();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="card">
      <h2>Loans</h2>
      {error ? <p className="error">{error}</p> : null}
      {loans.length === 0 ? (
        <p className="muted">No loans yet. Add one above.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Friend</th>
                <th>Amount</th>
                <th>Due</th>
                <th>Status</th>
                <th>Receipt</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan.id} className={`row-${loan.status}`}>
                  <td data-label="Friend">{loan.friend_name}</td>
                  <td data-label="Amount">{formatRupees(loan.amount)}</td>
                  <td data-label="Due">{formatDate(loan.due_date)}</td>
                  <td data-label="Status">
                    <span className={`status status-${loan.status}`}>{loan.status}</span>
                  </td>
                  <td data-label="Receipt">
                    {loan.receipt_path ? (
                      <a href={loan.receipt_path} target="_blank" rel="noreferrer">
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td data-label="Action">
                    {loan.repaid ? (
                      <span className="muted">{formatDate(loan.repaid_at)}</span>
                    ) : (
                      <button
                        type="button"
                        className="button-secondary"
                        disabled={busyId === loan.id}
                        onClick={() => markRepaid(loan.id)}
                      >
                        {busyId === loan.id ? "Updating…" : "Mark repaid"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
