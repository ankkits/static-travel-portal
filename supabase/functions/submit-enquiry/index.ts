import { createClient } from "npm:@supabase/supabase-js@2"

const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS"}
function json(data: unknown, status=200){return new Response(JSON.stringify(data),{status,headers:{...cors,"Content-Type":"application/json"}})}
const clean=(v:unknown,max=200)=>v==null?null:String(v).trim().slice(0,max)
const validTypes=['flight','flight_hotel','hotel','holiday']
const typeLabel=(t:string)=>({flight:"flight",flight_hotel:"flight + hotel",hotel:"hotel",holiday:"holiday"}[t]||t)

Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors})
  if(req.method!=='POST') return json({error:'Method not allowed'},405)
  try{
    const body=await req.json()
    if(body.honeypot) return json({error:'Invalid request'},400)
    const enquiryType=clean(body.enquiry_type,30) || 'flight'
    if(!validTypes.includes(enquiryType)) return json({error:'Invalid enquiry type'},400)
    for(const field of ['customer_name','customer_phone']) if(!clean(body[field])) return json({error:`Missing field: ${field}`},400)
    const supabaseUrl=Deno.env.get('SUPABASE_URL')!
    const secretKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if(!secretKey) return json({error:'Server database configuration is incomplete'},500)
    const admin=createClient(supabaseUrl,secretKey)
    const isFlight=enquiryType==='flight'
    const isFlightHotel=enquiryType==='flight_hotel'
    const isHotel=enquiryType==='hotel'
    const isHoliday=enquiryType==='holiday'
    const origin=clean(body.origin_city,150)
    const destination=clean(body.destination_city,150)
    const record={
      customer_name:clean(body.customer_name,150), customer_phone:clean(body.customer_phone,40), customer_email:clean(body.customer_email,200),
      enquiry_type:enquiryType,
      trip_type:isHoliday?'holiday':isHotel?'hotel':(body.trip_type==='One way'?'One way':'Round trip'),
      from_airport:isHoliday?'Holiday Package':(origin || 'Not specified'),
      to_airport:isHoliday?(clean(body.package_name,200)||destination||'Holiday'):(destination || 'Not specified'),
      departure_date:body.departure_date||null, return_date:body.return_date||null,
      adults:Math.max(1,Math.min(20,Number(body.adults)||1)), children:Math.max(0,Math.min(20,Number(body.children)||0)),
      cabin:clean(body.cabin,40)||'Not applicable', hotel_rooms:Math.max(1,Math.min(20,Number(body.hotel_rooms)||1)),
      tentative_dates:isHoliday?clean(body.tentative_dates,200):null, package_id:body.package_id||null, package_name:isHoliday?clean(body.package_name,200):null,
      status:'new', notification_status:'pending'
    }
    const {data,error}=await admin.from('travel_enquiries').insert(record).select('id,created_at').single()
    if(error) return json({error:error.message},500)

    const enquiryHeading={
      flight:'✈️ NEW FLIGHT ENQUIRY',
      flight_hotel:'✈️🏨 NEW FLIGHT + HOTEL ENQUIRY',
      hotel:'🏨 NEW HOTEL ENQUIRY',
      holiday:'✦ NEW HOLIDAY ENQUIRY'
    }[enquiryType] || 'NEW TRAVEL ENQUIRY'

    const lines=[
      enquiryHeading,'',
      `Customer: ${record.customer_name}`,
      `Phone: ${record.customer_phone}`,
      record.customer_email?`Email: ${record.customer_email}`:null,'',
      ...(isFlight || isFlightHotel?[
        `From: ${record.from_airport}`,
        `To: ${record.to_airport}`,
        `Departure: ${record.departure_date||'Flexible'}`,
        `Return: ${record.return_date||'Flexible'}`
      ]:[]),
      ...(isHotel?[
        `Destination: ${record.to_airport}`,
        `Check-in: ${record.departure_date||'Flexible'}`,
        `Check-out: ${record.return_date||'Flexible'}`,
        `Rooms: ${record.hotel_rooms}`
      ]:[]),
      ...(isHoliday?[
        `Package: ${record.package_name||'Not specified'}`,
        `Destination: ${destination||'Not specified'}`,
        `Tentative dates: ${record.tentative_dates||'Flexible'}`
      ]:[]),
      '',
      `Passengers: ${record.adults} Adult(s), ${record.children} Child(ren)`,
      ...(isFlight || isFlightHotel?[`Cabin: ${record.cabin}`]:[]),
      '',
      `Enquiry ID: ${data.id}`,
      'Please review and contact the customer.'
    ].filter(Boolean).join('\n')

    const resendKey=Deno.env.get("RESEND_API_KEY")
    const notificationFrom=Deno.env.get("NOTIFICATION_FROM")
    const notificationEmails=(Deno.env.get("NOTIFICATION_EMAILS")||"").split(",").map(x=>x.trim()).filter(Boolean)
    if(!resendKey || !notificationFrom || !notificationEmails.length){await admin.from("travel_enquiries").update({notification_status:"not_configured"}).eq("id",data.id);return json({id:data.id,created_at:data.created_at,notification:"not_configured"})}
    try{
      const notify=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${resendKey}`,"Content-Type":"application/json"},body:JSON.stringify({from:notificationFrom,to:notificationEmails,subject:`New ${typeLabel(enquiryType)} enquiry`,text:lines})})
      const status=notify.ok?"sent":"failed"
      await admin.from("travel_enquiries").update({notification_status:status}).eq("id",data.id)
      return json({id:data.id,created_at:data.created_at,notification:status})
    }catch{await admin.from("travel_enquiries").update({notification_status:"failed"}).eq("id",data.id);return json({id:data.id,created_at:data.created_at,notification:"failed"})}
  }catch(error){return json({error:error instanceof Error?error.message:'Unexpected error'},500)}
})