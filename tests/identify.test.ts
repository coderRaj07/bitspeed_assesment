import request from "supertest";
import app from "../src/index"; // adjust this to your app entry point
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeEach(async () => {
  await prisma.contact.deleteMany(); // clean up before each test
});

describe("POST /identify", () => {
  it("should create a new primary contact if email & phone are new", async () => {
    const res = await request(app)
      .post("/identify")
      .send({ email: "doc@time.com", phoneNumber: "999999" });

    expect(res.status).toBe(200);
    expect(res.body.contact.emails).toContain("doc@time.com");
    expect(res.body.contact.phoneNumbers).toContain("999999");
    expect(res.body.contact.secondaryContactIds).toEqual([]);
  });

  it("should work when only phone is provided (email is null)", async () => {
    await prisma.contact.create({
      data: {
        email: "lorraine@hillvalley.edu",
        phoneNumber: "123456",
        linkPrecedence: "primary",
      },
    });
  
    const res = await request(app)
      .post("/identify")
      .send({ email: null, phoneNumber: "123456" });
  
    expect(res.status).toBe(200);
    expect(res.body.contact.phoneNumbers).toContain("123456");
    expect(res.body.contact.emails).toContain("lorraine@hillvalley.edu");
  });
  
  it("should return existing primary when matching email", async () => {
    await prisma.contact.create({
      data: {
        email: "doc@time.com",
        phoneNumber: "123456",
        linkPrecedence: "primary",
      },
    });

    const res = await request(app)
      .post("/identify")
      .send({ email: "doc@time.com" });

    expect(res.status).toBe(200);
    expect(res.body.contact.emails).toContain("doc@time.com");
  });

  it("should return existing primary when matching phone", async () => {
    await prisma.contact.create({
      data: {
        email: "doc@time.com",
        phoneNumber: "123456",
        linkPrecedence: "primary",
      },
    });

    const res = await request(app)
      .post("/identify")
      .send({ phoneNumber: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.contact.phoneNumbers).toContain("123456");
  });

  it("should link new contact as secondary when phone matches", async () => {
    const primary = await prisma.contact.create({
      data: {
        email: "doc@time.com",
        phoneNumber: "123456",
        linkPrecedence: "primary",
      },
    });

    const res = await request(app)
      .post("/identify")
      .send({ email: "marty@future.com", phoneNumber: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.contact.primaryContatctId).toBe(primary.id);
    expect(res.body.contact.emails).toContain("marty@future.com");
    expect(res.body.contact.secondaryContactIds.length).toBe(1);
  });

  it("should merge two primaries into one with older as primary", async () => {
    const old = await prisma.contact.create({
      data: {
        email: "a@x.com",
        phoneNumber: "111",
        linkPrecedence: "primary",
        createdAt: new Date("2023-01-01"),
      },
    });

    const newer = await prisma.contact.create({
      data: {
        email: "b@x.com",
        phoneNumber: "222",
        linkPrecedence: "primary",
        createdAt: new Date("2023-02-01"),
      },
    });

    const res = await request(app)
      .post("/identify")
      .send({ email: "a@x.com", phoneNumber: "222" });

    const updated = await prisma.contact.findUnique({ where: { id: newer.id } });
    expect(updated?.linkPrecedence).toBe("secondary");
    expect(updated?.linkedId).toBe(old.id);

    expect(res.body.contact.primaryContatctId).toBe(old.id);
    expect(res.body.contact.secondaryContactIds).toContain(newer.id);
  });

  it("should return 400 if both email and phone are missing", async () => {
    const res = await request(app)
      .post("/identify")
      .send({});

    expect(res.status).toBe(400);
  });
});
