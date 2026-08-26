# Truck Hire ZW — v1

A PWA marketplace connecting truck/lorry/pickup owners with customers who need
to hire a vehicle to move goods. Built for the Zimbabwean context: owners
create free accounts to list their trucks, customers browse and search with
**no account needed**, then connect directly by phone call or WhatsApp to
negotiate price and payment themselves.

**Stack:** React (Vite) + Node.js/Express + PostgreSQL. Plain CSS, no
frameworks — palette is strictly black / white / red, no gradients.

---

## How it works (v1 scope)

- **Customers:** open the app, search/filter trucks by type, size, or
  location, view a listing, then tap **Call** or **WhatsApp** to reach the
  driver directly. No login, no payment on the app.
- **Drivers:** sign up with phone + password, post truck listings (title,
  type, capacity, location, price guide, description, photo link), see a
  simple dashboard (views + contacts per listing), edit/pause/delete
  listings.
- **Monetization (schema is ready, payment collection is not wired up yet):**
  every driver has a `subscription_status` (`trial` / `active` / `expired`)
  and every truck has `is_boosted` + `boosted_until` so paid/boosted listings
  sort to the top of search results. You'll need to add a payment step
  (EcoCash is the obvious choice for Zimbabwe) to actually charge the
  $2/month and the "featured" boost fee — see **Next steps** below.

---

## Project structure

```
truck-hire-app/
├── backend/          Express API + PostgreSQL
│   ├── schema.sql     Run this once to create your tables
│   ├── seed.sql        Optional sample data
│   └── src/
├── frontend/         React (Vite) PWA
│   └── src/
└── README.md          (this file)
```

---

## 1. Prerequisites

Install these first if you don't have them:

- **Node.js** 18+ and npm — https://nodejs.org
- **PostgreSQL** 14+ — https://www.postgresql.org/download/
- **VS Code** (or any editor)

Check versions:
```bash
node -v
npm -v
psql --version
```

---

## 2. Set up the database

1. Open a terminal and create the database:
   ```bash
   psql -U postgres -c "CREATE DATABASE truck_hire_zw;"
   ```
2. From the `backend/` folder, run the schema to create the tables:
   ```bash
   psql -U postgres -d truck_hire_zw -f schema.sql
   ```
3. (Optional) Load sample data so you have something to look at immediately:
   ```bash
   psql -U postgres -d truck_hire_zw -f seed.sql
   ```
   This creates 2 sample drivers (password for both: `password123`) and 3
   sample truck listings.

---

## 3. Set up the backend

```bash
cd backend
cp .env.example .env
```

Open `.env` in VS Code and fill in your real PostgreSQL password and a random
`JWT_SECRET` (any long random string — used to sign login sessions).

Install dependencies and start the server:
```bash
npm install
npm run dev
```

You should see:
```
Truck Hire backend running on http://localhost:5000
```

Test it's alive by visiting http://localhost:5000/api/health in your browser
— you should see `{"status":"ok","service":"truck-hire-backend"}`.

---

## 4. Set up the frontend

Open a **new terminal tab** (leave the backend running):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open the URL it prints (usually **http://localhost:5173**). You should see
the Truck Hire ZW home page. If you loaded the seed data, you'll see 3 sample
trucks you can click into.

---

## 5. Try the full flow

1. On the home page, search/filter — try typing "1 tonne" or selecting a
   truck type.
2. Click a truck to open its listing, then try the **Call** / **WhatsApp**
   buttons (WhatsApp will open a chat pre-filled with a message).
3. Click **List Your Truck** in the top right to create a driver account.
4. From the dashboard, click **+ Post a truck** to create your own listing,
   then go back to the home page and search for it.
5. From the dashboard you can **Pause**, **Edit**, or **Delete** any of your
   listings, and see basic view/contact stats.

---

## 6. Installing it as a PWA

Once both servers are running, open http://localhost:5173 on your phone (on
the same WiFi network — replace `localhost` with your computer's local IP,
e.g. `http://192.168.1.20:5173`) or on desktop Chrome, and use
**"Add to Home Screen"** / **"Install App"** from the browser menu. The app
shell (not live listings) is cached so it can still open on a poor
connection.

> Note: the current icons (`frontend/public/icon-192.svg`,
> `icon-512.svg`) are simple placeholder SVGs in your brand colors. Swap
> them for a real logo (PNG or SVG) before you launch properly — just keep
> the same filenames or update `manifest.json`.

---

## Next steps (not built yet, by design — this is v1)

These were intentionally left out of v1 to keep it shippable fast. Roughly
in order of what unlocks value soonest:

1. **Payment collection for the driver subscription** ($2/month) and the
   "boost to top of search" fee — integrate EcoCash (most realistic for
   Zimbabwe) or another local payment gateway. The `subscription_status`,
   `subscription_expires_at`, `is_boosted`, and `boosted_until` columns are
   already in the schema, ready for a scheduled job or webhook to update
   them.
2. **Real photo upload** — currently listings take a pasted image URL.
   Adding actual file upload (e.g. to S3-compatible storage or Cloudinary)
   is a clean follow-up.
3. **Phone verification** (OTP via SMS) to flip `is_phone_verified` to true
   automatically instead of manually.
4. **Admin screen** to manage/approve listings and handle disputes/reports.
5. **Ratings after a hire** — a lightweight "how did it go?" prompt sent to
   the driver or customer some time after a contact event, to build trust
   signals without you touching the actual payment.
6. **Deploying it** — backend can go on Render/Railway/Fly.io with a managed
   Postgres add-on; frontend (`npm run build`) can be deployed as a static
   site on Netlify/Vercel/Render Static Sites.

---

## API reference (quick)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | — | Driver signs up |
| POST | `/api/auth/login` | — | Driver logs in |
| GET | `/api/auth/me` | driver | Current driver profile |
| GET | `/api/trucks` | — | Search/browse trucks (query: `q`, `type`, `location`, `minCapacity`, `maxCapacity`) |
| GET | `/api/trucks/:id` | — | View one listing (also increments view count) |
| POST | `/api/trucks/:id/contact` | — | Log a Call/WhatsApp tap (`{ "type": "call" \| "whatsapp" }`) |
| GET | `/api/trucks/mine` | driver | Driver's own listings + contact counts |
| POST | `/api/trucks` | driver | Create a listing |
| PUT | `/api/trucks/:id` | driver | Edit/pause/activate own listing |
| DELETE | `/api/trucks/:id` | driver | Delete own listing |
| GET | `/api/drivers/dashboard` | driver | Listings/views/contacts summary + subscription status |
