const path = require("path");
const fs = require("fs");
const express = require("express");
const multer = require("multer");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");
const { withStatus } = require("../utils/loanStatus");
const {
  isValidAmount,
  isValidDate,
  isValidName,
} = require("../utils/validate");

const router = express.Router();
const uploadsDir = path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("INVALID_RECEIPT_TYPE"));
    }
    return cb(null, true);
  },
});

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, friend_name, amount, due_date, repaid, repaid_at, receipt_path, created_at
       FROM loans
       WHERE user_id = $1
       ORDER BY repaid ASC, due_date ASC, created_at DESC`,
      [req.user.id]
    );
    return res.json({ loans: result.rows.map((row) => withStatus(row)) });
  } catch (err) {
    return next(err);
  }
});

router.post("/", upload.single("receipt"), async (req, res, next) => {
  try {
    const friendName = String(req.body.friendName || "").trim();
    const amount = req.body.amount;
    const dueDate = req.body.dueDate;

    if (!isValidName(friendName)) {
      return res.status(400).json({ error: "Friend name must be 2–100 characters." });
    }
    if (!isValidAmount(amount)) {
      return res.status(400).json({ error: "Amount must be a number greater than 0." });
    }
    if (!isValidDate(dueDate)) {
      return res.status(400).json({ error: "Due date must be a valid date (YYYY-MM-DD)." });
    }

    const receiptPath = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await db.query(
      `INSERT INTO loans (user_id, friend_name, amount, due_date, receipt_path)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, friend_name, amount, due_date, repaid, repaid_at, receipt_path, created_at`,
      [req.user.id, friendName, Number(amount).toFixed(2), dueDate, receiptPath]
    );

    return res.status(201).json({ loan: withStatus(result.rows[0]) });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id/repay", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid loan id." });
    }

    const existing = await db.query(
      "SELECT id, repaid FROM loans WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );
    if (!existing.rows[0]) {
      return res.status(404).json({ error: "Loan not found." });
    }
    if (existing.rows[0].repaid) {
      return res.status(400).json({ error: "This loan is already marked as repaid." });
    }

    const result = await db.query(
      `UPDATE loans
       SET repaid = TRUE, repaid_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, friend_name, amount, due_date, repaid, repaid_at, receipt_path, created_at`,
      [id, req.user.id]
    );

    return res.json({ loan: withStatus(result.rows[0]) });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
