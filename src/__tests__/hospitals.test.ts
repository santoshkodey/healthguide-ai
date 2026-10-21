import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { searchHospitals } from '@/lib/hospitals';

describe('Real Hospital Discovery Engine', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.GOOGLE_MAPS_API_KEY;
    delete process.env.GOOGLE_PLACES_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('runs cleanly without Google Places API credentials using fallback or OpenStreetMap', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('nominatim')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { lat: '12.9716', lon: '77.5946', display_name: 'Bengaluru, Karnataka' },
            ]),
        } as unknown as Response);
      }
      if (url.includes('overpass-api')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ elements: [] }),
        } as unknown as Response);
      }
      return Promise.reject(new Error('Unknown url'));
    });

    const res = await searchHospitals({ query: 'Bengaluru' });
    expect(res).toBeDefined();
    expect(res.fallbackSearchUrl).toContain('google.com/maps/search');
  });

  it('returns valid external fallback link for manual city queries', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('nominatim')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { lat: '17.3850', lon: '78.4867', display_name: 'Hyderabad, Telangana' },
            ]),
        } as unknown as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ elements: [] }),
      } as unknown as Response);
    });

    const res = await searchHospitals({ query: 'Hyderabad' });
    expect(res.fallbackSearchUrl).toBe(
      'https://www.google.com/maps/search/hospitals+near+Hyderabad'
    );
  });

  it('does not fabricate fake hospital records if network provider fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network connectivity offline'));

    const res = await searchHospitals({ query: 'OfflineLocation' });
    expect(res.success).toBe(false);
    expect(res.provider).toBe('fallback');
    expect(res.hospitals).toEqual([]); // Zero fabricated records!
    expect(res.fallbackSearchUrl).toBeTruthy();
  });

  it('handles zero results truthfully without inventing fake hospitals', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('nominatim')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { lat: '10.0', lon: '20.0', display_name: 'Desert Remote Area' },
            ]),
        } as unknown as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ elements: [] }), // No hospitals found
      } as unknown as Response);
    });

    const res = await searchHospitals({ query: 'Desert Remote Area' });
    expect(res.hospitals.length).toBe(0);
    expect(res.fallbackSearchUrl).toContain('google.com/maps/search');
  });

  it('correctly maps OpenStreetMap facilities when provider returns data', async () => {
    const mockOsmResponse = {
      elements: [
        {
          id: 12345,
          lat: 12.9716,
          lon: 77.5946,
          tags: {
            name: 'Victoria Hospital',
            'addr:city': 'Bengaluru',
            amenity: 'hospital',
            emergency: 'yes',
            phone: '+91-80-26701150',
          },
        },
      ],
    };

    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('nominatim')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { lat: '12.9716', lon: '77.5946', display_name: 'Bengaluru, Karnataka' },
            ]),
        } as unknown as Response);
      }
      if (url.includes('overpass-api')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockOsmResponse),
        } as unknown as Response);
      }
      return Promise.reject(new Error('Unknown url'));
    });

    const res = await searchHospitals({ query: 'Bengaluru' });
    expect(res.success).toBe(true);
    expect(res.provider).toBe('osm');
    expect(res.hospitals.length).toBe(1);
    expect(res.hospitals[0].name).toBe('Victoria Hospital');
    expect(res.hospitals[0].phone).toBe('+91-80-26701150');
    expect(res.hospitals[0].isEmergencyCapable).toBe(true);
    expect(res.hospitals[0].directionsUrl).toContain('google.com/maps/dir');
  });
});
