# 🌿 Plant Pokedex

A Pokedex-style catalog for your house plants. Each plant gets a **Type** based on its genus (Tropical, Succulent, Cactus, Fern, etc.), and you can log and track watering schedules.

Built with **Next.js**, **Supabase** (database + auth), deployed on **Vercel**, source on **GitHub**.

---

## 1. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → create a free project.
2. Once it's ready, open **SQL Editor** and paste in the contents of `supabase/schema.sql` from this repo, then run it.
   - This creates `plants`, `watering_logs`, and a `genus_types` lookup table.
   - It also sets up Row Level Security so each user only sees their own plants.
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key

### Optional: enable login
This app works out of the box without login (plants are stored with `user_id = null`), but if you want per-user collections:
- Go to **Authentication → Providers** and enable Email or another provider.
- Add a simple login page using `supabase.auth.signInWithOtp()` or `signInWithPassword()` — happy to help you add this next.

---

## 2. Run locally

```bash
git clone <your-repo-url>
cd plant-pokedex
npm install
cp .env.local.example .env.local
```

Edit `.env.local` and paste in your Supabase URL + anon key:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Then:

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: plant pokedex"
gh repo create plant-pokedex --public --source=. --push
```

(Or create a repo manually on GitHub and `git remote add origin <url>` then `git push -u origin main`.)

---

## 4. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo.
2. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Click **Deploy**.

Every push to `main` will auto-deploy.

---

## How the "Type" system works

Each plant has a `genus` (e.g. *Monstera*, *Echeveria*, *Nephrolepis*). A SQL trigger looks up the genus in the `genus_types` table and assigns a `type` automatically:

| Genus examples | Type |
|---|---|
| Monstera, Philodendron, Calathea | Tropical |
| Echeveria, Haworthia, Sedum | Succulent |
| Opuntia, Mammillaria | Cactus |
| Nephrolepis, Adiantum | Fern |
| Sansevieria, Zamioculcas | Structural |
| Spathiphyllum, Phalaenopsis | Flowering |

You can add more genus → type mappings any time by inserting rows into `genus_types` in Supabase.

## Watering tracking

Each plant has a `watering_interval_days` field. Hitting **💧 Log Watering** on a plant's detail page inserts a row into `watering_logs` with a timestamp. The home page and detail page calculate days-since-last-watered and flag plants as "Overdue" once they pass their interval.

## Project structure

```
app/
  page.js              -> Pokedex grid (home page)
  add/page.js           -> Add new plant form
  plants/[id]/page.js   -> Plant detail + watering log
  layout.js, globals.css
components/
  PlantCard.js
lib/
  supabaseClient.js
  utils.js              -> type colors, date helpers
supabase/
  schema.sql            -> run this in Supabase SQL editor
```

## Ideas to extend

- Add login so each person has their own private Pokedex
- Image upload directly to Supabase Storage instead of pasting a URL
- Push/email notifications when a plant is overdue for watering
- "Shiny" rare plant variants, achievement badges, etc.
