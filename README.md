
# 🛂 Bitespeed - Identity Reconciliation API

This is a **Node.js + TypeScript + Express** backend application for the **Identity Reconciliation** task assigned by [Bitespeed](https://bitespeed.notion.site/Bitespeed-Backend-Task-Identity-Reconciliation-1fb21bb2a930802eb896d4409460375c).

---

## 📁 Folder Structure

```
.
├── prisma/
│   └── schema.prisma         # Prisma schema definition
├── test/
│   └── identify.test.ts      # Unit tests
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/
│   │   ├── identify.ts       # API Route logic
│   │   └── asyncHandler.ts   # Global Async Handler
│   └── utils/
│       └── identity.ts       # Core reconciliation logic
├── .env                      # Environment for production DB (ignored by git)
├── .envtest                  # Environment for test DB (in-memory)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Live Deployment (Render)

📡 Deployed at:
**👉 [`https://bitspeed-assesment.onrender.com`](https://bitspeed-assesment.onrender.com)**

---

## ⚙️ How to Run Locally

### 1. Clone the Repo

```bash
git clone https://github.com/coderRaj07/bitspeed_assesment
cd bitspeed_assesment
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file at the root:

```env
DATABASE_URL="postgresql://user:password@host:port/dbname"
```

Alternatively, for test/dev use:

`.env.test`:

```env
DATABASE_URL="file:memory?mode=memory&cache=shared"
```

You can switch between them using `cross-env`:

```bash
cross-env NODE_ENV=test ...
```

---

## 🧬 Prisma Setup

### 4. Initialize Prisma

```bash
npx prisma init
```

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Push Schema to DB

```bash
npx prisma db push
```

Or for test/dev:

```bash
cross-env NODE_ENV=test npx prisma db push --schema=./prisma/schema.prisma
```

---

## 🧪 Run the Application

```bash
npm run dev
```

Server will run at:
**[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Run the Tests

```bash
npm run test
```

This will run tests with an in memory db that gets deleted once test files gets executes

---

## 📬 API Endpoint

### `POST /identify`

**Request:**

```json
{
  "email": "john@example.com",
  "phoneNumber": "1234567890"
}
```

**Response:**

```json
{
  "primaryContactId": 1,
  "emails": ["john@example.com"],
  "phoneNumbers": ["1234567890"],
  "secondaryContactIds": [2, 3]
}
```

---

## 🧼 .gitignore Best Practices

```gitignore
node_modules/
.env
.env.*
*.log
*.tsbuildinfo
prisma/dev.db
```

---

## 🧠 Notes

* Built with **Express**, **TypeScript**, **Prisma ORM**, and **PostgreSQL**.
* Reconciliation logic is cleanly abstracted in `utils/identity.ts`.
* Test environment uses SQLite in-memory DB.
* Compatible with Render deployment.

---

## 📫 Contact

Made with ❤️ by **Rajendra Bisoi**
📧 [rajendrabisoi23@gmail.com](mailto:rajendrabisoi23@gmail.com)
🔗 [LinkedIn](https://www.linkedin.com/in/rajendra-bisoi/)

---
