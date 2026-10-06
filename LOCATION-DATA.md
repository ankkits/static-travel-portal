# Location data foundation

The portal now uses a provider-neutral `searchLocations()` layer rather than an airport-only input.

- `src/data/locations.js` contains airport, city, hotel-destination and alias data.
- Flight fields search airport-backed locations.
- Flight + Hotel destination can be an airport or a city.
- Hotel destination searches hotel-friendly cities/regions even when there is no airport.
- Common aliases such as Bangalore/Bengaluru, Bombay/Mumbai and NYC/New York are normalised.

The included list is a practical seed, not a claim of literal global completeness. For production supplier integration, this layer can be replaced by a Supabase/API search backed by a maintained airport/city source without changing the form component.
