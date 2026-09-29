# Deploy submit-enquiry

The SQL table and the Edge Function are separate deployments.

1. Install Supabase CLI.
2. From the project root:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy submit-enquiry
```

3. In Supabase Dashboard → Edge Functions, confirm `submit-enquiry` exists and is deployed.
4. Keep the function URL as:
`https://YOUR_PROJECT_REF.supabase.co/functions/v1/submit-enquiry`

The React app calls that URL using `VITE_SUPABASE_URL`.
