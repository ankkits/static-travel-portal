import { createClient } from "npm:@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...cors, "Content-Type": "application/json" }
  })
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  try {
    const body = await req.json()
    if (body.honeypot) return json({ error: "Invalid request" }, 400)

    const required = ["customer_name", "customer_phone", "trip_type", "from_airport", "to_airport", "cabin"]
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === "") {
        return json({ error: `Missing field: ${field}` }, 400)
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}")
    const secretKey = secretKeys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    if (!secretKey) return json({ error: "Server database configuration is incomplete" }, 500)

    const admin = createClient(supabaseUrl, secretKey)
    const record = {
      customer_name: String(body.customer_name).trim().slice(0, 150),
      customer_phone: String(body.customer_phone).trim().slice(0, 40),
      customer_email: body.customer_email ? String(body.customer_email).trim().slice(0, 200) : null,
      trip_type: body.trip_type === "One way" ? "One way" : "Round trip",
      from_airport: String(body.from_airport).trim().slice(0, 150),
      to_airport: String(body.to_airport).trim().slice(0, 150),
      departure_date: body.departure_date || null,
      return_date: body.return_date || null,
      adults: Math.max(1, Math.min(20, Number(body.adults) || 1)),
      children: Math.max(0, Math.min(20, Number(body.children) || 0)),
      cabin: String(body.cabin).slice(0, 40),
      status: "new",
      notification_status: "pending"
    }

    const { data, error } = await admin.from("travel_enquiries").insert(record).select("id,created_at").single()
    if (error) return json({ error: error.message }, 500)

    const message = [
      "✈️ NEW TRAVEL ENQUIRY", "",
      `Customer: ${record.customer_name}`,
      `Phone: ${record.customer_phone}`,
      record.customer_email ? `Email: ${record.customer_email}` : null,
      "", `Trip: ${record.trip_type}`, `From: ${record.from_airport}`, `To: ${record.to_airport}`,
      `Departure: ${record.departure_date || "Flexible"}`,
      record.trip_type === "Round trip" ? `Return: ${record.return_date || "Flexible"}` : null,
      `Passengers: ${record.adults} Adult(s), ${record.children} Child(ren)`,
      `Cabin: ${record.cabin}`, "",
      `Enquiry ID: ${data.id}`,
      "Please search available options and contact the customer."
    ].filter(Boolean).join("\n")

    const webhook = Deno.env.get("NOTIFICATION_WEBHOOK_URL")
    if (!webhook) {
      await admin.from("travel_enquiries").update({ notification_status: "not_configured" }).eq("id", data.id)
      return json({ id: data.id, created_at: data.created_at, notification: "not_configured" })
    }

    try {
      const notify = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enquiry_id: data.id,
          text: message,
          customer: { name: record.customer_name, phone: record.customer_phone, email: record.customer_email },
          trip: record
        })
      })
      const notification_status = notify.ok ? "sent" : "failed"
      await admin.from("travel_enquiries").update({ notification_status }).eq("id", data.id)
      return json({ id: data.id, created_at: data.created_at, notification: notification_status })
    } catch {
      await admin.from("travel_enquiries").update({ notification_status: "failed" }).eq("id", data.id)
      return json({ id: data.id, created_at: data.created_at, notification: "failed" })
    }
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unexpected error" }, 500)
  }
})
