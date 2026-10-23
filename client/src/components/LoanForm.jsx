import React, { useState } from "react";
import { api } from "../api.js";

export default function LoanForm({ onCreated }) {
  const [friendName, setFriendName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = new FormData();
      body.append("friendName", friendName);
      body.append("amount", amount);
      body.append("dueDate", dueDate);
      if (receipt) {
        body.append("receipt", receipt);
      }
      await api("/api/loans", { method: "POST", body });
      setFriendName("");
      setAmount("");
      setDueDate("");
      setReceipt(null);
      event.target.reset();
      await onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card">
      <h2>Add a loan</h2>
      <form className="loan-form" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="friendName">Friend’s name</label>
          <input
            id="friendName"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="amount">Amount (₹)</label>
          <input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="dueDate">Due date</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="receipt">Receipt photo (optional)</label>
          <input
            id="receipt"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => setReceipt(e.target.files[0] || null)}
          />
        </div>
        <button type="submit" disabled={busy}>
          {busy ? "Saving…" : "Add loan"}
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
