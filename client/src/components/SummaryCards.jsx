import React from "react";

function formatRupees(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export default function SummaryCards({ summary }) {
  const items = [
    { label: "Total lent", value: summary?.totalLent },
    { label: "Total repaid", value: summary?.totalRepaid },
    { label: "Outstanding", value: summary?.outstanding },
    { label: "Overdue", value: summary?.overdue, accent: "overdue" },
  ];

  return (
    <section className="summary-grid" aria-label="Loan summary">
      {items.map((item) => (
        <article key={item.label} className={`summary-card ${item.accent || ""}`}>
          <p className="muted">{item.label}</p>
          <p className="summary-value">{formatRupees(item.value)}</p>
        </article>
      ))}
    </section>
  );
}
