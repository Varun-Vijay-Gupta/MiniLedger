function loanStatus(loan, today = new Date().toISOString().slice(0, 10)) {
  if (loan.repaid) return "repaid";
  const due = String(loan.due_date).slice(0, 10);
  if (due < today) return "overdue";
  return "pending";
}

function withStatus(loan, today) {
  return {
    ...loan,
    amount: Number(loan.amount),
    due_date: String(loan.due_date).slice(0, 10),
    status: loanStatus(loan, today),
  };
}

module.exports = {
  loanStatus,
  withStatus,
};
