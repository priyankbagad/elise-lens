# Elise Lens — AI-Powered Lead Intelligence Platform

> Turn cold leads into warm conversations in under 30 seconds.

## Live Product
**URL:** https://eliselens.priyankbagad.com
**Demo login:** salesrep@eliselens.com
**Password:** Eliselens@2026

---

## What It Does

Elise Lens takes a raw inbound lead — just a name, company, city, and state — and returns a fully enriched, scored, and outreach-ready record in under 30 seconds.

For every lead it generates:
- 0–100 lead score with Hot / Warm / Cool tier
- City intelligence card with real market data
- 3 recent local real estate headlines
- Personalized AI-drafted cold email
- 3 sales insights
- 3 cold call conversation starters
- Best time to call

---

## Features

- Single lead enrichment with live pipeline animation
- CSV batch upload — enrich 10+ leads at once
- Kanban pipeline board with drag-and-drop stages
- Analytics dashboard with real charts
- Lead profile pages with full enrichment report
- Multi-user authentication via Supabase Auth
- Fully persistent database via Supabase PostgreSQL

---

## APIs Used

| API | Data Retrieved | Key Required |
|-----|----------------|--------------|
| U.S. Census Bureau | Renter %, vacancy rate, population, median income | Free key |
| FRED Economics | State unemployment rate | Free key |
| NewsAPI | 3 recent real estate headlines | Free key |
| Wikipedia REST API | City description and context | None |
| Anthropic Claude AI | Email, insights, talk track | Yes |

---

## Lead Scoring Model

| Factor | Points | Why It Matters |
|--------|--------|----------------|
| Renter % >= 60% | 25 pts | High demand market |
| Population >= 1M | 25 pts | Major market |
| Vacancy Rate < 5% | 20 pts | Tight, competitive market |
| Median Income $35k-$80k | 15 pts | Workforce housing sweet spot |
| Company ICP Signal | 10 pts | PM company name keyword |
| Unemployment < 4% | 5 pts | Healthy investing economy |

Score Tiers:
- 75-100 = Hot — contact immediately
- 50-74 = Warm — follow up within 48 hours
- 0-49 = Cool — nurture sequence

---

## Tech Stack

Frontend: Next.js 15, Tailwind CSS, Framer Motion, Aceternity UI
Backend: Node.js, Express
Database: Supabase (PostgreSQL + Auth)
Deployment: Vercel (frontend), Railway (backend)
APIs: Census Bureau, FRED, NewsAPI, Wikipedia, Claude AI

---

## Project Structure

elise-lens/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── enrich/
│   │   ├── lead/[id]/
│   │   └── login/
│   ├── components/
│   └── lib/
├── server/
│   ├── routes/
│   └── services/
└── public/

---

## Local Development

Prerequisites: Node.js 18+, npm

1. Clone the repo
git clone https://github.com/priyankbagad/elise-lens.git
cd elise-lens

2. Install frontend dependencies
npm install

3. Install backend dependencies
cd server && npm install

4. Set up environment variables

Create .env.local in project root:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:4000

Create server/.env:
CENSUS_API_KEY=your_census_key
NEWS_API_KEY=your_newsapi_key
FRED_API_KEY=your_fred_key
ANTHROPIC_API_KEY=your_anthropic_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=4000

5. Run development servers

Terminal 1 - Frontend:
npm run dev

Terminal 2 - Backend:
cd server && npm run dev

6. Open the app
http://localhost:3001

---

## Deployment

Frontend: Vercel
Backend: Railway
Database: Supabase
Domain: eliselens.priyankbagad.com via GoDaddy

---

## Built By

Priyank Bagad
GTM Engineer Practical Assignment — April 2026
GitHub: github.com/priyankbagad/elise-lens
