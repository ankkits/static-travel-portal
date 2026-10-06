import { airports as indiaAirports } from './airports'

// Commercially useful seed data. Keep this module intentionally provider-neutral so
// it can later be replaced by a Supabase/API search without changing the UI.
const internationalAirports = [
  ['DXB','Dubai','Dubai International Airport','United Arab Emirates'],['DWC','Dubai','Al Maktoum International Airport','United Arab Emirates'],
  ['AUH','Abu Dhabi','Zayed International Airport','United Arab Emirates'],['DOH','Doha','Hamad International Airport','Qatar'],
  ['RUH','Riyadh','King Khalid International Airport','Saudi Arabia'],['JED','Jeddah','King Abdulaziz International Airport','Saudi Arabia'],
  ['BAH','Manama','Bahrain International Airport','Bahrain'],['MCT','Muscat','Muscat International Airport','Oman'],
  ['KWI','Kuwait City','Kuwait International Airport','Kuwait'],['CAI','Cairo','Cairo International Airport','Egypt'],
  ['IST','Istanbul','Istanbul Airport','Turkey'],['SAW','Istanbul','Sabiha Gokcen International Airport','Turkey'],
  ['LHR','London','Heathrow Airport','United Kingdom'],['LGW','London','Gatwick Airport','United Kingdom'],['STN','London','Stansted Airport','United Kingdom'],
  ['CDG','Paris','Charles de Gaulle Airport','France'],['ORY','Paris','Orly Airport','France'],['AMS','Amsterdam','Amsterdam Airport Schiphol','Netherlands'],
  ['FRA','Frankfurt','Frankfurt Airport','Germany'],['MUC','Munich','Munich Airport','Germany'],['ZRH','Zurich','Zurich Airport','Switzerland'],
  ['FCO','Rome','Leonardo da Vinci–Fiumicino Airport','Italy'],['MXP','Milan','Milan Malpensa Airport','Italy'],
  ['MAD','Madrid','Adolfo Suarez Madrid–Barajas Airport','Spain'],['BCN','Barcelona','Barcelona–El Prat Airport','Spain'],
  ['LIS','Lisbon','Humberto Delgado Airport','Portugal'],['ATH','Athens','Athens International Airport','Greece'],
  ['JFK','New York','John F. Kennedy International Airport','United States'],['EWR','New York','Newark Liberty International Airport','United States'],['LGA','New York','LaGuardia Airport','United States'],
  ['LAX','Los Angeles','Los Angeles International Airport','United States'],['SFO','San Francisco','San Francisco International Airport','United States'],
  ['ORD','Chicago','O’Hare International Airport','United States'],['MIA','Miami','Miami International Airport','United States'],['SEA','Seattle','Seattle–Tacoma International Airport','United States'],
  ['YYZ','Toronto','Toronto Pearson International Airport','Canada'],['YVR','Vancouver','Vancouver International Airport','Canada'],
  ['MEX','Mexico City','Mexico City International Airport','Mexico'],['GRU','Sao Paulo','Guarulhos International Airport','Brazil'],
  ['EZE','Buenos Aires','Ezeiza International Airport','Argentina'],['SYD','Sydney','Sydney Kingsford Smith Airport','Australia'],['MEL','Melbourne','Melbourne Airport','Australia'],
  ['BNE','Brisbane','Brisbane Airport','Australia'],['PER','Perth','Perth Airport','Australia'],['AKL','Auckland','Auckland Airport','New Zealand'],
  ['NRT','Tokyo','Narita International Airport','Japan'],['HND','Tokyo','Haneda Airport','Japan'],['KIX','Osaka','Kansai International Airport','Japan'],
  ['ICN','Seoul','Incheon International Airport','South Korea'],['PVG','Shanghai','Shanghai Pudong International Airport','China'],['PEK','Beijing','Beijing Capital International Airport','China'],
  ['HKG','Hong Kong','Hong Kong International Airport','Hong Kong'],['TPE','Taipei','Taiwan Taoyuan International Airport','Taiwan'],
  ['SIN','Singapore','Singapore Changi Airport','Singapore'],['KUL','Kuala Lumpur','Kuala Lumpur International Airport','Malaysia'],['BKK','Bangkok','Suvarnabhumi Airport','Thailand'],['DMK','Bangkok','Don Mueang International Airport','Thailand'],
  ['HKT','Phuket','Phuket International Airport','Thailand'],['DPS','Denpasar','Ngurah Rai International Airport','Indonesia'],['CGK','Jakarta','Soekarno–Hatta International Airport','Indonesia'],
  ['MNL','Manila','Ninoy Aquino International Airport','Philippines'],['CEB','Cebu','Mactan–Cebu International Airport','Philippines'],['HAN','Hanoi','Noi Bai International Airport','Vietnam'],['SGN','Ho Chi Minh City','Tan Son Nhat International Airport','Vietnam'],
  ['DAC','Dhaka','Hazrat Shahjalal International Airport','Bangladesh'],['CMB','Colombo','Bandaranaike International Airport','Sri Lanka'],['KTM','Kathmandu','Tribhuvan International Airport','Nepal'],
  ['MLE','Male','Velana International Airport','Maldives'],['MRU','Mauritius','Sir Seewoosagur Ramgoolam International Airport','Mauritius'],
  ['JNB','Johannesburg','O. R. Tambo International Airport','South Africa'],['CPT','Cape Town','Cape Town International Airport','South Africa']
].map(([code, city, name, country]) => ({ code, city, name, country }))

export const allAirports = [...indiaAirports, ...internationalAirports]
  .filter((a, i, arr) => arr.findIndex(x => x.code === a.code) === i)

export const cities = [
  ['Hyderabad','India'],['Delhi','India'],['Mumbai','India'],['Bengaluru','India'],['Chennai','India'],['Kolkata','India'],['Pune','India'],['Ahmedabad','India'],['Jaipur','India'],['Goa','India'],['Kochi','India'],['Thiruvananthapuram','India'],['Varanasi','India'],['Amritsar','India'],['Srinagar','India'],['Leh','India'],['Manali','India'],['Shimla','India'],['Rishikesh','India'],['Haridwar','India'],['Munnar','India'],['Ooty','India'],['Coorg','India'],['Udaipur','India'],['Jaisalmer','India'],['Agra','India'],['Ayodhya','India'],['Andaman Islands','India'],
  ['Dubai','United Arab Emirates'],['Abu Dhabi','United Arab Emirates'],['Doha','Qatar'],['Muscat','Oman'],['Riyadh','Saudi Arabia'],['Jeddah','Saudi Arabia'],['Manama','Bahrain'],['Kuwait City','Kuwait'],['Istanbul','Turkey'],['London','United Kingdom'],['Paris','France'],['Amsterdam','Netherlands'],['Frankfurt','Germany'],['Munich','Germany'],['Zurich','Switzerland'],['Rome','Italy'],['Milan','Italy'],['Madrid','Spain'],['Barcelona','Spain'],['Lisbon','Portugal'],['Athens','Greece'],
  ['New York','United States'],['Los Angeles','United States'],['San Francisco','United States'],['Chicago','United States'],['Miami','United States'],['Toronto','Canada'],['Vancouver','Canada'],['Mexico City','Mexico'],['Sao Paulo','Brazil'],['Buenos Aires','Argentina'],
  ['Sydney','Australia'],['Melbourne','Australia'],['Brisbane','Australia'],['Perth','Australia'],['Auckland','New Zealand'],['Tokyo','Japan'],['Osaka','Japan'],['Seoul','South Korea'],['Shanghai','China'],['Beijing','China'],['Hong Kong','Hong Kong'],['Taipei','Taiwan'],['Singapore','Singapore'],['Kuala Lumpur','Malaysia'],['Bangkok','Thailand'],['Phuket','Thailand'],['Bali','Indonesia'],['Jakarta','Indonesia'],['Manila','Philippines'],['Cebu','Philippines'],['Boracay','Philippines'],['Hanoi','Vietnam'],['Ho Chi Minh City','Vietnam'],['Dhaka','Bangladesh'],['Colombo','Sri Lanka'],['Kathmandu','Nepal'],['Male','Maldives'],['Mauritius','Mauritius'],['Johannesburg','South Africa'],['Cape Town','South Africa']
].map(([name, country]) => ({ name, country }))

export const hotelDestinations = [
  ['Manali','India'],['Shimla','India'],['Rishikesh','India'],['Haridwar','India'],['Munnar','India'],['Ooty','India'],['Coorg','India'],['Udaipur','India'],['Jaisalmer','India'],['Goa','India'],['Kerala','India'],['Andaman Islands','India'],['Kashmir','India'],['Ladakh','India'],['Jaipur','India'],['Agra','India'],['Varanasi','India'],['Ayodhya','India'],['Amritsar','India'],['Mumbai','India'],['Delhi','India'],['Hyderabad','India'],['Bengaluru','India'],['Chennai','India'],['Kochi','India'],
  ['Dubai','United Arab Emirates'],['Abu Dhabi','United Arab Emirates'],['Doha','Qatar'],['Muscat','Oman'],['Istanbul','Turkey'],['London','United Kingdom'],['Paris','France'],['Amsterdam','Netherlands'],['Rome','Italy'],['Madrid','Spain'],['New York','United States'],['Los Angeles','United States'],['San Francisco','United States'],['Toronto','Canada'],['Sydney','Australia'],['Melbourne','Australia'],['Tokyo','Japan'],['Osaka','Japan'],['Seoul','South Korea'],['Singapore','Singapore'],['Kuala Lumpur','Malaysia'],['Bangkok','Thailand'],['Phuket','Thailand'],['Bali','Indonesia'],['Manila','Philippines'],['Boracay','Philippines'],['Cebu','Philippines'],['Hanoi','Vietnam'],['Ho Chi Minh City','Vietnam'],['Colombo','Sri Lanka'],['Kathmandu','Nepal'],['Male','Maldives'],['Mauritius','Mauritius'],['Cape Town','South Africa']
].map(([name, country]) => ({ name, country }))

export const locationAliases = {
  bangalore: 'Bengaluru', blr: 'Bengaluru', bombay: 'Mumbai', mumbai: 'Mumbai',
  delhi: 'Delhi', 'new delhi': 'Delhi', madras: 'Chennai', calcutta: 'Kolkata',
  poona: 'Pune', goa: 'Goa', bali: 'Bali', manila: 'Manila', dubai: 'Dubai',
  london: 'London', 'new york city': 'New York', nyc: 'New York', 'kuala lumpur': 'Kuala Lumpur',
  bangkok: 'Bangkok', 'ho chi minh': 'Ho Chi Minh City', 'saigon': 'Ho Chi Minh City'
}

const norm = value => String(value || '').trim().toLowerCase()

export function searchLocations(query, { mode = 'all', excludeCode } = {}) {
  const q = norm(query)
  const alias = locationAliases[q]
  const airportResults = mode === 'city' || mode === 'hotel' ? [] : allAirports
    .filter(a => a.code !== excludeCode)
    .filter(a => !q || `${a.city} ${a.name} ${a.code} ${a.country}`.toLowerCase().includes(q))
    .slice(0, 6)
    .map(a => ({ type: 'airport', id: a.code, label: `${a.city} (${a.code})`, name: a.name, city: a.city, country: a.country, code: a.code }))

  const cityPool = mode === 'hotel' ? hotelDestinations : cities
  const cityResults = cityPool
    .filter(c => !q || `${c.name} ${c.country}`.toLowerCase().includes(q) || (alias && c.name === alias))
    .slice(0, 6)
    .map(c => ({ type: mode === 'hotel' ? 'hotel' : 'city', id: `${c.name}-${c.country}`, label: c.name, name: c.name, city: c.name, country: c.country, code: null }))

  const combined = [...airportResults, ...cityResults]
  return combined.filter((item, index, arr) => arr.findIndex(x => x.label === item.label && x.country === item.country && x.code === item.code) === index).slice(0, 8)
}
