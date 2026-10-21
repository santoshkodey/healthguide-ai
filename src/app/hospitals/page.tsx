'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertCircle,
  Compass,
  Crosshair,
  ExternalLink,
  Hospital,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { Hospital as HospitalType, HospitalSearchResponse } from '@/types/assessment';
import { MedicalDisclaimer } from '@/components/MedicalDisclaimer';

export default function HospitalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [hospitals, setHospitals] = useState<HospitalType[]>([]);
  const [searchResponse, setSearchResponse] = useState<HospitalSearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchedLocationName, setSearchedLocationName] = useState<string>('');

  const handleSearch = useCallback(async (queryText?: string, coords?: { lat: number; lng: number }) => {
    const queryToUse = queryText !== undefined ? queryText : searchQuery;
    if (!queryToUse.trim() && !coords) {
      setSearchError('Please enter a city or area name, or click "Use My Current Location".');
      return;
    }

    setIsLoading(true);
    setSearchError(null);
    setGeoError(null);

    try {
      let url = '/api/hospitals?';
      if (coords) {
        url += `lat=${coords.lat}&lng=${coords.lng}`;
      } else {
        url += `query=${encodeURIComponent(queryToUse.trim())}`;
      }

      const res = await fetch(url);
      const data: HospitalSearchResponse = await res.json();

      if (!res.ok && !data.hospitals) {
        throw new Error(data.error || 'Failed to search healthcare facilities.');
      }

      setSearchResponse(data);
      setHospitals(data.hospitals || []);
      setSearchedLocationName(data.locationName || queryToUse || 'Selected Location');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to connect to healthcare mapping services. Please check your internet connection.';
      setSearchError(message);
      setHospitals([]);
    } finally {
      setIsLoading(false);
      setGeoLoading(false);
    }
  }, [searchQuery]);

  // Default initial search for a popular metropolitan hub if user hasn't searched yet
  useEffect(() => {
    handleSearch('New Delhi');
  }, [handleSearch]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please enter your city manually.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleSearch('', { lat: latitude, lng: longitude });
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError(
            'Location permission was denied. You can still search for any city or neighborhood using the search bar above.'
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoError('Location information is currently unavailable. Please enter your city manually.');
        } else if (error.code === error.TIMEOUT) {
          setGeoError('The request to determine your location timed out. Please enter your city manually.');
        } else {
          setGeoError('An unknown error occurred while retrieving your location.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-3">
          <Hospital className="w-3.5 h-3.5" />
          <span>Real Healthcare Facility Discovery</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Find Nearby Hospitals & Clinics
        </h1>
        <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-2xl">
          Locate actual, verified healthcare facilities with real coordinates, emergency status, and direct external driving routes. We never simulate or invent hospital records.
        </p>
      </div>

      {/* Emergency Strip */}
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <span className="font-bold">Life-Threatening Emergency?</span> Do not wait or drive yourself. Dial emergency dispatch immediately.
          </div>
        </div>
        <a
          href="tel:112"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition shrink-0"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Dial 112 (India)</span>
        </a>
      </div>

      {/* Search Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter city, locality, or district (e.g., Bengaluru, Mumbai, Connaught Place)..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 placeholder:text-slate-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || geoLoading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 disabled:opacity-50 transition shadow-sm"
          >
            {isLoading && !geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Search Facilities</span>
          </button>

          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={isLoading || geoLoading}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-50 transition"
            title="Locate hospitals near your current GPS position"
          >
            {geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
            ) : (
              <Crosshair className="w-4 h-4 text-teal-600" />
            )}
            <span>Use My Location</span>
          </button>
        </form>

        {/* Quick popular city shortcuts */}
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-1">
          <span className="font-semibold text-slate-600">Popular Quick Searches:</span>
          {['New Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata'].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                setSearchQuery(city);
                handleSearch(city);
              }}
              className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              {city}
            </button>
          ))}
        </div>

        {/* Location Denied Warning */}
        {geoError && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Geolocation Notice:</span> {geoError}
            </div>
          </div>
        )}

        {/* Search Error Alert */}
        {searchError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Search Error:</span> {searchError}
            </div>
          </div>
        )}
      </div>

      {/* Results Header / Provider Attribution */}
      {searchResponse && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Healthcare Facilities near{' '}
              <span className="text-teal-700">{searchedLocationName}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Found {hospitals.length} verified real facility record(s)
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Source:</span>
            <span
              className={`px-2.5 py-1 rounded-full font-semibold border ${
                searchResponse.provider === 'google'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : searchResponse.provider === 'osm'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {searchResponse.provider === 'google'
                ? 'Google Places API'
                : searchResponse.provider === 'osm'
                ? 'OpenStreetMap Overpass (Live)'
                : 'Direct External Search'}
            </span>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">
            Querying live healthcare facility database...
          </p>
          <p className="text-xs text-slate-400">
            Connecting to open map repositories and geocoding services
          </p>
        </div>
      )}

      {/* Hospital Cards Grid */}
      {!isLoading && hospitals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {hospital.name}
                  </h3>
                  {hospital.distanceKm !== undefined && (
                    <span className="text-xs font-semibold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 shrink-0">
                      {hospital.distanceKm} km away
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{hospital.address}</span>
                </p>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                  {hospital.isEmergencyCapable && (
                    <span className="bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded border border-red-200">
                      Emergency / Critical Care
                    </span>
                  )}
                  {hospital.isOpenNow !== undefined && (
                    <span
                      className={`font-semibold px-2 py-0.5 rounded border ${
                        hospital.isOpenNow
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {hospital.isOpenNow ? 'Open Now' : 'Check Hours'}
                    </span>
                  )}
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    Source: {hospital.source.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap text-xs">
                {hospital.phone ? (
                  <a
                    href={`tel:${hospital.phone.replace(/[^0-9+]/g, '')}`}
                    className="inline-flex items-center gap-1.5 text-teal-700 font-bold hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{hospital.phone}</span>
                  </a>
                ) : (
                  <span className="text-slate-400 text-[11px] italic">
                    Phone listed at reception
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <a
                    href={hospital.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-semibold hover:bg-teal-700 transition"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Directions</span>
                  </a>

                  <a
                    href={hospital.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
                    title="View pin on map"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results State */}
      {!isLoading && searchResponse && hospitals.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Hospital className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              No Facilities Returned for &ldquo;{searchedLocationName}&rdquo;
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
              Our direct map queries did not locate indexed hospital nodes within the selected perimeter. Rather than inventing fake records, we provide a direct link to external map search.
            </p>
          </div>

          {searchResponse.fallbackSearchUrl && (
            <div className="pt-2">
              <a
                href={searchResponse.fallbackSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 transition shadow"
              >
                <Compass className="w-4 h-4" />
                <span>Search Directly on Google Maps</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* External Map Fallback Card */}
      <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-700">
        <div className="space-y-1 text-center sm:text-left">
          <span className="font-bold text-slate-900 block">
            Looking for specialized tertiary hospitals or specific trauma care?
          </span>
          <span className="text-slate-500">
            You can always launch a direct external search centered on your current region.
          </span>
        </div>
        <a
          href={`https://www.google.com/maps/search/hospitals+near+${encodeURIComponent(
            searchedLocationName || 'me'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition shrink-0 shadow-sm"
        >
          <span>Open External Maps</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
      </div>

      {/* Medical Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
}
