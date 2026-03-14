# WanderPlan - AI Travel Itinerary Planner

a travel itinerary app i built using react, node.js, and the gemini ai api. you type in a city and how many days, and it generates a full day-by-day plan with an interactive map showing all the spots.

## what it does

- ai generates a real itinerary using google gemini
- every place gets geocoded using openstreetmap (nominatim)
- everything saves to a postgres database
- you get a shareable link like /trip/123
- split screen with scrolling cards on the left, interactive map on the right
- map pins are color coded by day

## tech stack

- frontend: react (vite), plain css, react-leaflet
- backend: node.js, express
- database: postgresql (raw pg module, no orm)
- ai: google gemini 1.5 flash api (free tier)
- maps: openstreetmap + nominatim (both free)

## local setup

first clone the repo and set up both projects:

**backend:**
```
cd backend
npm install
cp .env.example .env
# fill in your .env with your gemini api key and database url
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

**database (run these in your postgres client):**

open schema.sql and copy the contents into your sql editor. creates two tables: trips and locations.

## getting a free gemini api key

1. go to https://aistudio.google.com/app/apikey
2. click "create api key"
3. copy it into your backend .env as GEMINI_API_KEY

## free deployment (render + vercel + neon)

### step 1: database on neon.tech (free postgres)
1. go to neon.tech, make an account
2. create a new project, it gives you a connection string
3. open the sql editor, paste in the contents of schema.sql and run it
4. copy the connection string (looks like postgresql://user:pass@host/db)

### step 2: backend on render.com
1. push your code to github (both folders)
2. go to render.com, new web service
3. connect your github repo, set root directory to "backend"
4. build command: `npm install`
5. start command: `npm start`
6. add environment variables: DATABASE_URL (from neon), GEMINI_API_KEY, FRONTEND_URL (your vercel url, set this after deploying frontend)
7. deploy, copy the render url (like https://wanderplan-api.onrender.com)

### step 3: frontend on vercel
1. go to vercel.com, import your github repo
2. set root directory to "frontend"
3. add environment variable: VITE_API_URL = your render backend url
4. deploy, copy the vercel url

### step 4: update cors
go back to render, update the FRONTEND_URL env var with your vercel url, redeploy.

done! totally free, nothing costs money.

## notes

- generating a trip takes a little while (about 1 second per place because of nominatim rate limits)
- some places might not show on the map if nominatim cant find them, this is normal
- gemini free tier has limits, if you get errors try again in a bit
- render free tier spins down after inactivity so first request might be slow

## file structure
```
wanderplan/
├── backend/
│   ├── src/
│   │   ├── index.js      - express server
│   │   ├── db.js         - postgres connection
│   │   ├── gemini.js     - ai itinerary generation
│   │   ├── geocode.js    - nominatim geocoding
│   │   └── routes.js     - api routes
│   └── schema.sql        - database tables
└── frontend/
    └── src/
        ├── pages/        - landing page and trip page
        └── components/   - map, itinerary panel, cards
```