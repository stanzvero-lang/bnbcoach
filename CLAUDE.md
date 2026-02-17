# BnBCoach.ai

## Progetto

BnBCoach.ai e' una SaaS che guida nuovi host Airbnb dall'inizio all'ottimizzazione completa del loro annuncio tramite AI coaching step-by-step. Non e' un tool tecnico per professionisti - e' un coach che ti prende per mano.

## Stack

* Framework: Next.js 14 (App Router)
* Styling: Tailwind CSS
* Database: Supabase (PostgreSQL + Auth + Storage)
* AI: Claude API (Anthropic, modello claude-sonnet-4-5-20250514)
* Scraping: Apify Airbnb Scraper (on-demand per analisi listing)
* Market Data: Inside Airbnb (dataset gratuito, import periodico)
* Payments: Stripe (subscription billing)
* Email: Resend (transazionali)
* Hosting: Vercel
* Analytics: PostHog
* Dominio: bnbcoach.ai

## Struttura Cartelle

```
bnbcoach/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard layout con bottom nav
│   │   ├── page.tsx              # Home dashboard con score
│   │   ├── analyze/page.tsx      # Listing Analyzer
│   │   ├── photos/page.tsx       # Photo Coach AI
│   │   ├── tasks/page.tsx        # Weekly Tasks
│   │   ├── titles/page.tsx       # Title & Description Generator
│   │   ├── reviews/page.tsx      # Review Response Generator
│   │   ├── amenities/page.tsx    # Amenity Gap Finder
│   │   ├── shopping/page.tsx     # Room-by-Room Shopping List
│   │   └── settings/page.tsx     # Account & subscription
│   ├── onboarding/
│   │   └── page.tsx              # 5-step questionnaire
│   ├── api/
│   │   ├── ai/
│   │   │   ├── analyze/route.ts       # Listing analysis
│   │   │   ├── titles/route.ts        # Title generation
│   │   │   ├── reviews/route.ts       # Review responses
│   │   │   ├── photos/route.ts        # Photo analysis (Vision)
│   │   │   └── persona/route.ts       # Guest persona matching
│   │   ├── scrape/route.ts            # Apify integration
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts
│   │   │   └── webhook/route.ts
│   │   └── cron/
│   │       └── market-data/route.ts   # Import Inside Airbnb data
│   ├── layout.tsx
│   └── page.tsx                  # Landing page pubblica
├── components/
│   ├── ui/                       # Componenti base (Button, Card, Input, etc.)
│   ├── dashboard/                # Componenti dashboard
│   ├── onboarding/               # Step del questionario
│   └── landing/                  # Componenti landing page
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── middleware.ts         # Auth middleware
│   ├── anthropic.ts              # Claude API wrapper
│   ├── apify.ts                  # Scraping wrapper
│   ├── stripe.ts                 # Stripe config
│   └── utils.ts                  # Helpers
├── prompts/
│   ├── analyze-listing.md        # Prompt per analisi listing
│   ├── generate-titles.md        # Prompt per generazione titoli
│   ├── review-response.md        # Prompt per risposte recensioni
│   ├── photo-coach.md            # Prompt per analisi foto
│   └── persona-match.md          # Prompt per guest persona
├── supabase/
│   └── migrations/               # SQL migrations
├── public/
├── CLAUDE.md                     # Questo file
├── .env.local                    # API keys (mai committare)
└── package.json
```

## Design System

### Colori

* Primary: #FF385C (Rosso - accento principale, CTA, score highlights)
* Dark: #1A1A2E (Testi principali, header)
* Background: #FFFFFF (sfondo principale)
* Surface: #F7F7F7 (card background, sezioni alternate)
* Text Primary: #222222
* Text Secondary: #717171
* Success: #008A05 (verde Airbnb, score buoni)
* Warning: #E07912 (score medi)
* Error: #C13515 (score bassi)
* Border: #DDDDDD

### Typography

* Font: Inter (Google Fonts) - fallback: system-ui, sans-serif
* Headings: bold, colore #222222
* Body: 16px regular, colore #222222
* Caption: 14px, colore #717171

### Design Rules

* Mobile-first (il 70%+ degli host usa il telefono)
* Card con border-radius: 12px, shadow-sm
* Spacing consistente: multipli di 4px (p-4, p-6, p-8)
* Bottom navigation (5 tab): Home, Analizza, Foto, Task, Profilo
* Animazioni subtle (framer-motion per transizioni pagina)
* Nessun elemento decorativo inutile - design pulito stile Airbnb app
* Ogni feature ha un'icona e un colore distintivo nella dashboard

### Componenti UI

Usa shadcn/ui come base, personalizzato con il design system sopra. Installa: `npx shadcn-ui@latest init` poi aggiungi componenti singoli.

## Feature Specifiche

### Onboarding (5 step)

1. Tipo proprieta (appartamento, casa, stanza, villa, altro)
2. Posizione (citta + quartiere/zona)
3. Esperienza (nuovo, <6 mesi, 6-12 mesi, >1 anno)
4. Guest target (turisti, business, famiglie, coppie, digital nomad)
5. Budget per miglioramenti (0 euro, <200 euro, 200-500 euro, 500+ euro)

Salva in tabella `profiles` su Supabase. Tutti i prompt AI includono questi dati.

### Listing Analyzer

* Input: URL Airbnb
* Scraping: Apify actor `dtrungtin/airbnb-scraper` -> dati listing
* Analisi: Claude API analizza titolo, descrizione, foto (count), amenities, prezzo, recensioni
* Output: Score 0-100 con breakdown per area + 5 consigli prioritizzati
* Rate limit: 3 analisi gratis, illimitate per Pro

### Photo Coach AI

* Input: foto caricate dall'utente (max 10, Supabase Storage)
* Analisi: Claude Vision analizza ogni foto
* Output per foto: voto 1-10, cosa va bene, cosa migliorare, istruzioni specifiche di reshoot
* NON genera immagini AI - da solo consigli su foto reali
* Esempio output: "Soggiorno: 5/10 - Troppo scuro, luce naturale insufficiente. Riscatta domani mattina alle 10-11 dall'angolo della porta d'ingresso. Apri tutte le tende. Togli le scarpe dal pavimento."

### Title & Description Generator

* Input: dati dal profilo + listing data (se analizzato)
* Output: 5 varianti titolo + 5 varianti descrizione
* Ogni variante ha: testo, score SEO 1-10, keywords usate, tono (luxury/cozy/modern/etc.)
* L'utente puo rigenerare o chiedere variazioni

### Weekly Tasks

* Sistema gamificato: 3 task a settimana, ordinati per impatto
* Task personalizzati in base al profilo e score attuale
* Ogni task ha: titolo, descrizione, tempo stimato, impatto stimato
* Checkbox per completamento, progress bar settimanale
* Streak counter (settimane consecutive completate)

### Review Response Generator

* Input: testo recensione (copia-incolla)
* Output: risposta professionale, personalizzata al tono dell'host
* Toggle: tono formale / amichevole / entusiasta
* 1-click copy

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
APIFY_API_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
```

## Comandi Utili

```bash
npm run dev          # Dev server su localhost:3000
npm run build        # Build di produzione
npx supabase start   # Supabase locale (opzionale)
vercel               # Deploy su Vercel
vercel --prod        # Deploy in produzione
```

## Database Schema (Supabase)

```sql
-- Profili utente (estende auth.users)
create table profiles (
  id uuid references auth.users primary key,
  name text,
  property_type text,        -- appartamento, casa, stanza, villa
  location_city text,
  location_area text,
  experience_level text,     -- nuovo, <6mesi, 6-12mesi, >1anno
  guest_target text[],       -- array: turisti, business, famiglie, etc.
  improvement_budget text,   -- 0, <200, 200-500, 500+
  subscription_tier text default 'free',  -- free, pro, business
  stripe_customer_id text,
  analyses_used int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Listing analizzati
create table listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  airbnb_url text,
  raw_data jsonb,            -- dati scraping
  analysis jsonb,            -- risultato analisi Claude
  overall_score int,
  title_score int,
  photos_score int,
  amenities_score int,
  description_score int,
  pricing_score int,
  created_at timestamptz default now()
);

-- Task settimanali
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  title text,
  description text,
  impact text,               -- alto, medio, basso
  estimated_minutes int,
  completed boolean default false,
  week_start date,
  created_at timestamptz default now()
);

-- Foto analizzate
create table photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  listing_id uuid references listings(id),
  storage_path text,         -- path in Supabase Storage
  room_type text,
  score int,
  analysis jsonb,            -- risultato Claude Vision
  created_at timestamptz default now()
);

-- Titoli/descrizioni generate
create table generated_content (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  listing_id uuid references listings(id),
  content_type text,         -- title, description
  variants jsonb,            -- array di varianti generate
  created_at timestamptz default now()
);
```

## Regole per Claude Code

* Scrivi tutto in TypeScript
* Usa `'use client'` solo dove serve (preferisci Server Components)
* Gestisci sempre gli errori con try/catch e mostra feedback all'utente
* Ogni chiamata Claude API passa per le API routes (mai client-side)
* Le API key non vanno MAI nel frontend
* Commenti nel codice in inglese, UI in italiano (default) con supporto i18n futuro
* Ogni feature deve funzionare su mobile prima, poi desktop
* Usa loading states e skeleton screens durante le chiamate API
* Limita le analisi gratuite a 3 (controlla `profiles.analyses_used`)
