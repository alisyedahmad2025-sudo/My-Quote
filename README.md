# My QUOTE — construction & engineering quotation builder

A standalone web app (not a Claude artifact) with real, free, self-serve
sign-up: anyone can create an account with their own email and password,
and their quotations, clients, rate library and company profile are
private to their account.

This guide takes about 15–20 minutes and costs nothing at normal usage
levels — everything below is on free tiers.

## What you're setting up

- **Supabase** (free tier) — handles account sign-up/login and stores each
  account's data, locked down so one account can never see another's data.
- **Vercel** (free tier) — hosts the app itself at a public URL, and runs
  the one optional serverless function for the AI assistant.

---

## 1. Create your Supabase project

1. Go to https://supabase.com, sign up, and click **New project**.
2. Pick any name and password (the database password — save it somewhere,
   you likely won't need it again for this app).
3. Wait ~2 minutes for the project to finish provisioning.
4. In the left sidebar, open **SQL Editor** → **New query**, paste in the
   entire contents of `supabase-schema.sql` (included in this project),
   and click **Run**. This creates the one table the app needs and locks
   it down with row-level security, so every account only ever sees its
   own data.
5. In the left sidebar, open **Project Settings → API**. You'll need two
   values from this page in step 3 below:
   - **Project URL**
   - **anon public** key

### Optional but recommended: email confirmation

By default Supabase requires a new user to click a confirmation link in
their email before they can sign in. That's good for a real public app.
If you want people to be able to sign up and use the app immediately
without checking email (e.g. while you're testing), go to
**Authentication → Providers → Email** and turn **Confirm email** off.
You can turn it back on later before a real public launch.

---

## 2. Get the code onto GitHub

1. Create a new empty repository on GitHub.
2. Push this project folder to it:
   ```bash
   cd my-quote-web
   git init
   git add .
   git commit -m "My QUOTE"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

---

## 3. Deploy to Vercel

1. Go to https://vercel.com, sign up (you can sign up with your GitHub
   account), and click **Add New → Project**.
2. Import the GitHub repository you just pushed.
3. Vercel will auto-detect it as a Vite app — leave the build settings as
   default.
4. Before deploying, open **Environment Variables** and add:
   - `VITE_SUPABASE_URL` → your Supabase Project URL from step 1.5
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon public key from step 1.5
   - `ANTHROPIC_API_KEY` → optional, only needed for the AI Quotation
     Assistant feature (get one from https://console.anthropic.com). Skip
     it if you don't need that feature — everything else works fine
     without it.
5. Click **Deploy**. In about a minute you'll get a live URL like
   `https://my-quote-yourname.vercel.app` — that's your public app.

That's it. Anyone who visits that URL can click **Create account**, sign
up with their own email and password, and start using the app for free.
Their data is private to their account.

---

## Running it locally (optional, for testing before you deploy)

```bash
cd my-quote-web
npm install
cp .env.example .env
# edit .env and fill in your Supabase URL + anon key
npm run dev
```
Opens at http://localhost:5173. The AI assistant won't work locally
unless you also run `vercel dev` instead of `npm run dev` (so the
`/api/ai-assist` serverless function is available) with
`ANTHROPIC_API_KEY` set in your shell or `.env`.

---

## How the pieces fit together

- **Accounts & login**: real Supabase Auth (email + password). Nothing
  here is a demo — a wrong password is rejected, forgotten passwords can
  be reset by email, and each account is a real row in Supabase's
  `auth.users` table.
- **Data isolation**: every quotation, client, rate-library entry, and
  the company profile are stored in one `user_data` table, tagged with
  the owner's account ID, with row-level security policies that make it
  physically impossible (not just hidden in the UI) for one account to
  read or write another account's rows.
- **AI Quotation Assistant**: optional. It calls `/api/ai-assist`, a
  tiny serverless function that holds your Anthropic API key server-side
  and forwards the request — your key is never sent to anyone's browser.
  If you don't set `ANTHROPIC_API_KEY`, that one button shows a friendly
  "not configured" message; everything else in the app is unaffected.
- **PDF/quotation download**: generates a standalone, print-ready HTML
  file client-side — no server needed for that part.

## What's still worth adding before a real public launch

- A privacy policy / terms page, since you're now collecting real user
  emails.
- Custom domain (Vercel → Project → Settings → Domains) instead of the
  `.vercel.app` URL, if you want your own domain.
- Supabase's free tier pauses a project after a week of no activity (it
  wakes back up automatically on the next request, with a few seconds'
  delay) and has usage caps well above what a small app needs — check
  Supabase's current pricing page if you expect heavy traffic.
- Vercel's free tier is generous for a small-to-medium app but also has
  usage limits — check Vercel's current pricing page if traffic grows a
  lot.
