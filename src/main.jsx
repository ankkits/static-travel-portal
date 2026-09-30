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
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [tentativeDates, setTentativeDates] = useState('')
  const [showContactForm, setShowContactForm] = useState(false)
  const [enquiryType, setEnquiryType] = useState('flight')
  const [selectedPackage, setSelectedPackage] = useState(null)
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
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('Unable to submit your request right now.')

    const response = await fetch(`${url}/functions/v1/submit-enquiry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key
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
        package_name: details.packageName || null,
		tentative_dates: details.tentativeDates || null
		
      })
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Unable to submit your request. Please try again.')
    return body
  }

 function requestFlights(e) {
  e.preventDefault()
  setSubmitError('')

  if (!departure) {
    setSubmitError('Please select your departure date.')
    return
  }

  if (trip === 'Round trip') {
    if (!returnDate) {
      setSubmitError('Please select your return date for a round trip.')
      return
    }

    if (returnDate < departure) {
      setSubmitError('Return date cannot be before the departure date.')
      return
    }
  }

  setEnquiryType('flight')
  setShowContactForm(true)

  setTimeout(() => {
    document.getElementById('contact-step')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }, 50)
}

  function startHolidayEnquiry(pkg) {
    setTentativeDates('')
    setSelectedPackage(pkg)
    setEnquiryType('holiday')
    setEnquiry(null)
    setSubmitError('')
    setShowContactForm(true)
	setTimeout(() => {
		document.getElementById('contact-step')?.scrollIntoView({
		behavior: 'smooth',
		block: 'start'
		})
	}, 50)
  }

  async function submitContactDetails(e) {
    e.preventDefault()
    setSubmitError('')

    if (!customerName.trim() || !customerPhone.trim()) {
      setSubmitError('Please enter your name and phone number so we can contact you.')
      return
    }

    const details = {
      enquiryType,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      trip,
      from,
      to,
      departure,
      returnDate: trip === 'Round trip' ? returnDate : 'N/A',
      adults,
      children,
      cabin,
      packageId: selectedPackage?.id || null,
      packageName: selectedPackage?.title || null,
      destination: selectedPackage?.destination || null,
      tentativeDates: enquiryType === 'holiday' ? tentativeDates.trim() : ''
    }

    setSubmitting(true)
    try {
      await submitEnquiry(details)
      setEnquiry(details)
      setShowContactForm(false)
      window.scrollTo({ top: document.getElementById('enquiry-result')?.offsetTop || 0, behavior: 'smooth' })
    } catch (error) {
      setSubmitError(error.message || 'We could not submit your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function resetEnquiry() {
    setTentativeDates('')
    setEnquiry(null)
    setSubmitError('')
    setShowContactForm(false)
    setSelectedPackage(null)
    setEnquiryType('flight')
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
          <div className="brand"><img src="/images/branding/logo-web.png" alt="Shreeji Travelogue" /></div>
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
            <div className="eyebrow">FLIGHTS · HOLIDAYS · EXPERT GUIDANCE </div>
            <h1>Travel more.<br /><em>Worry less.</em></h1>
            <p className="hero-copy">Tell us where you want to go. Our team will find travel options, fares and packages that fit your trip.</p>

            <form className="search-card" id="enquiry-form" onSubmit={requestFlights}>
              <div className="trip-tabs">
				{['Round trip', 'One way'].map(t => (
				  <button
					type="button"
					key={t}
					className={trip === t ? 'active' : ''}
					onClick={() => {
					  setTrip(t)
					  if (t === 'One way') setReturnDate('')
					}}
				  >
					{t}
				  </button>
				))}
              </div>

              <div className="search-grid">
                <AirportInput label="From" value={from} onChange={setFrom} exclude={to.match(/\(([A-Z]{3})\)/)?.[1]} />
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
                    setAdults(a)
                    setChildren(c)
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
            </form>
          </div>
        </section>

        {showContactForm && !enquiry && (
          <section className="contact-step" id="contact-step">
            <div className="container">
              <div className="contact-step-inner">
                <div>
                  <div className="eyebrow dark">ALMOST THERE</div>
                  <h2>{enquiryType === 'holiday' ? 'Tell us how to reach you' : 'Where should we reach out with your travel itinerary?'}</h2>
                  <p>
                    {enquiryType === 'holiday'
                      ? `Share your details and we’ll get back to you about ${selectedPackage?.title || 'this holiday'}.`
                      : 'We’ve captured your travel request. Give us a way to reach you and we’ll take it from here.'}
                  </p>
                </div>

                <form className="contact-form" onSubmit={submitContactDetails}>
                  <div className="contact-fields">
                    <div className="field"><label>Full name *</label><input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Your name" autoComplete="name" /></div>
                    <div className="field"><label>Mobile number *</label><input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+91 98765 43210" autoComplete="tel" /></div>
                    <div className="field"><label>Email <span className="optional">(optional)</span></label><input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></div>
                  </div>

                  {enquiryType === 'holiday' && selectedPackage && (
                    <>
                      <div className="request-mini">
                        <strong>{selectedPackage.title}</strong>
                        <span>{selectedPackage.destination} · {selectedPackage.duration}</span>
                      </div>
                      <div className="field">
                        <label>Tentative travel dates <span className="optional">(optional)</span></label>
                        <input
                          type="text"
                          value={tentativeDates}
                          onChange={e => setTentativeDates(e.target.value)}
                          placeholder="e.g. 10–15 December 2026, mid-January, or flexible"
                        />
                      </div>
                    </>
                  )}

                  {enquiryType === 'flight' && (
                    <div className="request-mini">
                      <strong>{from} → {to}</strong>
                      <span>{trip} · {adults} Adult(s), {children} Child(ren) · {cabin}</span>
                    </div>
                  )}

                  {submitError && <div className="submit-error">{submitError}</div>}
                  <div className="contact-actions">
                    <button className="primary-action" type="submit" disabled={submitting}>
                      {submitting ? 'Sending…' : enquiryType === 'holiday' ? 'Request this holiday →' : 'Get my flight options →'}
                    </button>
                    <button className="secondary-action" type="button" onClick={() => { setShowContactForm(false); setSubmitError('') }}>Edit search</button>
                  </div>
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
                  <div className="eyebrow dark">REQUEST RECEIVED</div>
                  <h2>Thanks — we’ve got your request.</h2>
                  <p>Our travel team will review your requirements and contact you using the details you provided.</p>
                </div>
                <div className="result-badge">✓ Received</div>
              </div>

              <div className="enquiry-grid">
                <div className="detail-panel">
                  <div className="panel-title">Contact details</div>
                  <div className="detail-row"><span>Name</span><strong>{enquiry.customerName}</strong></div>
                  <div className="detail-row"><span>Phone</span><strong>{enquiry.customerPhone}</strong></div>
                  {enquiry.customerEmail && <div className="detail-row"><span>Email</span><strong>{enquiry.customerEmail}</strong></div>}
                </div>

                <div className="detail-panel">
                  <div className="panel-title">Your request</div>
                  {enquiry.enquiryType === 'holiday' ? (
                    <>
                      <div className="detail-row"><span>Holiday</span><strong>{enquiry.packageName}</strong></div>
                      <div className="detail-row"><span>Destination</span><strong>{enquiry.destination}</strong></div>
                      {enquiry.tentativeDates && <div className="detail-row"><span>Tentative dates</span><strong>{enquiry.tentativeDates}</strong></div>}
                    </>
                  ) : (
                    <>
                      <div className="route"><div><small>FROM</small><strong>{enquiry.from}</strong></div><div className="route-arrow">→</div><div><small>TO</small><strong>{enquiry.to}</strong></div></div>
                      <div className="detail-row"><span>Trip type</span><strong>{enquiry.trip}</strong></div>
                      <div className="detail-row"><span>Departure</span><strong>{formatDate(enquiry.departure)}</strong></div>
                      {enquiry.trip === 'Round trip' && <div className="detail-row"><span>Return</span><strong>{formatDate(enquiry.returnDate)}</strong></div>}
                      <div className="detail-row"><span>Passengers</span><strong>{enquiry.adults} Adult(s), {enquiry.children} Child(ren)</strong></div>
                      <div className="detail-row"><span>Cabin</span><strong>{enquiry.cabin}</strong></div>
                    </>
                  )}
                </div>
              </div>

              <div className="contact-actions">
                <button className="primary-action" type="button" onClick={resetEnquiry}>Plan another trip →</button>
              </div>
            </div>
          </section>
        )}

        <section className="trust">
          <div className="container trust-grid">
            <div><b>01</b><span>Human assistance</span><small>Travel experts handling your request</small></div>
            <div><b>02</b><span>Quick response</span><small>We reach out so you stay in control</small></div>
            <div><b>03</b><span>Flexible options</span><small>Flights, hotels & holidays</small></div>
            <div><b>04</b><span>Personal support</span><small>Clear, competitive pricing with no hidden surprises </small></div>
          </div>
        </section>

        <section className="section" id="packages">
          <div className="container">
            <div className="section-head">
              <div><div className="eyebrow dark">CURATED GETAWAYS</div><h2>Popular holiday ideas</h2></div>
              <button className="text-btn" type="button" onClick={() => document.getElementById('packages')?.scrollIntoView({behavior: 'smooth'})}>Explore all →</button>
            </div>
            <div className="package-grid">
              {packages.map(p => (
                <article className="package-card" key={p.id}>
                  <div className="package-image" style={{backgroundImage: `url(${p.image_url})`}} />
                  <div className="package-body">
                    <div className="package-meta"><span>{p.duration}</span><span>From ₹{Number(p.starting_price || 0).toLocaleString('en-IN')}</span></div>
                    <h3>{p.title}</h3>
                    <p>{p.destination} · {p.description}</p>
                    <button type="button" onClick={() => startHolidayEnquiry(p)}>Get a quote →</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="source-note">Explore a package and share your details for a personalised quote.</div>
          </div>
        </section>

        <section className="services">
          <div className="container">
            <div className="eyebrow">ONE PLACE FOR YOUR TRIP</div>
            <h2>From a flight search to a full holiday.</h2>
            <div className="service-grid">
              <div><span>✈</span><h3>Flights</h3><p>Domestic and international flight requests with human assistance.</p></div>
              <div><span>⌂</span><h3>Hotels</h3><p>Share your destination and dates and we will help shortlist travel options.</p></div>
              <div><span>✦</span><h3>Holiday packages</h3><p>Flexible itineraries for couples, families and groups.</p></div>
            </div>
          </div>
        </section>

        <section className="cta" id="support">
          <div className="container cta-inner">
            <div><div className="eyebrow">NEED A HAND?</div><h2>Let’s plan your next trip.</h2><p>Share your requirements and our travel team will contact you with suitable travel options.</p></div>
            <button type="button" onClick={() => document.getElementById('flights')?.scrollIntoView({behavior: 'smooth'})}>Start a travel enquiry →</button>
          </div>
        </section>
      </main>
	<footer>
        <div className="container footer-inner">
          <span>
            © {new Date().getFullYear()} Shreeji Travelogue. All rights reserved.
          </span>

          <div className="footer-contact">
            <div className="footer-services">
              Flights · Hotels · Holidays
            </div>

            <div className="footer-socials">
			<a
				  href="https://www.instagram.com/shreejitravelogue/"
				  target="_blank"
				  rel="noopener noreferrer"
				  aria-label="Instagram"
				  title="@shreejitravelogue">
					Instagram
			</a>

        <a
			  href="https://x.com/shreejitravelz"
			  target="_blank"
			  rel="noopener noreferrer"
			  aria-label="X"
			  title="@shreejitravelz">
				X
        </a>

        <a
			  href="mailto:shreejitravelogue@gmail.com"
			  aria-label="Email"
			  title="shreejitravelogue@gmail.com">
          Email
        </a>
            </div>
          </div>
        </div>
     </footer>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
