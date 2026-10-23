const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../src/db", () => ({
  query: jest.fn(),
  initSchema: jest.fn(),
}));

const db = require("../src/db");
const config = require("../src/config");
const app = require("../src/app");

function authHeader(userId = 1, phone = "9876543210") {
  const token = jwt.sign({ phone }, config.jwtSecret, {
    subject: String(userId),
    expiresIn: "1h",
  });
  return `Bearer ${token}`;
}

describe("API", () => {
  beforeEach(() => {
    db.query.mockReset();
  });

  test("health check", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("rejects invalid phone for OTP", async () => {
    const res = await request(app).post("/api/auth/request-otp").send({ phone: "123" });
    expect(res.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  test("protects loan routes", async () => {
    const res = await request(app).get("/api/loans");
    expect(res.status).toBe(401);
  });

  test("rejects invalid loan payload", async () => {
    const res = await request(app)
      .post("/api/loans")
      .set("Authorization", authHeader())
      .send({ friendName: "A", amount: -5, dueDate: "bad" });
    expect(res.status).toBe(400);
  });

  test("creates a loan for the authenticated user", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          id: 10,
          friend_name: "Asha",
          amount: "500.00",
          due_date: "2026-12-01",
          repaid: false,
          repaid_at: null,
          receipt_path: null,
          created_at: "2026-10-22T00:00:00.000Z",
        },
      ],
    });

    const res = await request(app)
      .post("/api/loans")
      .set("Authorization", authHeader())
      .send({ friendName: "Asha", amount: 500, dueDate: "2026-12-01" });

    expect(res.status).toBe(201);
    expect(res.body.loan.friend_name).toBe("Asha");
    expect(res.body.loan.status).toBe("pending");
    expect(db.query).toHaveBeenCalled();
  });

  test("returns summary totals", async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        {
          total_lent: "1500",
          total_repaid: "500",
          outstanding: "1000",
          overdue: "200",
        },
      ],
    });

    const res = await request(app).get("/api/summary").set("Authorization", authHeader());
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalLent: 1500,
      totalRepaid: 500,
      outstanding: 1000,
      overdue: 200,
    });
  });
});
