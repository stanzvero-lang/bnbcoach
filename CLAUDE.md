# BnBCoach.ai — Documento Completo del Progetto

## Cos'è BnBCoach

BnBCoach.ai è una SaaS di AI coaching per host Airbnb. Guida nuovi host dall'inizio all'ottimizzazione completa del loro annuncio, passo dopo passo. Non è un tool tecnico per professionisti — è un coach personale che si adatta al livello dell'utente e lo fa crescere nel tempo. Target: nuovi host che non sanno da dove iniziare, host con listing che vanno male, host intermedi che vogliono ottimizzare.

## ⛔ REGOLA ASSOLUTA: NON TOCCARE NULLA CHE GIÀ FUNZIONA

❌ NON modificare, riscrivere, refactorare:
* La route API di analisi listing (flusso Apify → Claude → response)
* La logica di scraping Apify (actor dtrungtin/airbnb-scraper)
* Il prompt Claude per l'analisi
* Il parsing dei risultati (score breakdown)
* Le variabili d'ambiente in .env.local e Vercel
* La configurazione Vercel, Supabase, GitHub

✅ Già funzionante e testato:
1. Scraping: URL Airbnb → Apify → dati listing JSON
2. Analisi AI: Dati → Claude (claude-sonnet-4-5-20250514) → score + breakdown
3. Frontend: Score globale + breakdown per area
4. Deploy: Vercel attivo (bnbcoach-w6o9.vercel.app)
5. Supabase: Configurato con chiavi
6. GitHub: Repo collegato

✅ Approccio:
COSTRUIRE SOPRA quello che c'è. L'analisi è il cuore — aggiungiamo auth, persistenza, dashboard, onboarding, task e tutte le feature attorno. Non sostituire mai, solo aggiungere.

## Stack Tecnologico

* Framework: Next.js 14 (App Router)
* Styling: Tailwind CSS
* UI Components: shadcn/ui personalizzato
* Animazioni: framer-motion
* Charts: recharts
* Database: Supabase (PostgreSQL + Auth + Storage)
* AI Testo: Claude API (claude-sonnet-4-5-20250514)
* AI Vision: Claude Vision (stesso modello, per foto)
* Scraping: Apify Airbnb Scraper (on-demand)
* Market Data: Inside Airbnb (dataset gratuito)
* Payments: Stripe (subscription billing)
* Email: Resend (transazionali + digest)
* Hosting: Vercel
* Analytics: PostHog
* Icons: Lucide React

## Design System

### Colori

```
Primary:         #FF385C    CTA, accenti, score highlights
Primary Hover:   #E0314F
Dark:            #1A1A2E    Header, testi importanti
Background:      #FFFFFF    Sfondo principale
Surface:         #F7F7F7    Card, sezioni alternate
Surface Hover:   #EFEFEF
Text Primary:    #222222
Text Secondary:  #717171
Text Muted:      #9CA3AF
Success:         #008A05    Score buoni, completamenti
Success Light:   #ECFDF5
Warning:         #E07912    Score medi
Warning Light:   #FFF7ED
Error:           #C13515    Score bassi, errori
Error Light:     #FEF2F2
Border:          #DDDDDD
Border Light:    #F0F0F0
```

### Feature Colors

```
Analisi:     #FF385C   rosso
Titoli:      #8B5CF6   viola
Foto:        #06B6D4   cyan
Tasks:       #6366F1   indaco
Pricing:     #3B82F6   blu
Amenities:   #10B981   verde
Recensioni:  #F59E0B   ambra
SEO:         #8B5CF6   viola
Messaggi:    #10B981   verde
Competitor:  #EC4899   rosa
Superhost:   #EAB308   oro
Calendar:    #3B82F6   blu
Revenue:     #10B981   verde
```

### Typography

```
Font:     Inter (Google Fonts), fallback: system-ui, sans-serif
H1:       28px bold #222222
H2:       22px bold #222222
H3:       18px semibold #222222
Body:     16px regular #222222
Caption:  14px regular #717171
Small:    12px regular #9CA3AF
```

### Design Rules

* Mobile-first sempre (70%+ host usa telefono)
* Card: border-radius 12px, shadow-sm, bg white
* Spacing: multipli di 4px
* Bottoni: border-radius 8px (piccoli), 12px (grandi)
* Bottom nav: 5 tab (Home, Analizza, Foto, Task, Profilo)
* Transizioni pagina con framer-motion
* Skeleton loading ovunque (mai spinner)
* Toast notifications per feedback (sonner)
* Empty states con illustrazione + CTA
* Confetti su milestone
* Score ring animato stile Apple Watch
* Micro-interazioni: checkbox animate, progress bar, card espandibili

### Componenti UI (shadcn/ui)

Button, Card, Input, Select, Checkbox, Dialog, Sheet, Tabs, Progress, Badge, Avatar, Skeleton, Toast, Separator, ScrollArea, Accordion, Switch, Tooltip

## Sistema Livelli Utente

Tutto il sistema si adatta al livello. Le feature si sbloccano progressivamente. Per lo sviluppo iniziale, costruire TUTTE le feature sbloccate. Il sistema di lock/unlock per livello verrà aggiunto alla fine come ultimo step.

### 🌱 Starter (score 0-40 o nessun listing)

Feature visibili: Analisi, Titoli, Photo Coach, Task, Description Builder
Task: 2-3 a settimana, semplici, linguaggio basico
Tono: incoraggiante, gamificato, passo-passo
Dashboard: score (o percorso guidato se no listing) + pochi task + card base

### 🌿 Growing (score 40-70)

Sblocca: Amenities, Recensioni, Pricing Coach, SEO, Messaggi, Review Analyzer
Task: 3-5 a settimana, specifici con dati
Tono: più tecnico, orientato ai risultati
Dashboard: score + trend + posizione mercato + più card

### 🌳 Thriving (score 70+)

Sblocca tutto: Competitor, Calendario, Revenue, Superhost, Guide, A/B Test, Accessibility, Tax, Regulation
Task: 3-5 avanzati, strategici
Tono: professionale, ottimizzazione fine
Dashboard: completa con tutti i widget

### 👑 Admin (ruolo speciale)

Vede tutto sbloccato sempre. Accesso a pannello admin. Determinato da campo role in profiles.

**IMPORTANTE: Durante lo sviluppo, costruire tutto sbloccato. Il lock/unlock è l'ULTIMO step.**

## Architettura Pagine

```
app/
├── page.tsx                              Landing page
├── pricing/page.tsx                      Pricing
├── features/page.tsx                     Features overview
│
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
│
├── onboarding/page.tsx                   7 slides
│
├── (dashboard)/
│   ├── layout.tsx                        Layout + bottom nav + header
│   ├── page.tsx                          Dashboard home
│   ├── analyze/page.tsx                  Listing Analyzer
│   ├── analyze/[id]/page.tsx             Dettaglio analisi storica
│   ├── titles/page.tsx                   Title & Description Generator
│   ├── description/page.tsx              Description Sections Builder
│   ├── photos/page.tsx                   Photo Coach AI
│   ├── photo-shotlist/page.tsx           Photo Shot List Generator
│   ├── tasks/page.tsx                    Weekly Tasks
│   ├── pricing-coach/page.tsx            Pricing Coach
│   ├── calendar/page.tsx                 Seasonal Calendar
│   ├── revenue/page.tsx                  Revenue Estimator
│   ├── amenities/page.tsx                Amenity Gap Finder
│   ├── reviews/page.tsx                  Review Response Generator
│   ├── review-analyzer/page.tsx          Guest Review Analyzer
│   ├── seo/page.tsx                      SEO Listing Checker
│   ├── messages/page.tsx                 Instant Reply Templates
│   ├── competitors/page.tsx              Competitor Spy + Price Watcher
│   ├── superhost/page.tsx                Superhost Tracker
│   ├── first-impression/page.tsx         First Impression Simulator
│   ├── checkin-guide/page.tsx            Check-in Guide Builder
│   ├── local-guide/page.tsx              Local Guide Generator
│   ├── welcome-book/page.tsx             Welcome Book Generator
│   ├── cleaning/page.tsx                 Cleaning Checklist
│   ├── ab-test/page.tsx                  A/B Test Suggester
│   ├── accessibility/page.tsx            Accessibility Checker
│   ├── regulations/page.tsx              Italy Regulation Helper
│   ├── tax/page.tsx                      Tax/Earning Helper
│   ├── alerts/page.tsx                   Smart Pricing Alerts
│   ├── achievements/page.tsx             Badge e achievements
│   ├── notifications/page.tsx            Centro notifiche
│   ├── listings/page.tsx                 Multi-listing manager
│   └── settings/page.tsx                 Account e abbonamento
│
├── admin/
│   ├── page.tsx                          Admin overview
│   ├── users/page.tsx                    Lista utenti
│   ├── users/[id]/page.tsx               Dettaglio utente
│   └── analytics/page.tsx                Analytics dashboard
│
├── api/
│   ├── ai/
│   │   ├── analyze/route.ts              ⛔ GIÀ FUNZIONANTE
│   │   ├── titles/route.ts               Genera titoli
│   │   ├── description/route.ts          Genera descrizione sezioni
│   │   ├── tasks/route.ts                Genera task da analisi
│   │   ├── photos/route.ts               Analisi foto (Vision)
│   │   ├── photo-shotlist/route.ts       Genera shot list
│   │   ├── reviews/route.ts              Risposta recensioni
│   │   ├── review-analyze/route.ts       Analizza pattern recensioni
│   │   ├── messages/route.ts             Template messaggi
│   │   ├── checkin-guide/route.ts        Genera guida check-in
│   │   ├── local-guide/route.ts          Genera guida locale
│   │   ├── welcome-book/route.ts         Genera welcome book
│   │   ├── cleaning/route.ts             Genera checklist pulizia
│   │   ├── seo/route.ts                  Analisi SEO
│   │   ├── pricing-suggest/route.ts      Suggerimenti prezzo
│   │   ├── first-impression/route.ts     Analisi prima impressione
│   │   └── ab-test/route.ts              Suggerimenti A/B test
│   ├── scrape/route.ts                   ⛔ Apify — NON TOCCARE
│   ├── market/
│   │   ├── competitors/route.ts          Dati competitor zona
│   │   └── pricing/route.ts              Dati pricing zona
│   ├── stripe/
│   │   ├── checkout/route.ts
│   │   ├── portal/route.ts
│   │   └── webhook/route.ts
│   ├── admin/
│   │   ├── users/route.ts                Lista utenti
│   │   ├── users/[id]/route.ts           Dettaglio utente
│   │   └── stats/route.ts                Statistiche
│   └── cron/
│       ├── weekly-tasks/route.ts         Genera task settimanali
│       ├── weekly-email/route.ts         Email digest
│       ├── competitor-watch/route.ts     Scraping competitor settimanale
│       └── market-data/route.ts          Import Inside Airbnb
│
└── layout.tsx
```

## Componenti

```
components/
├── ui/                          shadcn/ui base
├── landing/
│   ├── Hero.tsx
│   ├── HowItWorks.tsx           3 step illustrati
│   ├── FeaturesGrid.tsx
│   ├── BeforeAfter.tsx          Score prima/dopo
│   ├── PricingTable.tsx
│   ├── Testimonials.tsx
│   ├── FAQ.tsx
│   └── Footer.tsx
├── onboarding/
│   ├── OnboardingSlide.tsx
│   ├── ProgressDots.tsx
│   ├── PropertyTypeSelector.tsx
│   ├── GuestTargetSelector.tsx
│   ├── BudgetSelector.tsx
│   └── AnalysisLoader.tsx       Animazione loading analisi
├── dashboard/
│   ├── ScoreRing.tsx            Score animato circolare
│   ├── ScoreLabel.tsx           "Da migliorare" / "Ottimo" etc.
│   ├── TrendArrow.tsx           ↑ +8
│   ├── TrendChart.tsx           Grafico trend score
│   ├── MarketPosition.tsx       "Top 38%"
│   ├── RevenuePotential.tsx     "+42% potenziale"
│   ├── TaskCard.tsx
│   ├── TaskProgress.tsx         Barra settimanale
│   ├── FeatureCard.tsx          Card con icona e colore
│   ├── FeatureGrid.tsx          Grid di feature cards
│   ├── GuidedPath.tsx           Percorso per chi non ha listing
│   ├── NotificationBell.tsx
│   ├── ListingSwitcher.tsx
│   └── QuickActions.tsx
├── analyze/
│   ├── ScoreBreakdown.tsx
│   ├── ScoreBar.tsx             Barra singola area
│   ├── TipsList.tsx
│   ├── AnalysisHistory.tsx
│   └── CompareAnalyses.tsx      Confronto 2 analisi
├── photos/
│   ├── PhotoUploader.tsx
│   ├── PhotoAnalysisCard.tsx
│   ├── RoomSelector.tsx
│   ├── PhotoOrderSuggestion.tsx
│   ├── MissingPhotosChecklist.tsx
│   └── ShotListCard.tsx
├── pricing/
│   ├── PricePositionBar.tsx     Tu vs Media vs Top
│   ├── PriceCalendar.tsx
│   ├── SeasonalTips.tsx
│   ├── EventAlert.tsx
│   └── RevenueChart.tsx
├── reviews/
│   ├── ReviewInput.tsx
│   ├── ReviewResponse.tsx
│   ├── ToneSelector.tsx
│   ├── SentimentBadge.tsx
│   ├── ReviewPatterns.tsx       Pattern dalle recensioni
│   └── WordCloud.tsx
├── competitors/
│   ├── CompetitorCard.tsx
│   ├── ComparisonTable.tsx
│   └── PriceWatchAlert.tsx
├── guides/
│   ├── CheckinGuidePreview.tsx
│   ├── LocalGuidePreview.tsx
│   ├── WelcomeBookPreview.tsx
│   └── PDFExportButton.tsx
├── achievements/
│   ├── BadgeCard.tsx
│   ├── BadgeGrid.tsx
│   ├── StreakCounter.tsx
│   └── ConfettiCelebration.tsx
├── admin/
│   ├── StatsCard.tsx
│   ├── UserTable.tsx
│   ├── UserDetail.tsx
│   └── ChartCard.tsx
└── shared/
    ├── BottomNav.tsx
    ├── PageHeader.tsx
    ├── LoadingSkeleton.tsx
    ├── EmptyState.tsx
    ├── PaywallModal.tsx
    ├── CopyButton.tsx           Copia con feedback "✓ Copiato"
    ├── ImpactBadge.tsx          ALTO/MEDIO/BASSO
    ├── LevelBadge.tsx           Starter/Growing/Thriving
    └── AirbnbInstructions.tsx   "Come applicarlo su Airbnb" mini-guida
```

## Database Schema (Supabase)

```sql
-- ============================================
-- PROFILES
-- ============================================
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text,
  avatar_url text,
  role text default 'user',              -- 'user' | 'admin'
  -- Onboarding data
  has_listing boolean default false,
  property_type text,                     -- appartamento, casa, stanza, villa, loft
  location_city text,
  location_area text,
  guest_target text[],                    -- array: coppie, famiglie, business, nomadi, gruppi
  improvement_budget text,               -- 0, <300, 300-1000, 1000+
  onboarding_completed boolean default false,
  -- Livello
  level text default 'starter',          -- starter, growing, thriving
  -- Subscription
  subscription_tier text default 'free', -- free, pro
  stripe_customer_id text,
  stripe_subscription_id text,
  trial_ends_at timestamptz,
  -- Usage
  analyses_used int default 0,
  -- Gamification
  streak_weeks int default 0,
  last_task_completed_at timestamptz,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- LISTINGS
-- ============================================
create table listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  airbnb_url text not null,
  listing_name text,
  is_primary boolean default true,
  raw_data jsonb,                         -- dati grezzi Apify
  current_score int,                      -- ultimo score (denormalizzato per query veloci)
  -- Dati estratti per quick access
  listing_price numeric,
  listing_currency text default 'EUR',
  listing_rating numeric,
  listing_reviews_count int,
  listing_photo_count int,
  listing_bedrooms int,
  listing_beds int,
  listing_bathrooms int,
  listing_amenities text[],
  listing_host_response_rate text,
  -- Competitor tracking
  is_competitor boolean default false,    -- true se è un competitor monitorato
  competitor_of uuid references listings(id),
  last_scraped_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ANALYSES
-- ============================================
create table analyses (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  overall_score int,
  title_score int,
  photos_score int,
  description_score int,
  amenities_score int,
  pricing_score int,
  seo_score int,
  analysis_data jsonb,                    -- risultato completo Claude
  tips jsonb,                             -- array di consigli
  created_at timestamptz default now()
);

-- ============================================
-- TASKS
-- ============================================
create table tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id),
  analysis_id uuid references analyses(id),
  title text not null,
  description text,
  instructions text,                      -- step-by-step dettagliati
  category text,                          -- titolo, foto, descrizione, amenities, pricing, seo, reviews, altro
  impact text,                            -- alto, medio, basso
  estimated_minutes int,
  tool_link text,                         -- es. /titles, /photos
  level text,                             -- starter, growing, thriving
  completed boolean default false,
  completed_at timestamptz,
  week_start date,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================
-- GENERATED CONTENT
-- ============================================
create table generated_content (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id),
  content_type text not null,             -- title, description, description_section, review_response, message_template, checkin_guide, local_guide, welcome_book, cleaning_checklist, shot_list
  input_data jsonb,                       -- input usato per generare
  variants jsonb,                         -- output: array varianti
  selected_variant int,                   -- quale variante ha scelto l'utente
  created_at timestamptz default now()
);

-- ============================================
-- PHOTOS
-- ============================================
create table photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id),
  storage_path text,
  original_url text,                      -- URL foto dal listing Airbnb
  room_type text,                         -- soggiorno, camera, bagno, cucina, ingresso, esterno, vista
  score int,
  analysis jsonb,                         -- risultato Vision
  suggested_order int,                    -- ordine consigliato
  created_at timestamptz default now()
);

-- ============================================
-- ACHIEVEMENTS
-- ============================================
create table achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  badge_key text not null,                -- first_analysis, wordsmith, photographer, streak_4, score_80, superhost_ready, etc.
  unlocked_at timestamptz default now(),
  unique(user_id, badge_key)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  type text,                              -- task_reminder, price_alert, festivity, achievement, milestone, competitor_change, reanalyze
  title text not null,
  body text,
  link text,                              -- deep link alla pagina rilevante
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- COMPETITOR SNAPSHOTS
-- ============================================
create table competitor_snapshots (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references listings(id) on delete cascade not null,
  price numeric,
  rating numeric,
  reviews_count int,
  photo_count int,
  amenities text[],
  scraped_at timestamptz default now()
);

-- ============================================
-- MARKET DATA (Inside Airbnb + calcolato)
-- ============================================
create table market_data (
  id uuid default gen_random_uuid() primary key,
  city text not null,
  area text,
  avg_price numeric,
  median_price numeric,
  p25_price numeric,                      -- 25° percentile
  p75_price numeric,                      -- 75° percentile
  avg_rating numeric,
  avg_photos int,
  top_amenities jsonb,                    -- amenities più comuni tra top performer
  total_listings int,
  data_date date,
  created_at timestamptz default now()
);

-- ============================================
-- HOLIDAYS & EVENTS
-- ============================================
create table holidays (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  date date not null,
  country text default 'IT',
  city text,                              -- null = nazionale
  price_markup_percent int,               -- es. 40 per +40%
  category text,                          -- festività, evento, fiera, sport
  recurrence text                         -- annual, one-time
);

-- ============================================
-- ADMIN LOGS
-- ============================================
create table admin_logs (
  id uuid default gen_random_uuid() primary key,
  action text,
  user_id uuid references profiles(id),
  details jsonb,
  created_at timestamptz default now()
);

-- ============================================
-- EARNING TRACKING
-- ============================================
create table earnings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  listing_id uuid references listings(id),
  month date not null,                    -- primo del mese
  amount numeric,
  nights_booked int,
  occupancy_rate numeric,
  notes text,
  created_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table profiles enable row level security;
alter table listings enable row level security;
alter table analyses enable row level security;
alter table tasks enable row level security;
alter table generated_content enable row level security;
alter table photos enable row level security;
alter table achievements enable row level security;
alter table notifications enable row level security;
alter table competitor_snapshots enable row level security;
alter table market_data enable row level security;
alter table holidays enable row level security;
alter table earnings enable row level security;
alter table admin_logs enable row level security;

-- User policies (ogni utente vede solo i propri dati)
create policy "own_profile" on profiles for all using (auth.uid() = id);
create policy "own_listings" on listings for all using (auth.uid() = user_id);
create policy "own_analyses" on analyses for all using (auth.uid() = user_id);
create policy "own_tasks" on tasks for all using (auth.uid() = user_id);
create policy "own_content" on generated_content for all using (auth.uid() = user_id);
create policy "own_photos" on photos for all using (auth.uid() = user_id);
create policy "own_achievements" on achievements for all using (auth.uid() = user_id);
create policy "own_notifications" on notifications for all using (auth.uid() = user_id);
create policy "own_earnings" on earnings for all using (auth.uid() = user_id);

-- Competitor snapshots: visibili se il listing è dell'utente
create policy "own_competitor_data" on competitor_snapshots for all using (
  listing_id in (select id from listings where user_id = auth.uid())
);

-- Market data e holidays: leggibili da tutti gli utenti autenticati
create policy "read_market" on market_data for select using (auth.uid() is not null);
create policy "read_holidays" on holidays for select using (auth.uid() is not null);

-- Admin: accesso completo
create policy "admin_all_profiles" on profiles for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "admin_logs_access" on admin_logs for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
```

## Flusso Utente Completo

### 1. Landing Page (/)

Sezioni nell'ordine:
* Hero: titolo + sottotitolo + CTA "Inizia gratis" + mockup app
* Social proof: "500+ host migliorati" (placeholder iniziale)
* Come funziona: 3 step (Analizza → Piano personalizzato → Migliora)
* Features: grid 6-8 feature principali con icona e descrizione
* Before/After: "Da score 35 a 82 in 4 settimane"
* Pricing: 2 colonne Free vs Pro
* Testimonials: 3 card
* FAQ: accordion 8 domande
* CTA finale: "Pronto? Inizia gratis"
* Footer: link, social, copyright

### 2. Pricing (/pricing)

* Tabella Free vs Pro €29/mese dettagliata
* Trial 7 giorni gratis
* FAQ pricing
* Garanzia 14 giorni

### 3. Features (/features)

* Tutte le feature con screenshot/mockup e descrizione

### 4. Auth (/login, /signup)

* Supabase Auth email + password
* Dopo signup → /onboarding
* Dopo login → /dashboard (se onboarding fatto) o /onboarding
* Forgot password

### 5. Onboarding (/onboarding) — 7 Slides

**Slide 1 — Welcome**
"Benvenuto su BnBCoach!" Ti guideremo passo passo.
Animazione. Bottone "Iniziamo →"

**Slide 2 — Hai un listing?**
"Hai già un annuncio su Airbnb?" → "Sì" (mostra campo URL) / "No, sto iniziando"

**Slide 3 — Tipo proprietà**
Card selezionabili con icone: Appartamento, Stanza, Casa, Villa, Loft, Altro

**Slide 4 — Location**
Input: Città + Zona/Quartiere

**Slide 5 — Target ospiti**
Multi-select con icone: Coppie, Famiglie, Business, Nomadi digitali, Gruppi

**Slide 6 — Budget**
Card: €0 / Fino a €300 / Fino a €1000 / €1000+
Nota: "Molti miglioramenti sono gratis!"

**Slide 7 — Loading**
Se URL dato: "Analizziamo il tuo listing..." con progress animato
Se no URL: "Prepariamo il tuo piano..."
Al completamento → redirect /dashboard

Salvataggio: tutto in profiles. Se URL → analisi automatica → salva in listings + analyses → genera task → salva in tasks.

### 6. Dashboard (/dashboard)

**Se ha listing analizzato:**
* Score ring animato grande
* Label livello (Starter/Growing/Thriving)
* Trend: ↑ +8 rispetto a ultima analisi
* Posizione mercato: "Top 38% nella tua zona"
* Revenue potential: "Con score 80+ puoi guadagnare +42%"
* Sezione "Questa settimana": progress bar + task cards
* Sezione "I tuoi strumenti": feature grid
* Sezione "Notifiche": ultime 3

**Se NON ha listing:**
* Percorso guidato step-by-step:
  1. Prepara le foto → Photo Coach
  2. Scrivi il titolo → Title Generator
  3. Scrivi la descrizione → Description Builder
  4. Scegli i servizi → Amenity checklist
  5. Imposta il prezzo → Pricing Coach
  6. Pubblica su Airbnb → istruzioni
  7. Inserisci URL → prima analisi
* Progress visuale per ogni step

### 7. Bottom Navigation

5 tab fissi:
* Home → /dashboard
* Analizza → /analyze
* Foto → /photos
* Task → /tasks
* Profilo → /settings

Per admin: Profilo è sostituito da Admin → /admin

## Feature Dettagliate

### F1. Listing Analyzer (/analyze) — CUORE, GIÀ FUNZIONANTE

⛔ Non toccare la logica di analisi. Aggiungere:
* Salvataggio in DB (listings + analyses) dopo analisi
* Storico: lista analisi passate con data + score
* Confronto tra analisi: "Score 45 → 62 in 3 settimane"
* Bottone "Aggiorna analisi" per rianalizzare
* Dettaglio per area con consigli espandibili
* Rate limit: 1 analisi free, illimitate Pro

### F2. Title & Description Generator (/titles)

AI: Claude Sonnet
Input: dati listing + profilo utente
Output titoli (5 varianti):
* Testo, score SEO 1-100, keywords evidenziate, tono (cozy/modern/luxury/minimal/family), character count (max 50), preview search result Airbnb
Output descrizioni (3 varianti):
* Testo strutturato, score SEO, keywords, tono adattato al target
UI: Tab Titoli/Descrizioni, CopyButton, Rigenera
Salvataggio: generated_content

### F3. Description Sections Builder (/description)

AI: Claude Sonnet
Airbnb ha campi specifici: Lo spazio, Accesso ospiti, Altre info, Il quartiere, Come muoversi.
Genera ogni sezione separatamente ottimizzata.
CopyButton per ogni sezione con mini-guida "dove incollare su Airbnb".

### F4. Photo Coach AI (/photos)

AI: Claude Vision (Sonnet con immagini)
Input: foto caricate (max 15) oppure foto dal listing (URL)
Per ogni foto:
* Score 1-10
* Stanza identificata
* Luminosità, composizione, ordine, staging
* Istruzioni reshoot concrete
Extra:
* Ordine consigliato foto (prima = più click)
* Checklist foto mancanti
* Confronto: "Top performer hanno 18 foto, tu ne hai 8"
* Room-by-room view

### F5. Photo Shot List Generator (/photo-shotlist)

AI: Claude Sonnet
Basato su tipo alloggio, genera lista foto da scattare:
* Numero, stanza, angolazione, ora consigliata, cosa mostrare/nascondere
* Stampabile come checklist PDF

### F6. Weekly Tasks (/tasks)

AI: Claude Sonnet (per generare task)
Generazione: dopo analisi, basata su score + profilo + livello + task già completati + stagionalità
Struttura task: titolo, descrizione, istruzioni step-by-step, categoria, impatto (ALTO/MEDIO/BASSO), tempo stimato, link strumento, livello
UI: progress bar, lista con filtri, checkbox animate, streak counter
Confetti quando completi tutti i task della settimana.

### F7. Pricing Coach (/pricing-coach)

NO AI — calcolo su dati Inside Airbnb + market_data
* Barra posizionamento: Tu vs Media vs Top (25°/50°/75° percentile)
* Prezzo consigliato con motivazione
* "Sei al 25° percentile, con queste migliorie puoi arrivare al 60°"

### F8. Seasonal Calendar (/calendar)

NO AI — dati da holidays + market_data
* Vista mensile, prezzo suggerito per giorno
* Colori: puoi alzare, nella media, attenzione
* Festività evidenziate con markup %
* Stagionalità alta/media/bassa
* Istruzioni per applicare su Airbnb

### F9. Revenue Estimator (/revenue)

NO AI — formula: prezzo × occupancy stimata × giorni
* Scenario attuale vs ottimizzato
* Breakdown mensile (grafico barre recharts)
* Differenza annua stimata

### F10. Amenity Gap Finder (/amenities)

NO AI — confronto dati listing vs market_data.top_amenities
* Lista amenities tue vs top performer zona
* Per ogni mancante: impatto stimato, costo implementazione, link acquisto
* Categorizzato: Essenziali / Comfort / Premium

### F11. Review Response Generator (/reviews)

AI: Claude Sonnet
* Input: testo recensione (copia-incolla)
* Analisi sentiment (positiva/neutra/negativa/mista)
* Output: risposta professionale
* Tono selezionabile: formale / caloroso / conciso
* CopyButton + istruzioni Airbnb

### F12. Guest Review Analyzer (/review-analyzer)

AI: Claude Sonnet
* Input: tutte le recensioni (copia-incolla batch o da scraping listing)
* Pattern: "60% menziona pulizia positivamente, 30% lamenta rumore"
* Punti forza e debolezza
* Word cloud (se possibile)
* Sentiment trend
* Task automatici basati sui problemi emersi

### F13. SEO Listing Checker (/seo)

AI: Claude Sonnet
* Analisi keyword nel titolo e descrizione
* Keyword mancanti per la zona
* Character count ottimizzazione
* Preview search result
* Score SEO complessivo

### F14. Instant Reply Templates (/messages)

AI: Claude Sonnet
Template per ogni momento:
* Pre-booking, conferma, pre-arrivo, welcome, mid-stay, post-checkout, FAQ
* Personalizzati con placeholder: {nome_ospite}, {data_checkin}, {wifi_password}
* Tono adattabile
* CopyButton per ognuno

### F15. Competitor Spy + Price Watcher (/competitors)

Scraping: Apify (1x/settimana per competitor salvati)
* Utente salva 3-5 URL competitor
* Mostra: prezzo, rating, foto, amenities per ognuno
* Confronto: "Tu vs Media competitor" per ogni metrica
* Alert: "Competitor ha abbassato prezzo"
* Snapshots storici in competitor_snapshots

### F16. First Impression Simulator (/first-impression)

NO AI — UI mockup con dati listing
* Preview card come appare nei risultati Airbnb
* Foto principale + titolo + prezzo + stelle
* Confronto con listing vicini
* Suggerimenti per migliorare la prima impressione

### F17. Superhost Tracker (/superhost)

NO AI — confronto dati vs criteri fissi
Criteri Airbnb: 4.8+ stelle, <1% cancellazioni, 10+ soggiorni/anno, 90%+ response rate
* Progress bar per ogni criterio
* "Ti mancano 0.2 stelle, ecco come arrivarci"
* Checklist azioni per raggiungere Superhost

### F18. Check-in Guide Builder (/checkin-guide)

AI: Claude Sonnet
* Input: indirizzo, codice portone, piano, wifi, regole casa
* Output: guida strutturata bella
* Multilingua: IT, EN, FR, DE, ES
* Export PDF
* QR code per versione digitale

### F19. Local Guide Generator (/local-guide)

AI: Claude Sonnet
* Input: indirizzo, tipo ospiti
* Output: guida quartiere categorizzata
  * "A 5 minuti": ristoranti, bar, supermercato
  * "A 10 minuti": attrazioni, farmacia, ATM
  * "Da non perdere": specialità zona
* Export PDF o link condivisibile

### F20. Welcome Book Generator (/welcome-book)

AI: Claude Sonnet
Più completo del check-in guide:
* Copertina con nome listing
* Sezioni: benvenuto, regole, wifi, elettrodomestici, quartiere, emergenze, checkout
* Multilingua
* Export PDF professionale
* QR code

### F21. Cleaning Checklist (/cleaning)

AI: Claude Sonnet (genera una volta, poi è statico)
* Basata su tipo alloggio e numero stanze
* Stanza per stanza: cosa pulire, controllare, rifornire
* Timer stimato per ogni stanza
* Lista scorte
* Stampabile PDF

### F22. A/B Test Suggester (/ab-test)

AI: Claude Sonnet
* Suggerisce test: "Prova titolo A per 2 settimane, poi titolo B"
* Tracking manuale: input prenotazioni/views per periodo
* Confronto risultati
* Suggerimenti basati sui dati

### F23. Accessibility Checker (/accessibility)

NO AI — checklist fissa
* Lista filtri accessibilità Airbnb
* Per ognuno: "Lo offri?" → sì/no
* Suggerimenti: "Aggiungere info accessibilità aumenta visibilità del 12%"
* Focus su cose indicabili senza modifiche strutturali

### F24. Smart Pricing Alerts (/alerts)

NO AI — database eventi + logica
* Alert festività imminenti (da tabella holidays)
* Alert eventi locali
* Alert: "Non analizzi da 30 giorni"
* Alert: "Competitor ha cambiato prezzo"
* Alert: "Hai completato task, rianalizza!"

### F25. Italy Regulation Helper (/regulations)

NO AI — contenuto statico/semi-statico
* Checklist burocrazia: CIR, tassa di soggiorno, SCIA, Questura (Alloggiati Web)
* Guida regione per regione
* Link diretti a portali regionali
* Reminder comunicazione Questura
* Info cedolare secca

### F26. Tax / Earning Helper (/tax)

NO AI — calcoli
* Input: guadagni mensili (manuale)
* Calcolo cedolare secca 21%
* Stima tasse annue
* Reminder scadenze
* Export per commercialista
* Disclaimer: "Non siamo commercialisti"

### F27. Achievement System (/achievements)

NO AI — logica condizionale
Badge:
* Prima Analisi
* Wordsmith (generato e applicato titolo)
* Fotografo (migliorato tutte le foto)
* Streak 4 (4 settimane consecutive)
* Streak 8
* Score 60+
* Score 80+
* Superhost Ready
* Comunicatore (generato 10+ risposte)
* Analista (3+ analisi)
* Guida Perfetta (creato check-in + local guide)
* Revenue Master (stima revenue calcolata)
UI: grid badge, locked/unlocked, confetti su unlock

### F28. Notifications (/notifications)

Lista tutte le notifiche con read/unread. Bell icon nella dashboard con badge count.

### F29. Multi-listing (/listings)

* Lista tutti i listing dell'utente
* Card per ognuno con score
* "Aggiungi listing" → URL
* Switcher nella dashboard
* Score e task indipendenti per listing

### F30. Settings (/settings)

* Modifica profilo (dati onboarding)
* Gestione abbonamento (Stripe portal)
* Notifiche email on/off
* Lingua (IT default)
* Elimina account
* Logout

## Admin Panel

### /admin — Overview

* Utenti totali, Pro, free
* MRR (Monthly Recurring Revenue)
* Analisi totali eseguite
* Task completati totale
* Signup trend (grafico)
* Conversione free→Pro (%)

### /admin/users — Lista utenti

* Tabella: nome, email, livello, tier, score, data signup
* Filtri: tier, livello, data
* Cerca per email/nome
* Click → dettaglio

### /admin/users/[id] — Dettaglio utente

* Profilo completo
* Listing con score
* Storico analisi
* Task completati/pendenti
* Subscription info
* Azioni: dare Pro gratis, cambiare ruolo, vedere come utente

### /admin/analytics — Analytics

* Grafici: signup over time, retention, feature usage
* Metriche: DAU, WAU, MAU
* Top feature usate
* Churn rate

## Pricing Model

### Free (per sempre)

* Onboarding completo
* 1 analisi listing
* Score + breakdown visibile
* 3 task iniziali
* 1 generazione titoli
* Preview tutte le feature (vedi ma non usi)
* Regulation helper (contenuto statico)

### Pro €29/mese (7 giorni trial)

* Analisi illimitate
* Task settimanali illimitati
* Tutti gli strumenti AI
* Photo Coach completo
* Pricing Coach + Calendar
* Competitor Spy (fino a 5 competitor)
* Template messaggi
* Guide (check-in, local, welcome book) con PDF export
* Revenue Estimator
* Superhost Tracker
* Review Analyzer
* Achievement completi
* Email digest settimanale
* Multi-listing (fino a 5)
* Smart Alerts

### Futuro: Pro+ €49/mese

* Multi-listing illimitati
* Report PDF mensili
* Priority support

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

## Roadmap di Sviluppo

### FASE 1 — Foundation (Auth + Onboarding + DB)

1. Creare TUTTE le tabelle in Supabase (vedi schema sopra)
2. Setup Supabase Auth (email/password)
3. Pagine login + signup
4. Middleware auth (proteggi /dashboard/*)
5. Onboarding 7 slides con salvataggio profilo
6. Redirect logic: signup→onboarding→dashboard, login→dashboard
7. Se URL dato in onboarding → lancia analisi automatica (usa flusso ESISTENTE)

### FASE 2 — Persistenza + Dashboard

1. Dopo analisi (SENZA toccare logica analisi) → salva in listings + analyses
2. Dashboard layout con bottom nav
3. Score ring + trend + market position
4. Feature grid cards
5. Se no listing → guided path
6. Storico analisi (lista + dettaglio + confronto)

### FASE 3 — Tasks + Gamification

1. API route genera task da analisi (Claude Sonnet)
2. Salva task in DB
3. UI tasks: progress bar, lista, checkbox, filtri
4. Streak counter
5. Achievement system (tabella + logica unlock + UI)
6. Confetti su milestone

### FASE 4 — Content Generation

1. Title & Description Generator
2. Description Sections Builder
3. SEO Listing Checker
4. First Impression Simulator
5. CopyButton + Airbnb instructions ovunque

### FASE 5 — Photo Coach

1. Photo upload (Supabase Storage)
2. Analisi Claude Vision per ogni foto
3. UI risultati foto
4. Ordine consigliato
5. Missing photos checklist
6. Photo Shot List Generator

### FASE 6 — Pricing & Market

1. Import dati Inside Airbnb in market_data
2. Pricing Coach (posizionamento, suggerimento)
3. Seasonal Calendar con holidays
4. Revenue Estimator
5. Popolare tabella holidays (festività italiane + principali europee)

### FASE 7 — Reviews & Messages

1. Review Response Generator
2. Guest Review Analyzer
3. Instant Reply Templates
4. Tone selector

### FASE 8 — Competitors

1. Aggiunta competitor (URL)
2. Scraping settimanale competitor
3. Confronto UI
4. Price watch alerts
5. Competitor snapshots

### FASE 9 — Guides & Documents

1. Check-in Guide Builder + PDF export
2. Local Guide Generator + PDF
3. Welcome Book Generator + PDF
4. Cleaning Checklist + PDF

### FASE 10 — Italy Special

1. Regulation Helper (contenuto statico regione per regione)
2. Tax/Earning Helper (input manuale + calcoli)
3. Reminder Questura

### FASE 11 — Advanced Features

1. Superhost Tracker
2. A/B Test Suggester
3. Accessibility Checker
4. Smart Pricing Alerts
5. Notification center
6. Multi-listing support

### FASE 12 — Monetization

1. Stripe checkout
2. Stripe webhook
3. Stripe customer portal
4. Paywall modal
5. Free tier limits enforcement
6. Trial 7 giorni

### FASE 13 — Admin Panel

1. Admin overview con stats
2. Users list + detail
3. Analytics dashboard
4. Admin-only middleware

### FASE 14 — Landing & Marketing

1. Landing page completa
2. Pricing page
3. Features page
4. SEO meta tags
5. Open Graph images

### FASE 15 — Level System (ULTIMO)

1. Logica calcolo livello (da score)
2. Feature lock/unlock per livello
3. UI indicatori livello
4. Transizione livello con animazione
5. Unlock notification

### FASE 16 — Polish

1. Email digest settimanale (Resend)
2. PostHog analytics
3. Error tracking
4. Performance optimization
5. Accessibility (WCAG)
6. Final testing

## AI Usage Map

| Feature | AI Model | Costo/call |
|---------|----------|------------|
| Listing Analysis | Sonnet (⛔ esistente) | ~€0.03 |
| Title Generator | Sonnet | ~€0.02 |
| Description Generator | Sonnet | ~€0.02 |
| Description Sections | Sonnet | ~€0.02 |
| Task Generator | Sonnet | ~€0.01 |
| Photo Coach | Sonnet Vision | ~€0.05-0.10/foto |
| Shot List | Sonnet | ~€0.01 |
| Review Response | Sonnet | ~€0.01 |
| Review Analyzer | Sonnet | ~€0.03 |
| SEO Check | Sonnet | ~€0.02 |
| Message Templates | Sonnet | ~€0.01 |
| Check-in Guide | Sonnet | ~€0.02 |
| Local Guide | Sonnet | ~€0.02 |
| Welcome Book | Sonnet | ~€0.03 |
| Cleaning Checklist | Sonnet | ~€0.01 |
| First Impression | Sonnet | ~€0.02 |
| A/B Suggestions | Sonnet | ~€0.01 |
| Pricing Suggest | Sonnet | ~€0.02 |

Features SENZA AI (puro calcolo/dati): Pricing Coach, Calendar, Revenue Estimator, Amenity Gap, Superhost Tracker, Accessibility Checker, Regulation Helper, Tax Helper, Achievement System, Notifications, Alerts, First Impression Simulator (partial), Multi-listing, Admin Panel

## Comandi Utili

```bash
npm run dev          # Dev server localhost:3000
npm run build        # Build produzione
vercel               # Deploy preview
vercel --prod        # Deploy produzione
```

## Regole per Claude Code

### Generali

* TypeScript ovunque
* 'use client' solo dove serve, preferisci Server Components
* Gestisci errori con try/catch + feedback utente (toast)
* API key MAI nel frontend
* Commenti codice in inglese, UI in italiano
* Mobile-first sempre

### UX

* Skeleton loading states (mai spinner)
* Toast per feedback azioni
* Empty states curati con CTA
* CopyButton su ogni output generato
* Istruzioni "Come applicarlo su Airbnb" dove serve
* Transizioni pagina smooth

### Sicurezza

* RLS su tutte le tabelle
* Admin routes protette da role check
* Rate limiting su API AI
* Input sanitization

### ⛔ Ripeto: NON TOCCARE

* La route di analisi listing
* La logica Apify/scraping
* Il prompt di analisi
* Le env variables
* La config Vercel/Supabase/GitHub
