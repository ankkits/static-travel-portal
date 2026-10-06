import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { getActivePackages } from './services/content'
import { searchLocations } from './data/locations'
import './styles.css'

const fallbackPackages = [
  { id: 'f1', title: 'Dubai Escape', destination: 'Dubai, UAE', description: 'City break with flexible sightseeing and hotel options.', duration: '4N / 5D', starting_price: 39999, image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80', gallery_images: [] },
  { id: 'f2', title: 'Singapore Getaway', destination: 'Singapore', description: 'A compact Singapore holiday with hotel and sightseeing options.', duration: '3N / 4D', starting_price: 45999, image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80', gallery_images: [] },
  { id: 'f3', title: 'Thailand Highlights', destination: 'Bangkok + Phuket', description: 'Beach and city combination package with flexible options.', duration: '5N / 6D', starting_price: 42999, image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80', gallery_images: [] }
]

function todayString() { return new Date().toISOString().slice(0, 10) }
function codeFrom(value) { return value?.match(/\(([A-Z0-9]{3})\)/)?.[1] || null }

function LocationInput({ label, value, onChange, excludeCode, mode = 'all', placeholder = 'City or airport' }) {
  const [open, setOpen] = useState(false)
  const results = searchLocations(value, { mode, excludeCode })
  return (
    <div className="field airport-field">
      <label>{label}</label>
      <input value={value} onFocus={() => setOpen(true)} onChange={e => { onChange(e.target.value); setOpen(true) }} placeholder={placeholder} autoComplete="off" />
      {open && results.length > 0 && (
        <div className="suggestions">
          {results.map(item => (
            <button key={`${item.type}-${item.id}`} type="button" onMouseDown={e => e.preventDefault()} onClick={() => { onChange(item.type === 'airport' ? `${item.city} (${item.code})` : `${item.name}, ${item.country}`); setOpen(false) }}>
              <span className="airport-code">{item.type === 'airport' ? item.code : item.type === 'hotel' ? 'HOTEL' : 'CITY'}</span>
              <span><strong>{item.name}</strong><small>{item.type === 'airport' ? item.name : `${item.country} · ${item.type === 'hotel' ? 'Hotel destination' : 'City'}`}</small></span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function App() {
  const [trip, setTrip] = useState('Round trip')
  const [from, setFrom] = useState('Hyderabad (HYD)')
  const [to, setTo] = useState('Manila (MNL)')
  const [departure, setDeparture] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [adults, setAdults] = useState(1)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)
  const [cabin, setCabin] = useState('Economy')
  const [hotelDestination, setHotelDestination] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [tentativeDates, setTentativeDates] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)
  const [enquiryType, setEnquiryType] = useState('flight')
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [packageDetails, setPackageDetails] = useState(null)
  const [enquiry, setEnquiry] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [formError, setFormError] = useState('')
  const [packages, setPackages] = useState(fallbackPackages)

  useEffect(() => { getActivePackages().then(result => { if (!result.error && result.data?.length) setPackages(result.data) }) }, [])

  function selectType(type) {
    setEnquiryType(type); setShowContactForm(false); setEnquiry(null); setSubmitError(''); setFormError('')
    if (type === 'flight') setTrip('Round trip')
  }

  async function submitEnquiry(details) {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Unable to submit your request right now.')
    const response = await fetch(`${url}/functions/v1/submit-enquiry`, { method:'POST', headers:{'Content-Type':'application/json', apikey:key}, body:JSON.stringify(details) })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Unable to submit your request. Please try again.')
    return body
  }

  function requestSearch(e) {
    e.preventDefault(); setFormError('')
    if (enquiryType === 'holiday') return
    if (enquiryType === 'flight' && !departure) return setFormError('Please select your departure date.')
    if (enquiryType === 'flight' && trip === 'Round trip' && (!returnDate || returnDate < departure)) return setFormError('Please select a valid return date.')
    if (enquiryType === 'flight_hotel' && (!departure || !returnDate || returnDate < departure)) return setFormError('Please select valid check-in and check-out dates.')
    if (enquiryType === 'hotel' && (!hotelDestination || !checkIn || !checkOut || checkOut < checkIn)) return setFormError('Please select a destination and valid hotel dates.')
    setShowContactForm(true)
    setTimeout(() => document.getElementById('contact-step')?.scrollIntoView({ behavior:'smooth', block:'start' }), 50)
  }

  function startHolidayEnquiry(pkg) {
    setTentativeDates(''); setSelectedPackage(pkg); setEnquiryType('holiday'); setEnquiry(null); setSubmitError(''); setFormError(''); setShowContactForm(true)
    setTimeout(() => document.getElementById('contact-step')?.scrollIntoView({ behavior:'smooth', block:'start' }), 50)
  }

  async function submitContactDetails(e) {
    e.preventDefault(); setSubmitError('')
    if (!customerName.trim() || !customerPhone.trim()) return setSubmitError('Please enter your name and phone number so we can contact you.')
    const destination = enquiryType === 'hotel' ? hotelDestination : enquiryType === 'holiday' ? selectedPackage?.destination : to
    const origin = enquiryType === 'flight_hotel' || enquiryType === 'flight' ? from : null
    const details = {
      enquiry_type: enquiryType,
      customer_name: customerName.trim(), customer_phone: customerPhone.trim(), customer_email: customerEmail.trim() || null,
      trip_type: enquiryType === 'flight' || enquiryType === 'flight_hotel' ? trip : enquiryType === 'holiday' ? 'holiday' : 'hotel',
      origin_code: codeFrom(origin), origin_city: origin, destination_code: codeFrom(destination), destination_city: destination,
      departure_date: enquiryType === 'flight' ? departure : enquiryType === 'flight_hotel' ? checkIn : enquiryType === 'hotel' ? checkIn : null,
      return_date: enquiryType === 'flight' ? (trip === 'Round trip' ? returnDate : null) : enquiryType === 'flight_hotel' || enquiryType === 'hotel' ? checkOut : null,
      adults, children, cabin: enquiryType === 'hotel' || enquiryType === 'holiday' ? 'Not applicable' : cabin, hotel_rooms: rooms,
      package_id: selectedPackage?.id || null, package_name: selectedPackage?.title || null, tentative_dates: enquiryType === 'holiday' ? tentativeDates.trim() || null : null
    }
    setSubmitting(true)
    try { await submitEnquiry(details); setEnquiry({ ...details, from:origin, to:destination, packageName:selectedPackage?.title || null, destination, tentativeDates }); setShowContactForm(false); window.scrollTo({top:document.getElementById('enquiry-result')?.offsetTop||0,behavior:'smooth'}) }
    catch (error) { setSubmitError(error.message || 'We could not submit your request. Please try again.') }
    finally { setSubmitting(false) }
  }

  function resetEnquiry() { setTentativeDates(''); setEnquiry(null); setSubmitError(''); setShowContactForm(false); setSelectedPackage(null); setEnquiryType('flight') }
  function formatDate(value) { if (!value) return 'Flexible'; const [y,m,d]=value.split('-'); return `${d}/${m}/${y}` }

  const typeLabel = { flight:'Flights', flight_hotel:'Flight + Hotel', hotel:'Hotels', holiday:'Holidays' }

  return <div>
    <header className="nav"><div className="container nav-inner"><div className="brand"><img src="/images/branding/logo-web.png" alt="Shreeji Travelogue" /></div><nav><a href="#flights">Flights</a><a href="#packages">Holidays</a><a href="#support">Support</a></nav><a className="nav-cta" href="#packages">Explore holidays</a></div></header>
    <main>
      <section className="hero" id="flights"><div className="hero-bg" /><div className="container hero-content">
        <div className="eyebrow">FLIGHTS · HOTELS · HOLIDAYS · EXPERT GUIDANCE</div><h1>Travel more.<br /><em>Worry less.</em></h1><p className="hero-copy">Tell us where you want to go. Our team will find travel options, fares, hotels and packages that fit your trip.</p>
        <form className="search-card" onSubmit={requestSearch}>
          <div className="trip-tabs">
            {Object.entries(typeLabel).map(([key,label]) => <button type="button" key={key} className={enquiryType===key?'active':''} onClick={() => selectType(key)}>{label}</button>)}
          </div>
          {enquiryType === 'flight' && <>
            <div className="trip-tabs"><button type="button" className={trip==='Round trip'?'active':''} onClick={()=>{setTrip('Round trip');setReturnDate('')}}>Round trip</button><button type="button" className={trip==='One way'?'active':''} onClick={()=>{setTrip('One way');setReturnDate('')}}>One way</button></div>
            <div className="search-grid"><LocationInput label="From" value={from} onChange={setFrom} mode="airport" excludeCode={codeFrom(to)} /><LocationInput label="To" value={to} onChange={setTo} mode="airport" excludeCode={codeFrom(from)} /><div className="field"><label>Departure</label><input type="date" min={todayString()} value={departure} onChange={e=>setDeparture(e.target.value)} /></div>{trip==='Round trip'&&<div className="field"><label>Return</label><input type="date" min={departure||todayString()} value={returnDate} onChange={e=>setReturnDate(e.target.value)} /></div>}<div className="field compact"><label>Travellers</label><select value={`${adults}-${children}`} onChange={e=>{const[a,c]=e.target.value.split('-').map(Number);setAdults(a);setChildren(c)}}>{[['1-0','1 Adult'],['2-0','2 Adults'],['2-1','2 Adults, 1 Child'],['2-2','2 Adults, 2 Children'],['3-0','3 Adults'],['4-0','4 Adults']].map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><div className="field compact"><label>Cabin</label><select value={cabin} onChange={e=>setCabin(e.target.value)}><option>Economy</option><option>Premium Economy</option><option>Business</option><option>First</option></select></div><button className="search-btn" type="submit">Find flights <span>→</span></button></div>
          </>}
          {enquiryType === 'flight_hotel' && <div className="search-grid"><LocationInput label="From" value={from} onChange={setFrom} mode="airport" excludeCode={codeFrom(to)} /><LocationInput label="Destination" value={to} onChange={setTo} mode="all" /><div className="field"><label>Check-in</label><input type="date" min={todayString()} value={departure} onChange={e=>{setDeparture(e.target.value);setCheckIn(e.target.value)}} /></div><div className="field"><label>Check-out</label><input type="date" min={departure||todayString()} value={returnDate} onChange={e=>{setReturnDate(e.target.value);setCheckOut(e.target.value)}} /></div><div className="field compact"><label>Adults</label><select value={adults} onChange={e=>setAdults(Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></div><div className="field compact"><label>Rooms</label><select value={rooms} onChange={e=>setRooms(Number(e.target.value))}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></div><div className="field compact"><label>Cabin</label><select value={cabin} onChange={e=>setCabin(e.target.value)}><option>Economy</option><option>Premium Economy</option><option>Business</option></select></div><button className="search-btn" type="submit">Find options <span>→</span></button></div>}
          {enquiryType === 'hotel' && <div className="search-grid"><LocationInput label="Destination" value={hotelDestination} onChange={setHotelDestination} mode="hotel" placeholder="City or hotel destination" /><div className="field"><label>Check-in</label><input type="date" min={todayString()} value={checkIn} onChange={e=>setCheckIn(e.target.value)} /></div><div className="field"><label>Check-out</label><input type="date" min={checkIn||todayString()} value={checkOut} onChange={e=>setCheckOut(e.target.value)} /></div><div className="field compact"><label>Adults</label><select value={adults} onChange={e=>setAdults(Number(e.target.value))}>{[1,2,3,4,5,6].map(n=><option key={n}>{n}</option>)}</select></div><div className="field compact"><label>Children</label><select value={children} onChange={e=>setChildren(Number(e.target.value))}>{[0,1,2,3,4].map(n=><option key={n}>{n}</option>)}</select></div><div className="field compact"><label>Rooms</label><select value={rooms} onChange={e=>setRooms(Number(e.target.value))}>{[1,2,3,4,5].map(n=><option key={n}>{n}</option>)}</select></div><button className="search-btn" type="submit">Find hotels <span>→</span></button></div>}
          {enquiryType === 'holiday' && <div className="selected-package-note"><strong>{selectedPackage ? selectedPackage.title : 'Choose a holiday below'}</strong><span>{selectedPackage ? `${selectedPackage.destination} · ${selectedPackage.duration}` : 'Select a package to request a personalised quote.'}</span><button type="button" onClick={()=>document.getElementById('packages')?.scrollIntoView({behavior:'smooth'})}>Browse packages →</button></div>}
          {formError && <div className="form-error">{formError}</div>}
        </form>
      </div></section>

      {showContactForm && !enquiry && <section className="contact-step" id="contact-step"><div className="container"><div className="contact-step-inner"><div><div className="eyebrow dark">ALMOST THERE</div><h2>{enquiryType==='holiday'?'Tell us how to reach you':'Where should we reach out with your travel itinerary?'}</h2><p>{enquiryType==='holiday'?`Share your details and we’ll get back to you about ${selectedPackage?.title||'this holiday'}.`:'We’ve captured your travel request. Give us a way to reach you and we’ll take it from here.'}</p></div><form className="contact-form" onSubmit={submitContactDetails}><div className="contact-fields"><div className="field"><label>Full name *</label><input value={customerName} onChange={e=>setCustomerName(e.target.value)} placeholder="Your name" autoComplete="name" /></div><div className="field"><label>Mobile number *</label><input type="tel" value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" /></div><div className="field"><label>Email <span className="optional">(optional)</span></label><input type="email" value={customerEmail} onChange={e=>setCustomerEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></div></div>
        <div className="request-mini"><strong>{typeLabel[enquiryType]}</strong><span>{enquiryType==='holiday'?`${selectedPackage?.destination||'Selected package'} · ${selectedPackage?.duration||''}`:enquiryType==='hotel'?`${hotelDestination} · ${formatDate(checkIn)} → ${formatDate(checkOut)} · ${rooms} room(s)`:enquiryType==='flight_hotel'?`${from} → ${to} · ${formatDate(departure)} → ${formatDate(returnDate)} · ${rooms} room(s)`: `${from} → ${to} · ${trip}`}</span></div>
        {enquiryType==='holiday'&&<div className="field"><label>Tentative travel dates <span className="optional">(optional)</span></label><input value={tentativeDates} onChange={e=>setTentativeDates(e.target.value)} placeholder="e.g. 10–15 December 2026, mid-January, or flexible" /></div>}
        {submitError&&<div className="submit-error">{submitError}</div>}<div className="contact-actions"><button className="primary-action" type="submit" disabled={submitting}>{submitting?'Sending…':enquiryType==='holiday'?'Request this holiday →':'Send my requirements →'}</button><button className="secondary-action" type="button" onClick={()=>{setShowContactForm(false);setSubmitError('')}}>Edit search</button></div></form></div></div></section>}

      {enquiry&&<section className="enquiry-result" id="enquiry-result"><div className="container"><div className="result-header"><div><div className="eyebrow dark">REQUEST RECEIVED</div><h2>Thanks — we’ve got your request.</h2><p>Our travel team will review your requirements and contact you using the details you provided.</p></div><div className="result-badge">✓ Received</div></div><div className="enquiry-grid"><div className="detail-panel"><div className="panel-title">Contact details</div><div className="detail-row"><span>Name</span><strong>{enquiry.customer_name}</strong></div><div className="detail-row"><span>Phone</span><strong>{enquiry.customer_phone}</strong></div>{enquiry.customer_email&&<div className="detail-row"><span>Email</span><strong>{enquiry.customer_email}</strong></div>}</div><div className="detail-panel"><div className="panel-title">Your request</div><div className="detail-row"><span>Type</span><strong>{typeLabel[enquiry.enquiry_type]}</strong></div>{enquiry.enquiry_type==='holiday'?<><div className="detail-row"><span>Holiday</span><strong>{enquiry.package_name}</strong></div><div className="detail-row"><span>Destination</span><strong>{enquiry.destination}</strong></div>{enquiry.tentative_dates&&<div className="detail-row"><span>Tentative dates</span><strong>{enquiry.tentative_dates}</strong></div>}</>:<><div className="route"><div><small>FROM</small><strong>{enquiry.origin_city}</strong></div><div className="route-arrow">→</div><div><small>TO</small><strong>{enquiry.destination_city}</strong></div></div>{enquiry.departure_date&&<div className="detail-row"><span>Check-in / Departure</span><strong>{formatDate(enquiry.departure_date)}</strong></div>}{enquiry.return_date&&<div className="detail-row"><span>Check-out / Return</span><strong>{formatDate(enquiry.return_date)}</strong></div>}<div className="detail-row"><span>Guests</span><strong>{enquiry.adults} Adult(s), {enquiry.children} Child(ren)</strong></div>{enquiry.hotel_rooms&&<div className="detail-row"><span>Rooms</span><strong>{enquiry.hotel_rooms}</strong></div>}</>}</div></div><div className="contact-actions"><button className="primary-action" type="button" onClick={resetEnquiry}>Plan another trip →</button></div></div></section>}

      <section className="trust"><div className="container trust-grid"><div><b>01</b><span>Human assistance</span><small>Travel experts handling your request</small></div><div><b>02</b><span>Quick response</span><small>We reach out so you stay in control</small></div><div><b>03</b><span>Flexible options</span><small>Flights, hotels & holidays</small></div><div><b>04</b><span>Personal support</span><small>Clear, competitive pricing with no hidden surprises</small></div></div></section>

      <section className="section" id="packages"><div className="container"><div className="section-head"><div><div className="eyebrow dark">CURATED GETAWAYS</div><h2>Popular holiday ideas</h2></div><button className="text-btn" type="button" onClick={()=>document.getElementById('packages')?.scrollIntoView({behavior:'smooth'})}>Explore all →</button></div><div className="package-grid">{packages.map(p=><article className="package-card" key={p.id}><button className="package-image package-image-button" type="button" aria-label={`View ${p.title}`} style={{backgroundImage:`url(${p.image_url})`}} onClick={()=>setPackageDetails(p)} /><div className="package-body"><div className="package-meta"><span>{p.duration}</span><span>From ₹{Number(p.starting_price||0).toLocaleString('en-IN')}</span></div><h3>{p.title}</h3><p>{p.destination} · {p.description}</p><button type="button" onClick={()=>startHolidayEnquiry(p)}>Get a quote →</button></div></article>)}</div><div className="source-note">Click a destination image to explore the package, then request a personalised quote.</div></div></section>

      {packageDetails&&<div className="package-modal-backdrop" role="presentation" onClick={()=>setPackageDetails(null)}><div className="package-modal" role="dialog" aria-modal="true" aria-label={packageDetails.title} onClick={e=>e.stopPropagation()}><button className="modal-close" type="button" onClick={()=>setPackageDetails(null)}>×</button><img src={packageDetails.image_url} alt={packageDetails.title} /><div className="package-modal-body"><div className="eyebrow dark">{packageDetails.duration}</div><h2>{packageDetails.title}</h2><p><strong>{packageDetails.destination}</strong></p><p>{packageDetails.description}</p>{Array.isArray(packageDetails.gallery_images)&&packageDetails.gallery_images.length>0&&<div className="package-gallery">{packageDetails.gallery_images.map((image,index)=><img key={`${image}-${index}`} src={image} alt={`${packageDetails.title} view ${index+1}`} />)}</div>}<p className="modal-price">From ₹{Number(packageDetails.starting_price||0).toLocaleString('en-IN')}</p><button className="primary-action" type="button" onClick={()=>{setPackageDetails(null);startHolidayEnquiry(packageDetails)}}>Request this holiday →</button></div></div></div>}

      <section className="services"><div className="container"><div className="eyebrow">ONE PLACE FOR YOUR TRIP</div><h2>From a flight search to a full holiday.</h2><div className="service-grid"><div><span>✈</span><h3>Flights</h3><p>Domestic and international flight requests with human assistance.</p></div><div><span>⌂</span><h3>Hotels</h3><p>Share your destination and dates and we will help shortlist options.</p></div><div><span>✦</span><h3>Holiday packages</h3><p>Flexible itineraries for couples, families and groups.</p></div></div></div></section>
      <section className="cta" id="support"><div className="container cta-inner"><div><div className="eyebrow">NEED A HAND?</div><h2>Let’s plan your next trip.</h2><p>Share your requirements and our travel team will contact you with suitable travel options.</p></div><button type="button" onClick={()=>document.getElementById('flights')?.scrollIntoView({behavior:'smooth'})}>Start a travel enquiry →</button></div></section>
    </main>
    <footer><div className="container footer-inner"><span>© {new Date().getFullYear()} Shreeji Travelogue</span><span>Flights · Hotels · Holidays</span></div></footer>
  </div>
}
createRoot(document.getElementById('root')).render(<App />)
