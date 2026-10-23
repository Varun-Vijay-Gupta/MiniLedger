const {
  normalizePhone,
  isValidPhone,
  isValidOtp,
  isValidName,
  isValidAmount,
  isValidDate,
} = require("../src/utils/validate");
const { loanStatus } = require("../src/utils/loanStatus");

describe("phone validation", () => {
  test("accepts 10-digit Indian mobiles", () => {
    expect(isValidPhone("9876543210")).toBe(true);
    expect(normalizePhone("+91 98765 43210")).toBe("9876543210");
  });

  test("rejects invalid numbers", () => {
    expect(isValidPhone("12345")).toBe(false);
    expect(isValidPhone("5876543210")).toBe(false);
  });
});

describe("input validation", () => {
  test("OTP must be 6 digits", () => {
    expect(isValidOtp("123456")).toBe(true);
    expect(isValidOtp("12a456")).toBe(false);
  });

  test("friend name length", () => {
    expect(isValidName("Raj")).toBe(true);
    expect(isValidName("A")).toBe(false);
  });

  test("amount must be positive", () => {
    expect(isValidAmount("250.50")).toBe(true);
    expect(isValidAmount("0")).toBe(false);
    expect(isValidAmount("-10")).toBe(false);
  });

  test("due date format", () => {
    expect(isValidDate("2026-11-01")).toBe(true);
    expect(isValidDate("01-11-2026")).toBe(false);
  });
});

describe("loan status", () => {
  test("marks repaid loans", () => {
    expect(loanStatus({ repaid: true, due_date: "2020-01-01" }, "2026-10-22")).toBe("repaid");
  });

  test("marks overdue and pending loans", () => {
    expect(loanStatus({ repaid: false, due_date: "2026-10-21" }, "2026-10-22")).toBe("overdue");
    expect(loanStatus({ repaid: false, due_date: "2026-10-22" }, "2026-10-22")).toBe("pending");
  });
});
