# Travel Portal — Render + Supabase + WhatsApp

A Vite/React static travel portal designed for Render Static Site hosting.

## Architecture

Browser/React -> Supabase HTTPS API -> PostgreSQL

Flight requests currently go to WhatsApp. A future live flight supplier API should be called from a backend/serverless function so supplier credentials never reach the browser.

## Local setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_WHATSAPP_NUMBER` (country code + number, digits only)
4. Run `npm install`
5. Run `npm run dev`
6. Run `npm run build`

## Render

Create a Static Site.

Build command:
`npm install && npm run build`

Publish directory:
`dist`

Add the three VITE environment variables in Render.

## Supabase

Create a Supabase project, open SQL Editor, and run `supabase/schema.sql`.

The SQL creates the holiday_packages table, enables RLS, permits public reads only for active packages, and inserts sample packages.

Never put a PostgreSQL password or Supabase service-role key into VITE variables.

## WhatsApp

For the MVP, the site opens a WhatsApp chat using a wa.me link with a prefilled booking request.

`VITE_WHATSAPP_NUMBER` should be digits only, including country code. Example:
`919876543210`

This does not require the WhatsApp Business API. The receiving WhatsApp account/group must be able to receive the chat.

For a team/group workflow, a simple operational approach is to use one business/team number and have agents handle the incoming requests. Direct browser-to-WhatsApp-group messaging is not supported by a normal wa.me link.

## Future flight API

Keep supplier/API credentials out of React. Add a backend such as an Azure Function:

React -> Azure Function -> supplier API

The current UI can later call that backend without changing the overall Render deployment.
