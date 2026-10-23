const path = require("path");
const express = require("express");
const cors = require("cors");
const config = require("./config");
const authRoutes = require("./routes/auth");
const loanRoutes = require("./routes/loans");
const summaryRoutes = require("./routes/summary");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(
  cors({
    origin: config.clientOrigin,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "MiniLedger" });
});

app.use("/api/auth", authRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/summary", summaryRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
