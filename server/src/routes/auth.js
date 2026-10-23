const express = require("express");
const jwt = require("jsonwebtoken");
const db = require("../db");
const config = require("../config");
const { generateOtp, otpExpiry } = require("../utils/otp");
const { isValidOtp, isValidPhone, normalizePhone } = require("../utils/validate");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/request-otp", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);

    if (!isValidPhone(phone)) {
      return res.status(400).json({
        error: "Enter a valid 10-digit Indian mobile number.",
      });
    }

    const code = generateOtp();
    await db.query("DELETE FROM otps WHERE phone = $1", [phone]);
    await db.query(
      "INSERT INTO otps (phone, code, expires_at) VALUES ($1, $2, $3)",
      [phone, code, otpExpiry(5)]
    );

    console.log(`[MiniLedger] OTP for ${phone}: ${code} (valid for 5 minutes)`);

    return res.json({
      message: "OTP sent. Check the server console for the code.",
      phone,
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || "").trim();

    if (!isValidPhone(phone) || !isValidOtp(otp)) {
      return res.status(400).json({ error: "Enter a valid phone number and 6-digit OTP." });
    }

    const result = await db.query(
      `SELECT id, code, expires_at
       FROM otps
       WHERE phone = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [phone]
    );

    const record = result.rows[0];
    if (!record || record.code !== otp) {
      return res.status(401).json({ error: "Incorrect OTP." });
    }
    if (new Date(record.expires_at) < new Date()) {
      return res.status(401).json({ error: "OTP has expired. Request a new one." });
    }

    await db.query("DELETE FROM otps WHERE phone = $1", [phone]);

    const userResult = await db.query(
      `INSERT INTO users (phone)
       VALUES ($1)
       ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone
       RETURNING id, phone`,
      [phone]
    );
    const user = userResult.rows[0];

    const token = jwt.sign({ phone: user.phone }, config.jwtSecret, {
      subject: String(user.id),
      expiresIn: config.jwtExpiresIn,
    });

    return res.json({
      token,
      user: { id: user.id, phone: user.phone },
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
