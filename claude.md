# Tokyo + Niseko Honeymoon 2025

## Overview
Honeymoon itinerary web app for January 19 - February 1, 2025. Trip includes 6 days in Tokyo and 4 days skiing in Niseko.

## Tech Stack
- **Backend:** Express.js + Prisma ORM
- **Database:** PostgreSQL (Railway)
- **Frontend:** Vanilla HTML/CSS/JS (single-page)
- **Hosting:** Railway

## Project Structure
```
├── server.js           # Express API server
├── prisma/
│   └── schema.prisma   # Database models (Comment, Request)
├── public/
│   └── index.html      # Full itinerary + comments/requests panel
├── package.json
└── .env                # DATABASE_URL (not committed)
```

## API Routes
- `GET/POST/DELETE /api/comments` - Day-specific comments
- `GET/POST/PATCH/DELETE /api/requests` - Change requests with status (pending/approved/rejected)

## Key Features
- Expandable day-by-day itinerary with themed days
- Google Maps links for all locations
- Checklist with localStorage persistence
- Slide-out panel (+ button) for comments and requests
- Pending requests badge counter

## Trip Structure
- **Days 0-1:** Travel EWR→HND, arrive Tokyo
- **Days 2-4:** Tokyo (Shimokitazawa, Ginza, Koenji)
- **Day 5:** White Liner bus to Niseko (early departure for night skiing)
- **Days 6-9:** Skiing at Niseko (Aya Niseko hotel)
- **Day 10:** Return to Tokyo
- **Days 11-12:** Tokyo (Nakameguro, Asakusa)
- **Day 13:** Fly home HND→EWR (6:25pm departure)

## Hotels
1. ANA Intercontinental Tokyo (first Tokyo stint)
2. Aya Niseko (skiing)
3. TBD splurge hotel (second Tokyo stint) - Park Hyatt closed for renovation until Oct 2025

## Deployment Notes
- Railway auto-deploys from `tokyo26` branch
- `prisma db push` runs at startup (not build) to access Railway internal network
- DATABASE_URL uses internal Railway Postgres URL

## Commands
```bash
npm run dev      # Local development
npm run build    # Generate Prisma client
npm start        # Production (includes db push)
```
