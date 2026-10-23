const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         COALESCE(SUM(amount), 0)::numeric AS total_lent,
         COALESCE(SUM(CASE WHEN repaid THEN amount ELSE 0 END), 0)::numeric AS total_repaid,
         COALESCE(SUM(CASE WHEN NOT repaid THEN amount ELSE 0 END), 0)::numeric AS outstanding,
         COALESCE(
           SUM(CASE WHEN NOT repaid AND due_date < CURRENT_DATE THEN amount ELSE 0 END),
           0
         )::numeric AS overdue
       FROM loans
       WHERE user_id = $1`,
      [req.user.id]
    );

    const row = result.rows[0];
    return res.json({
      totalLent: Number(row.total_lent),
      totalRepaid: Number(row.total_repaid),
      outstanding: Number(row.outstanding),
      overdue: Number(row.overdue),
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
