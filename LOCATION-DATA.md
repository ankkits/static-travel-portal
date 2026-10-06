# Location data foundation

The portal now uses a provider-neutral `searchLocations()` layer rather than an airport-only input.

- `src/data/locations.js` contains airport, city, hotel-destination and alias data.
- Flight fields search airport-backed locations.
- Flight + Hotel destination can be an airport or a city.
- Hotel destination searches hotel-friendly cities/regions even when there is no airport.
- Common aliases such as Bangalore/Bengaluru, Bombay/Mumbai and NYC/New York are normalised.

The included list is a practical seed, not a claim of literal global completeness. For production supplier integration, this layer can be replaced by a Supabase/API search backed by a maintained airport/city source without changing the form component.

## Hotel destination fallback

Hotel destination search is intentionally non-blocking. Customers can select a curated destination when available, or choose **Use “…” as entered** when their exact destination is not in the curated list. The submitted `destination_city` retains the customer's exact text, so the booking team can handle smaller towns, resorts, localities, beaches, estates, pilgrimage destinations, or other hotel areas not yet present in the dataset.
