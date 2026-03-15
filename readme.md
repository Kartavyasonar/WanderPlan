# WanderPlan - AI Travel Itinerary Planner

an ai-powered travel planner i built as a portfolio project. type in any city, pick how many days, choose your travel style — and it generates a complete day-by-day itinerary with 8 curated stops per day, an interactive map, weather info, cost estimates, packing list, voice narration, and a lot more. all for free.

live demo: https://wander-plan-orcin.vercel.app

---

## what it does

- ai generates a realistic itinerary with 8 stops per day (breakfast → morning attraction → lunch → afternoon spots → sunset → dinner → nightlife)
- travel style personalisation — 8 styles: balanced, adventure, foodie, romantic, budget, cultural, luxury, family
- mood selector — relaxed, energetic, curious, spontaneous
- every place gets geocoded using openstreetmap (nominatim)
- everything saves to postgres with a unique shareable link like /trip/123
- ai cover art generated for every destination (pollinations.ai, no api key needed)
- live weather widget for the destination (open-meteo api, free, no key)
- cost estimate for 40+ country pairs with correct local currency
- interactive map opens as a fullscreen modal (leaflet + openstreetmap)
- click any place → animated popup with wikipedia info, photos, insider tip, google maps link
- voice narration using the browser's built-in speech api
- calendar export (.ics file — works with google calendar, apple calendar)
- ai packing list generator (weather-aware, with checkboxes)
- visited checklist — tick off places as you go, progress bar in header
- dark mode (saved to localstorage)
- pwa support — installable on phone home screen
- trip history per browser (no login needed)
- shareable link + whatsapp/twitter og preview

---

## tech stack

- **frontend**: react (vite), plain css, react-leaflet
- **backend**: node.js, express
- **database**: postgresql (raw pg module, no orm)
- **ai**: groq api — llama 3.3 70b (free tier, 14,400 req/day)
- **maps**: openstreetmap + nominatim (both free, no key)
- **weather**: open-meteo (free, no key)
- **cover art**: pollinations.ai (free, no key, just a url)
- **wikipedia**: wikipedia rest api (free, no key)

---

## local setup

clone the repo and set up both projects:

**backend:**
```
cd backend
npm install
cp .env.example .env
# fill in your groq api key and database url
npm run dev
```

**frontend:**
```
cd frontend
npm install
cp .env.example .env
# set VITE_API_URL=http://localhost:3001
npm run dev
```

**database:**

run the contents of `schema.sql` in your postgres client (or neon.tech sql editor). creates two tables: `trips` and `locations`.

---

## environment variables

**backend `.env`:**
```
PORT=3001
DATABASE_URL=postgresql://user:password@host/dbname
GROQ_API_KEY=gsk_your_key_here
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**frontend `.env`:**
```
VITE_API_URL=http://localhost:3001
```

---

## getting a free groq api key

1. go to https://console.groq.com
2. sign up (free, no credit card)
3. go to api keys → create api key
4. paste it into your backend `.env` as `GROQ_API_KEY`

groq gives you llama 3.3 70b with 14,400 requests/day on the free tier. way more than enough.

---

## free deployment (render + vercel + neon) — $0/month

### step 1: database on neon.tech
1. go to neon.tech → make an account → new project
2. in the sql editor, paste the contents of `schema.sql` and run it
3. copy the connection string (looks like `postgresql://user:pass@ep-xxx.neon.tech/dbname`)

### step 2: backend on render.com
1. push your code to github
2. go to render.com → new → web service → connect your github repo
3. root directory: `backend`
4. build command: `npm install`
5. start command: `npm start`
6. add environment variables:
   - `DATABASE_URL` — from neon
   - `GROQ_API_KEY` — from console.groq.com
   - `FRONTEND_URL` — your vercel url (add this after step 3)
   - `NODE_ENV` — `production`
7. deploy → copy the render url

### step 3: frontend on vercel
1. go to vercel.com → new project → import your github repo
2. root directory: `frontend`
3. add environment variable: `VITE_API_URL` = your render backend url
4. deploy → copy the vercel url

### step 4: update cors
go back to render → environment → update `FRONTEND_URL` to your vercel url → save (auto-redeploys)

done. totally free, nothing costs money.

---

## notes

- generating a trip takes 20-60 seconds depending on days (nominatim rate limit is 1 req/second per place)
- some places might not show on the map if nominatim can't find them — this is normal, the card still shows
- render free tier spins down after 15 min of inactivity, so the first request after a sleep takes ~30s
- neon free tier gives 0.5gb storage which holds thousands of trips easily

---

## file structure

```
wanderplan/
├── backend/
│   ├── src/
│   │   ├── index.js        - express server entry point
│   │   ├── db.js           - postgres connection pool
│   │   ├── ai.js           - groq llama ai itinerary + packing list generation
│   │   ├── geocode.js      - nominatim geocoding with 3-strategy fallback
│   │   └── routes.js       - all api route handlers
│   ├── schema.sql          - database tables (trips + locations)
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── public/
    │   ├── compass.svg     - app icon
    │   └── manifest.json   - pwa manifest
    └── src/
        ├── styles/
        │   └── global.css          - css variables, dark mode, reset
        ├── context/
        │   └── ThemeContext.jsx     - dark mode context
        ├── utils/
        │   ├── calendarExport.js   - generates .ics calendar files
        │   └── voiceNarration.js   - web speech api narration
        ├── pages/
        │   ├── LandingPage.jsx/css - home page with trip form
        │   ├── TripPage.jsx/css    - main trip view
        │   ├── HistoryPage.jsx/css - past trips grid
        │   └── NotFound.jsx/css    - 404 page
        └── components/
            ├── DaySection.jsx/css          - groups cards by time of day
            ├── PlaceCard.jsx/css           - individual place card
            ├── PlaceDetailDrawer.jsx/css   - animated popup with wiki + photo
            ├── MapModal.jsx/css            - fullscreen map overlay
            ├── WeatherWidget.jsx/css       - live weather pill
            ├── CostEstimate.jsx/css        - cost calculator widget
            ├── PackingModal.jsx/css        - ai packing list modal
            └── SkeletonLoader.jsx/css      - loading skeleton
```

---

## api endpoints

| method | endpoint | description |
|--------|----------|-------------|
| POST | /api/trips | create a new trip (ai generation + geocoding) |
| GET | /api/trips | get recent trips (filter by ?bid= for history) |
| GET | /api/trips/:id | get a single trip with all locations |
| POST | /api/trips/:id/packing | generate ai packing list for a trip |
| GET | /health | health check for render uptime monitoring |

---

built with react, node.js, groq llama ai, postgresql & openstreetmap

© 2026 kartavya sonar
