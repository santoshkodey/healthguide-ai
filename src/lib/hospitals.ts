import { Hospital, HospitalSearchResponse } from '@/types/assessment';

interface GooglePlaceResult {
  place_id?: string;
  name?: string;
  vicinity?: string;
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now?: boolean;
  };
}

interface OsmElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    'name:en'?: string;
    'addr:street'?: string;
    'addr:city'?: string;
    phone?: string;
    'contact:phone'?: string;
    emergency?: string;
    amenity?: string;
  };
}

interface SearchOptions {
  query?: string;
  lat?: number;
  lng?: number;
  radiusMeters?: number;
}

// Calculate distance using Haversine formula
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function searchHospitals(options: SearchOptions): Promise<HospitalSearchResponse> {
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
  const { query, radiusMeters = 8000 } = options;
  let { lat, lng } = options;

  // Determine external fallback URL in case of network issue or manual search
  const fallbackQuery = query || (lat && lng ? `${lat},${lng}` : 'hospitals near me');
  const fallbackSearchUrl = `https://www.google.com/maps/search/hospitals+near+${encodeURIComponent(fallbackQuery)}`;

  // If user provided a textual query but no coordinates, geocode via Nominatim
  let resolvedLocationName = query;
  if ((!lat || !lng) && query && query.trim().length > 0) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query.trim()
      )}&format=json&limit=1`;
      const geoRes = await fetch(geoUrl, {
        headers: {
          'User-Agent': 'HealthGuideAI-Navigator/1.0 (Hackathon Prototype)',
        },
        signal: AbortSignal.timeout(6000),
      });

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        if (Array.isArray(geoData) && geoData.length > 0) {
          lat = parseFloat(geoData[0].lat);
          lng = parseFloat(geoData[0].lon);
          resolvedLocationName = geoData[0].display_name;
        }
      }
    } catch {
      // Nominatim timeout or error; will proceed to Google API text search or fallback
    }
  }

  // ---------------------------------------------------------------------------
  // PROVIDER 1: GOOGLE PLACES API (If configured)
  // ---------------------------------------------------------------------------
  if (googleApiKey) {
    try {
      let googleUrl = '';
      if (lat && lng) {
        googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=hospital&key=${googleApiKey}`;
      } else if (query) {
        googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          `hospitals in ${query}`
        )}&key=${googleApiKey}`;
      }

      if (googleUrl) {
        const res = await fetch(googleUrl, { signal: AbortSignal.timeout(8000) });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'OK' && Array.isArray(data.results)) {
            const hospitals: Hospital[] = data.results.slice(0, 15).map((place: GooglePlaceResult, index: number) => {
              const placeLat = place.geometry?.location?.lat;
              const placeLng = place.geometry?.location?.lng;
              const distanceKm =
                lat && lng && placeLat && placeLng
                  ? calculateDistanceKm(lat, lng, placeLat, placeLng)
                  : undefined;

              return {
                id: place.place_id || `google-${index}`,
                name: place.name || 'Healthcare Facility',
                address: place.vicinity || place.formatted_address || 'Address provided upon arrival',
                lat: placeLat || 0,
                lng: placeLng || 0,
                distanceKm,
                isOpenNow: place.opening_hours?.open_now,
                isEmergencyCapable: true,
                source: 'google',
                mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  place.name || 'Healthcare Facility'
                )}&query_place_id=${place.place_id || ''}`,
                directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                  `${placeLat},${placeLng}`
                )}`,
              };
            });

            return {
              success: true,
              provider: 'google',
              providerMessage: 'Live real-time hospital results via Google Places API.',
              locationName: resolvedLocationName,
              hospitals,
              fallbackSearchUrl,
            };
          }
        }
      }
    } catch {
      // Google places failed or timed out; fall through to OpenStreetMap
    }
  }

  // ---------------------------------------------------------------------------
  // PROVIDER 2: OPENSTREETMAP OVERPASS API (Free, Real, Open Community Data)
  // ---------------------------------------------------------------------------
  if (lat && lng) {
    try {
      const radiusAround = Math.min(radiusMeters, 12000);
      // Query OSM Overpass for actual hospitals and clinics within bounding radius
      const overpassQuery = `[out:json][timeout:10];
(
  node["amenity"="hospital"](around:${radiusAround},${lat},${lng});
  node["amenity"="clinic"](around:${radiusAround},${lat},${lng});
  way["amenity"="hospital"](around:${radiusAround},${lat},${lng});
);
out center 15;`;

      const overpassRes = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'HealthGuideAI-Navigator/1.0 (Hackathon Prototype)',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
        signal: AbortSignal.timeout(8000),
      });

      if (overpassRes.ok) {
        const osmData = await overpassRes.json();
        if (Array.isArray(osmData.elements) && osmData.elements.length > 0) {
          const hospitals: Hospital[] = osmData.elements
            .filter((el: OsmElement) => el.tags && (el.tags.name || el.tags['name:en']))
            .slice(0, 15)
            .map((el: OsmElement) => {
              const tags = el.tags || {};
              const elLat = el.lat || el.center?.lat || 0;
              const elLng = el.lon || el.center?.lon || 0;
              const name = tags.name || tags['name:en'] || 'Medical Clinic';
              const street = tags['addr:street'] || '';
              const city = tags['addr:city'] || '';
              const fullAddress = [street, city].filter(Boolean).join(', ') || 'Address listed on OpenStreetMap';
              const phone = tags.phone || tags['contact:phone'];
              const isEmergency = tags.emergency === 'yes';

              const distanceKm =
                lat && lng && elLat && elLng ? calculateDistanceKm(lat, lng, elLat, elLng) : undefined;

              return {
                id: `osm-${el.id}`,
                name,
                address: fullAddress,
                lat: elLat,
                lng: elLng,
                distanceKm,
                phone,
                isOpenNow: undefined, // OSM does not have guaranteed live operating status
                isEmergencyCapable: isEmergency || tags.amenity === 'hospital',
                source: 'osm',
                mapUrl: `https://www.openstreetmap.org/?mlat=${elLat}&mlon=${elLng}#map=16/${elLat}/${elLng}`,
                directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${elLat},${elLng}`,
              };
            });

          if (hospitals.length > 0) {
            // Sort by distance
            hospitals.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

            return {
              success: true,
              provider: 'osm',
              providerMessage:
                'Real-time healthcare facility data sourced via OpenStreetMap Overpass community database.',
              locationName: resolvedLocationName,
              hospitals,
              fallbackSearchUrl,
            };
          }
        }
      }
    } catch {
      // Overpass failed or timed out
    }
  }

  // ---------------------------------------------------------------------------
  // FALLBACK: DIRECT SEARCH NAVIGATION
  // ---------------------------------------------------------------------------
  // Never fabricate simulated records. Truthfully inform user and provide direct search link.
  return {
    success: false,
    provider: 'fallback',
    providerMessage:
      'Live map API query could not return facilities for this specific location. Click below to launch direct external search on Google Maps or OpenStreetMap.',
    locationName: resolvedLocationName || query || 'Requested Location',
    hospitals: [],
    fallbackSearchUrl,
  };
}
