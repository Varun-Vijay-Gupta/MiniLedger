function normalizePhone(phone) {
  if (typeof phone !== "string") return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(normalizePhone(phone));
}

function isValidOtp(otp) {
  return /^\d{6}$/.test(String(otp || "").trim());
}

function isValidName(name) {
  if (typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

function isValidAmount(amount) {
  const value = Number(amount);
  return Number.isFinite(value) && value > 0 && value <= 100000000;
}

function isValidDate(date) {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return false;
  }
  const parsed = new Date(`${date}T00:00:00`);
  return !Number.isNaN(parsed.getTime());
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = {
  normalizePhone,
  isValidPhone,
  isValidOtp,
  isValidName,
  isValidAmount,
  isValidDate,
  todayDateString,
};
