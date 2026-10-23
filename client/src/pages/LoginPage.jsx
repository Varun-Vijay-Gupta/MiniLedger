import React, { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestOtp(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await api("/api/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      setPhone(data.phone);
      setStep("otp");
      setMessage("OTP generated. Check the server terminal for the 6-digit code.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ phone, otp }),
      });
      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card login-card">
        <h1>MiniLedger</h1>
        <p className="muted">Track money lent to friends.</p>

        {step === "phone" ? (
          <form onSubmit={requestOtp}>
            <label htmlFor="phone">Phone number</label>
            <input
              id="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <p className="muted">OTP sent to {phone}</p>
            <label htmlFor="otp">One-time password</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit" disabled={busy}>
              {busy ? "Verifying…" : "Log in"}
            </button>
            <button
              type="button"
              className="button-secondary"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
                setMessage("");
              }}
            >
              Change number
            </button>
          </form>
        )}

        {message ? <p className="notice">{message}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </div>
  );
}
