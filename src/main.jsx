import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { airports } from './data/airports'
import { getActivePackages } from './services/content'
import './styles.css'


const fallbackPackages = [
  { id: 'f1', title: 'Dubai Escape', destination: 'Dubai, UAE', description: 'City break with flexible sightseeing and hotel options.', duration: '4N / 5D', starting_price: 39999, image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80' },
  { id: 'f2', title: 'Singapore Getaway', destination: 'Singapore', description: 'A compact Singapore holiday with hotel and sightseeing options.', duration: '3N / 4D', starting_price: 45999, image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=1200&q=80' },
  { id: 'f3', title: 'Thailand Highlights', destination: 'Bangkok + Phuket', description: 'Beach and city combination package with flexible options.', duration: '5N / 6D', starting_price: 42999, image_url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80' }
]

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function AirportInput({ label, value, onChange, exclude }) {
  const [open, setOpen] = useState(false)
  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    return airports
      .filter(a => a.code !== exclude)
      .filter(a => !q || `${a.city} ${a.name} ${a.code} ${a.country}`.toLowerCase().includes(q))
      .slice(0, 8)
  }, [value, exclude])

  return (
    <div className="field airport-field">
      <label>{label}</label>
      <input
        value={value}
        onFocus={() => setOpen(true)}
        onChange={e => { onChange(e.target.value); setOpen(true) }}
        placeholder="City or airport"
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="suggestions">
          {filtered.map(a => (
            <button
              key={a.code}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onChange(`${a.city} (${a.code})`); setOpen(false) }}
            >
              <span className="airport-code">{a.code}</span>
              <span><strong>{a.city}</strong><small>{a.name}</small></span>
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
  const [cabin, setCabin] = useState('Economy')
  const [customerName, setCustomerName] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [enquiry, setEnquiry] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [packages, setPackages] = useState(fallbackPackages)
  const [contentSource, setContentSource] = useState('fallback')

  useEffect(() => {
    getActivePackages().then(result => {
      if (!result.error && result.data?.length) {
        setPackages(result.data)
        setContentSource(result.source)
      }
    })
  }, [])

  async function submitEnquiry(details) {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-enquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        enquiry_type: details.enquiryType || 'flight',
        customer_name: details.customerName,
        phone: details.customerPhone,
        email: details.customerEmail || null,
        trip_type: details.trip || null,
        origin_code: details.from?.match(/\(([A-Z]{3})\)/)?.[1] || null,
        origin_city: details.from || null,
        destination_code: details.to?.match(/\(([A-Z]{3})\)/)?.[1] || null,
        destination_city: details.to || details.destination || null,
        departure_date: details.departure || null,
        return_date: details.returnDate && details.returnDate !== 'N/A' ? details.returnDate : null,
        adults: details.adults || 1,
        children: details.children || 0,
        cabin: details.cabin || null,
        package_id: details.packageId || null,
        package_name: details.packageName || null
      })
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(result.error || `Request failed (${response.status})`)
    return result
  }

  async function requestFlights(e) {
    e.preventDefault()
    setSubmitError('')
    setShowContactForm(true)
    window.scrollTo({ top: document.getElementById('contact-step')?.offsetTop || 0, behavior: 'smooth' })
  }

  async function submitContactDetails(e) {
    e.preventDefault()
    setSubmitError('')

    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError('Please enter your name and phone number so the travel team can call you back.')
      return
    }

    const payload = {
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_email: customerEmail.trim() || null,
      trip_type: trip,
      from_airport: from || 'Not selected',
      to_airport: to || 'Not selected',
      departure_date: departure || null,
      return_date: trip === 'Round trip' ? (returnDate || null) : null,
      adults,
      children,
      cabin,
      honeypot: ''
    }

    setSubmitting(true)
    try {
      const result = await submitEnquiry(payload)
      if (result.error) throw new Error(result.error)
      setEnquiry({ ...payload, id: result.id, created_at: result.created_at })
      setShowContactForm(false)
      window.scrollTo({ top: document.getElementById('enquiry-result')?.offsetTop || 0, behavior: 'smooth' })
    } catch (err) {
      setSubmitError(err.message || 'We could not save your enquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function submitEnquiry(payload) {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Supabase is not configured yet.')

    const response = await fetch(`${url}/functions/v1/submit-enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key },
      body: JSON.stringify(payload)
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Unable to submit enquiry')
    return body
  }

  function startHolidayEnquiry(pkg) {
    setSelectedPackage(pkg)
    setEnquiryType('holiday')
    setEnquiry(null)
    window.scrollTo({ top: document.getElementById('flights')?.offsetTop || 0, behavior: 'smooth' })
  }

  async function submitHolidayEnquiry(e) {
    e.preventDefault()
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your name and phone number so the travel team can contact you.')
      return
    }
    const details = {
      enquiryType: 'holiday',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      packageId: selectedPackage?.id || '',
      packageName: selectedPackage?.title || '',
      destination: selectedPackage?.destination || '',
      description: selectedPackage?.description || '',
      duration: selectedPackage?.duration || '',
      startingPrice: selectedPackage?.starting_price || null
    }
    try {
      await submitEnquiry(details)
      setEnquiry(details)
      window.scrollTo({ top: document.getElementById('enquiry-result')?.offsetTop || 0, behavior: 'smooth' })
    } catch (error) {
      alert(`We couldn't submit your enquiry. Please try again. ${error.message || ''}`)
    }
  }

  function resetEnquiry() {
    setEnquiry(null)
    setSubmitError('')
  }

  function formatDate(value) {
    if (!value) return 'Flexible'
    const [y, m, d] = value.split('-')
    return `${d}/${m}/${y}`
  }


  return (
    <div>
      <header className="nav">
        <div className="container nav-inner">
          <div className="brand"><span className="brand-mark">✈</span> Travel<span>Desk</span></div>
          <nav>
            <a href="#flights">Flights</a>
            <a href="#packages">Holidays</a>
            <a href="#support">Support</a>
          </nav>
          <a className="nav-cta" href="#packages">Explore holidays</a>
        </div>
      </header>

      <main>
        <section className="hero" id="flights">
          <div className="hero-bg" />
          <div className="container hero-content">
            <div className="eyebrow">FLIGHTS · HOLIDAYS · HUMAN SUPPORT</div>
            <h1>Travel more.<br /><em>Worry less.</em></h1>
            <p className="hero-copy">Tell us where you want to go. Our team will find options, fares and packages that fit your trip.</p>

            <form className="search-card" id="enquiry-form" onSubmit={enquiryType === 'holiday' ? submitHolidayEnquiry : requestFlights}>
              <div className="trip-tabs">
                {['Round trip', 'One way'].map(t => (
                  <button type="button" key={t} className={trip === t ? 'active' : ''} onClick={() => setTrip(t)}>{t}</button>
                ))}
              </div>

              {enquiryType === 'flight' && <div className="search-grid">
                <AirportInput label="From" value={from} onChange={setFrom} exclude={to.match(/\(([A-Z]{3})\)/)?.[1]} />
                <div className="swap">⇄</div>
                <AirportInput label="To" value={to} onChange={setTo} exclude={from.match(/\(([A-Z]{3})\)/)?.[1]} />
                <div className="field">
                  <label>Departure</label>
                  <input type="date" min={todayString()} value={departure} onChange={e => setDeparture(e.target.value)} />
                </div>
                {trip === 'Round trip' && (
                  <div className="field">
                    <label>Return</label>
                    <input type="date" min={departure || todayString()} value={returnDate} onChange={e => setReturnDate(e.target.value)} />
                  </div>
                )}
                <div className="field compact">
                  <label>Travellers</label>
                  <select value={`${adults}-${children}`} onChange={e => {
                    const [a, c] = e.target.value.split('-').map(Number)
                    setAdults(a); setChildren(c)
                  }}>
                    {[['1-0','1 Adult'],['2-0','2 Adults'],['2-1','2 Adults, 1 Child'],['2-2','2 Adults, 2 Children'],['3-0','3 Adults'],['4-0','4 Adults']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div className="field compact">
                  <label>Cabin</label>
                  <select value={cabin} onChange={e => setCabin(e.target.value)}>
                    <option>Economy</option>
                    <option>Premium Economy</option>
                    <option>Business</option>
                    <option>First</option>
                  </select>
                </div>
                <button className="search-btn" type="submit">Find flights <span>→</span></button>
              </div>
              <div className="manual-note">Your request is saved for the travel team. No WhatsApp window is opened automatically.</div>{submitError && <div className="form-error">{submitError}</div>}
            </form>
          </div>
        </section>

        {showContactForm && !enquiry && (
          <section className="contact-step" id="contact-step">
            <div className="container">
              <div className="contact-step-inner">
                <div>
                  <div className="eyebrow dark">ALMOST THERE</div>
                  <h2>Where should we send your options?</h2>
                  <p>We've captured your travel request. Give our booking team a way to reach you and we'll take it from here.</p>
                </div>
                <form className="contact-form" onSubmit={submitContactDetails}>
                  <div className="contact-fields">
                    <div className="field"><label>Full name *</label><input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your name" autoComplete="name" /></div>
                    <div className="field"><label>Mobile number *</label><input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" /></div>
                    <div className="field"><label>Email <span className="optional">(optional)</span></label><input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></div>
                  </div>
                  <div className="request-mini"><strong>{from} → {to}</strong><span>{trip} · {adults} Adult(s), {children} Child(ren) · {cabin}</span></div>
                  {submitError && <div className="submit-error">{submitError}</div>}
                  <div className="contact-actions"><button className="primary-action" type="submit" disabled={submitting}>{submitting ? 'Saving enquiry…' : 'Get my flight options →'}</button><button className="secondary-action" type="button" onClick={() => setShowContactForm(false)}>Edit search</button></div>
                </form>
              </div>
            </div>
          </section>
        )}

        {enquiry && (
          <section className="enquiry-result" id="enquiry-result">
            <div className="container">
              <div className="result-header">
                <div>
                  <div className="eyebrow dark">ENQUIRY SUBMITTED</div>
                  <h2>Your request has been recorded</h2>
                  <p>The booking team now has the customer contact details and the complete travel search request. They can use this information to search fares and call the customer back.</p>
                </div>
                <div className="result-badge">✓ Saved</div>
              </div>
              <div className="enquiry-id">Enquiry ID: <strong>{enquiry.id}</strong></div>
              <div className="enquiry-grid">
                <div className="detail-panel">
                  <div className="panel-title">Customer to contact</div>
                  <div className="detail-row"><span>Name</span><strong>{enquiry.customer_name}</strong></div>
                  <div className="detail-row"><span>Phone</span><strong>{enquiry.customer_phone}</strong></div>
                  {enquiry.customer_email && <div className="detail-row"><span>Email</span><strong>{enquiry.customer_email}</strong></div>}
                </div>
                <div className="detail-panel">
                  <div className="panel-title">Flight search request</div>
                  <div className="route"><div><small>FROM</small><strong>{enquiry.from_airport}</strong></div><div className="route-arrow">→</div><div><small>TO</small><strong>{enquiry.to_airport}</strong></div></div>
                  <div className="detail-row"><span>Trip type</span><strong>{enquiry.trip_type}</strong></div>
                  <div className="detail-row"><span>Departure</span><strong>{formatDate(enquiry.departure_date)}</strong></div>
                  {enquiry.trip_type === 'Round trip' && <div className="detail-row"><span>Return</span><strong>{formatDate(enquiry.return_date)}</strong></div>}
                  <div className="detail-row"><span>Passengers</span><strong>{enquiry.adults} Adult(s), {enquiry.children} Child(ren)</strong></div>
                  <div className="detail-row"><span>Cabin</span><strong>{enquiry.cabin}</strong></div>
                </div>
              </div>
<pre>{`NEW TRAVEL ENQUIRY\n\nCustomer: ${enquiry.customer_name}\nPhone: ${enquiry.customer_phone}${enquiry.customer_email ? `\nEmail: ${enquiry.customer_email}` : ''}\n\nTrip: ${enquiry.trip_type}\nFrom: ${enquiry.from_airport}\nTo: ${enquiry.to_airport}\nDeparture: ${formatDate(enquiry.departure_date)}\n${enquiry.trip_type === 'Round trip' ? `Return: ${formatDate(enquiry.return_date)}\n` : ''}Passengers: ${enquiry.adults} Adult(s), ${enquiry.children} Child(ren)\nCabin: ${enquiry.cabin}\n\nPlease search available options and call the customer back with the best fare.`}</pre>
              </div>
</div>
          </section>
        )}

        <section className="trust">
          <div className="container trust-grid">
            <div><b>01</b><span>Human assistance</span><small>Real people handling your request</small></div>
            <div><b>02</b><span>Quick response</span><small>Options shared on WhatsApp</small></div>
            <div><b>03</b><span>Flexible options</span><small>Flights, hotels & holidays</small></div>
            <div><b>04</b><span>Personal support</span><small>From enquiry to ticket</small></div>
          </div>
        </section>

        <section className="section" id="packages">
          <div className="container">
            <div className="section-head">
              <div><div className="eyebrow dark">CURATED GETAWAYS</div><h2>Popular holiday ideas</h2></div>
              <button className="text-btn" onClick={() => document.getElementById('packages')?.scrollIntoView({behavior: 'smooth'})}>Explore all →</button>
            </div>
            <div className="package-grid">
              {packages.map(p => (
                <article className="package-card" key={p.id}>
                  <div className="package-image" style={{backgroundImage: `url(${p.image_url})`}} />
                  <div className="package-body">
                    <div className="package-meta"><span>{p.duration}</span><span>From ₹{Number(p.starting_price || 0).toLocaleString('en-IN')}</span></div>
                    <h3>{p.title}</h3>
                    <p>{p.destination} · {p.description}</p>
                    <button onClick={() => startHolidayEnquiry(p)}>Get a quote →</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="source-note">{contentSource === 'supabase' ? 'Package content loaded from Supabase.' : 'Showing starter package content. Configure Supabase to manage packages dynamically.'}</div>
          </div>
        </section>

        <section className="services">
          <div className="container">
            <div className="eyebrow">ONE PLACE FOR YOUR TRIP</div>
            <h2>From a flight search to a full holiday.</h2>
            <div className="service-grid">
              <div><span>✈</span><h3>Flights</h3><p>Domestic and international flight requests with human assistance.</p></div>
              <div><span>⌂</span><h3>Hotels</h3><p>Share your destination and dates and we will help shortlist options.</p></div>
              <div><span>✦</span><h3>Holiday packages</h3><p>Flexible itineraries for couples, families and groups.</p></div>
            </div>
          </div>
        </section>

        <section className="cta" id="support">
          <div className="container cta-inner">
            <div><div className="eyebrow">NEED A HAND?</div><h2>Let’s plan your next trip.</h2><p>Share your requirements and our travel team will contact you with suitable options.</p></div>
            <button onClick={() => document.getElementById('flights')?.scrollIntoView({behavior: 'smooth'})}>Start a travel enquiry →</button>
          </div>
        </section>
      </main>

      <footer><div className="container footer-inner"><span>© {new Date().getFullYear()} TravelDesk</span><span>Flights · Hotels · Holidays</span></div></footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
