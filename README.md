# 🚀 EarnLoop — Full Responsive Rewards Web App & Admin Portal

A mobile-first rewards web application inspired by the EarnLoop user experience, engineered with **React + TypeScript + Vite + Tailwind CSS** on the frontend, and **Node.js + Express + Prisma + PostgreSQL** on the backend.

---

## 🌟 Key Features
- **Mobile-First App Interface:**
  - **Home:** Real-time Mcoin asset balance, eye toggle, conversion rates (`1Rs=1Mcoin`, `1USDT=110.5Mcoin`), promotional carousel banner, Make Money & Sell buttons, Welcome Rewards, and "Your Friends Buy, You Earn" card.
  - **Make Money:** Dual tabs for **Buy Mcoin by INR** (Small, Middle, Large tiers like ₹641 with 25.23 reward) and **Buy Mcoin by USDT** (dynamic ratio calculator, network selection TRC20/ERC20/BEP20, safety warnings).
  - **Team & Referrals:** 2x2 grid stats (Total commission, Today's commission, Total invites, Today's invites), invitation code & copyable link, real-time 0.3% commission attribution.
  - **UPI & Bank Management:** Payout methods, bind UPI ID, Account holder name, IFSC, and Bank account number.
  - **My / Profile:** Profile ID (`Phone-suffix`), Total assets & Today's earnings cards, quick actions for Transaction History, User Guide, and 24/7 Support.
- **Dedicated Master Admin Portal (`/admin`):**
  - Protected with Master PIN (`EarnLoop@Admin#2026`).
  - 1-Click Order verification (Approve INR/USDT deposits, auto-credits user wallet & auto-credits 0.3% commission to referrer).
  - User Accounts & Wallet Ledger management (Adjust balances with mandatory audit reason).
  - Tasks & Missions review.
  - Dynamic System Settings (Update UPI ID, USDT TRC20 address, conversion rates, and support channels in real time).
  - Immutable double-entry financial audit trail.
- **Render Free Tier Ready:**
  - Automated Blueprint configuration (`render.yaml`).
  - Native health-check endpoint: `GET /health`.
  - Single web service hosts both Express API and optimized Vite bundle.

---

## 🛠️ Tech Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend:** Node.js, Express, Decimal / Scaled-Integer Ledger Architecture
- **Database:** PostgreSQL (with Prisma ORM) + Local Zero-Config Engine
- **Deployment:** Render Free Web Service (`render.yaml`)

---

## ⚡ Quick Start (Local Development)

```bash
# 1. Install dependencies
npm run install:all

# 2. Start development servers
npm run build
npm start
```

Visit:
- Customer Mobile App: `http://localhost:5000`
- Master Admin Portal: `http://localhost:5000/admin` (PIN: `EarnLoop@Admin#2026`)
- Health Check: `http://localhost:5000/health`

---

## 🌐 Render Free Deployment Guide

### Option 1: One-Click Deploy via `render.yaml`
1. Push this repository to your GitHub account.
2. In the [Render Dashboard](https://dashboard.render.com), click **New** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically parse `render.yaml`, provision the PostgreSQL database, configure environment variables, and deploy!

---

### Option 2: Manual Web Service Setup on Render
1. In the Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Name:** `earnloop-rewards`
   - **Runtime:** `Node`
   - **Region:** `Oregon (US West)` or your preferred region
   - **Branch:** `main`
   - **Build Command:**
     ```bash
     npm run build
     ```
   - **Start Command:**
     ```bash
     npm run start
     ```
   - **Plan:** `Free`

4. Add **Environment Variables** under the **Environment** tab:

| Variable | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Production mode |
| `PORT` | `10000` | Port provided by Render |
| `DATABASE_URL` | `postgresql://...` | Connection string from Render PostgreSQL |
| `JWT_SECRET` | `your-secure-random-key` | Token signature secret |
| `ADMIN_PIN` | `EarnLoop@Admin#2026` | Master Admin Portal PIN |
| `SMS_MOCK_MODE` | `true` | Mock OTP in development/demo mode |
| `INR_TO_MCOIN_RATE` | `1.0` | Default 1 INR = 1 Mcoin |
| `USDT_TO_MCOIN_RATE` | `110.5` | Default 1 USDT = 110.5 Mcoin |
| `ADMIN_UPI_ID` | `paytm.earnloop@okaxis` | Default deposit UPI ID |
| `ADMIN_USDT_TRC20` | `TQn9Y2khEsLJW1ChVWFMSMeSTow5KaxUSDT` | Default USDT TRC20 address |

5. Under **Advanced**, set **Health Check Path** to `/health`.
6. Click **Create Web Service**.

---

## 🛡️ Render Free Database Notes & Persistence
- Render's free PostgreSQL instances are valid for 90 days.
- Free web services automatically spin down after 15 minutes of inactivity and wake up upon new incoming HTTP requests.
- To export your database before expiration:
  ```bash
  pg_dump -d "$DATABASE_URL" -F c -b -v -f earnloop_backup.dump
  ```
- To migrate to a persistent paid PostgreSQL database:
  ```bash
  pg_restore -d "$NEW_PERSISTENT_DATABASE_URL" -v earnloop_backup.dump
  ```
