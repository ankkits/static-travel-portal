# Travel Portal — Render + Supabase + WhatsApp

A Vite/React static travel portal designed for Render Static Site hosting.

## Architecture

Browser/React -> Supabase HTTPS API -> PostgreSQL

Customers first enter their travel search. Only after the search is captured do we ask for name/phone/email, then submit the complete enquiry to Supabase through an Edge Function. The confirmation is shown on screen; the site does not automatically open WhatsApp.

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

## Enquiries and messaging

The flight form no longer opens WhatsApp. It captures the search first, then collects customer contact details in a second step. It shows a confirmation/callback summary on screen and sends the complete enquiry to the Supabase `submit-enquiry` Edge Function.

The Edge Function stores the enquiry in `travel_enquiries`. If `NOTIFICATION_WEBHOOK_URL` is configured, it also POSTs the enquiry to that webhook. This makes the notification layer provider-neutral: you can connect n8n, Make, Zapier, a WhatsApp provider, or another team messaging service without exposing credentials in the browser.

For direct WhatsApp/Instagram messaging, use the provider's server-side API credentials only inside the Edge Function or an automation service. Do not put those secrets in Vite/React environment variables.

## Future flight API

Keep supplier/API credentials out of React. Add a backend such as an Azure Function:

React -> Azure Function -> supplier API

The current UI can later call that backend without changing the overall Render deployment.


## Supabase Edge Function deployment

1. Run `supabase/schema.sql` in the Supabase SQL Editor.
2. In Supabase Dashboard, create/deploy the `submit-enquiry` Edge Function using `supabase/functions/submit-enquiry/index.ts`.
3. The function uses Supabase server-side secrets to insert the enquiry. Supabase provides those secrets to Edge Functions; never expose a secret/service key in the browser.
4. Optional: set the production secret `NOTIFICATION_WEBHOOK_URL` in Supabase Edge Function Secrets.
5. The browser only calls `/functions/v1/submit-enquiry`.

### Notification workflow

Recommended first production workflow:

Website → Supabase Edge Function → `travel_enquiries` + notification webhook → team messaging service

The webhook payload contains a ready-to-send `text` message plus structured `customer` and `trip` data.

You can initially leave the webhook unset. Enquiries will still be saved to Supabase and the customer will see the on-screen confirmation.
