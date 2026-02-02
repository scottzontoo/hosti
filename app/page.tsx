"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Layer, Marker, Source, type MapRef } from "react-map-gl/maplibre";

type Hospitel = {
  id: string;
  name: string;
  distanceKm: number;
  etaMin: number;
  bedsAvailable: number;
  totalBeds: number;
  waitHours: number;
  specialties: string[];
  facilities: string[];
  contact: string;
  address: string;
  coord: { lat: number; lng: number };
  routePoints: { lat: number; lng: number }[];
  route: { label: string; time: string }[];
  stats: {
    icu: number;
    oxygen: number;
    isolation: number;
    ambulances: number;
    staffOnDuty: number;
  };
};

const HOSPITELS: Hospitel[] = [
  {
    id: "h1",
    name: "Korle-Bu Teaching Hospital",
    distanceKm: 3.1,
    etaMin: 8,
    bedsAvailable: 12,
    totalBeds: 40,
    waitHours: 1.5,
    specialties: ["Respiratory", "Cardiac", "Trauma"],
    facilities: ["ICU", "Lab", "Radiology", "Pharmacy", "Tele-ICU"],
    contact: "+233 30 678 2301",
    address: "Korle Bu, Accra",
    coord: { lat: 5.5485, lng: -0.2263 },
    routePoints: [
      { lat: 5.5585, lng: -0.1765 },
      { lat: 5.5562, lng: -0.1912 },
      { lat: 5.5534, lng: -0.2098 },
      { lat: 5.5485, lng: -0.2263 },
    ],
    route: [
      { label: "Start: Osu", time: "0 min" },
      { label: "Independence Ave", time: "3 min" },
      { label: "High St", time: "5 min" },
      { label: "Arrive: Korle-Bu", time: "8 min" },
    ],
    stats: {
      icu: 6,
      oxygen: 18,
      isolation: 10,
      ambulances: 3,
      staffOnDuty: 46,
    },
  },
  {
    id: "h2",
    name: "Greater Accra Regional Hospital (Ridge)",
    distanceKm: 2.8,
    etaMin: 12,
    bedsAvailable: 7,
    totalBeds: 36,
    waitHours: 2.2,
    specialties: ["General", "Pediatrics", "Post-Op"],
    facilities: ["ICU", "NICU", "CT Scan", "Dialysis", "Cafeteria"],
    contact: "+233 30 266 4916",
    address: "Castle Rd, Ridge, Accra",
    coord: { lat: 5.5589, lng: -0.195 },
    routePoints: [
      { lat: 5.5585, lng: -0.1765 },
      { lat: 5.5591, lng: -0.1839 },
      { lat: 5.5596, lng: -0.1905 },
      { lat: 5.5589, lng: -0.195 },
    ],
    route: [
      { label: "Start: Osu", time: "0 min" },
      { label: "John Evans Atta Mills Hwy", time: "4 min" },
      { label: "Ridge Roundabout", time: "9 min" },
      { label: "Arrive: Ridge Hospital", time: "12 min" },
    ],
    stats: {
      icu: 5,
      oxygen: 12,
      isolation: 6,
      ambulances: 2,
      staffOnDuty: 38,
    },
  },
  {
    id: "h3",
    name: "37 Military Hospital",
    distanceKm: 4.6,
    etaMin: 16,
    bedsAvailable: 3,
    totalBeds: 28,
    waitHours: 3.4,
    specialties: ["Respiratory", "Oncology", "Rehab"],
    facilities: ["ICU", "MRI", "Pharmacy", "Rehab Gym", "Telemetry"],
    contact: "+233 30 277 4011",
    address: "Liberation Rd, Accra",
    coord: { lat: 5.5993, lng: -0.1816 },
    routePoints: [
      { lat: 5.5585, lng: -0.1765 },
      { lat: 5.5724, lng: -0.1778 },
      { lat: 5.5867, lng: -0.1796 },
      { lat: 5.5993, lng: -0.1816 },
    ],
    route: [
      { label: "Start: Osu", time: "0 min" },
      { label: "Giffard Rd", time: "7 min" },
      { label: "Liberation Rd", time: "13 min" },
      { label: "Arrive: 37 Military Hospital", time: "16 min" },
    ],
    stats: {
      icu: 4,
      oxygen: 9,
      isolation: 5,
      ambulances: 1,
      staffOnDuty: 29,
    },
  },
  {
    id: "h4",
    name: "University of Ghana Medical Centre",
    distanceKm: 6.2,
    etaMin: 10,
    bedsAvailable: 16,
    totalBeds: 52,
    waitHours: 1.0,
    specialties: ["Cardiac", "Geriatrics", "Emergency"],
    facilities: ["ICU", "Cath Lab", "Pharmacy", "Helipad", "Cafeteria"],
    contact: "+233 30 255 0000",
    address: "Legon, Accra",
    coord: { lat: 5.6511, lng: -0.1869 },
    routePoints: [
      { lat: 5.5585, lng: -0.1765 },
      { lat: 5.5925, lng: -0.1802 },
      { lat: 5.6238, lng: -0.1843 },
      { lat: 5.6511, lng: -0.1869 },
    ],
    route: [
      { label: "Start: Osu", time: "0 min" },
      { label: "Okponglo", time: "4 min" },
      { label: "Legon Road", time: "7 min" },
      { label: "Arrive: UG Medical Centre", time: "10 min" },
    ],
    stats: {
      icu: 7,
      oxygen: 20,
      isolation: 12,
      ambulances: 4,
      staffOnDuty: 54,
    },
  },
];

const availabilityTone = (bedsAvailable: number) => {
  if (bedsAvailable >= 12) return "bg-emerald-500";
  if (bedsAvailable >= 6) return "bg-amber-500";
  return "bg-red-500";
};

const HospitalIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path
      d="M4 9.5a3.5 3.5 0 0 1 3.5-3.5h9A3.5 3.5 0 0 1 20 9.5V20a1 1 0 0 1-1 1h-2.5a1 1 0 0 1-1-1v-3.5a1.5 1.5 0 0 0-1.5-1.5h-4A1.5 1.5 0 0 0 8.5 16.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 7.5v5" strokeLinecap="round" />
    <path d="M9.5 10h5" strokeLinecap="round" />
  </svg>
);

export default function Home() {
  const [selectedId, setSelectedId] = useState(HOSPITELS[0].id);
  const [mapMode, setMapMode] = useState<"street" | "satellite">("street");
  const mapRef = useRef<MapRef | null>(null);
  const selected = useMemo(
    () => HOSPITELS.find((h) => h.id === selectedId) ?? HOSPITELS[0],
    [selectedId]
  );
  const userLocation = { lat: 5.5585, lng: -0.1765 };
  const streetStyle = "https://demotiles.maplibre.org/style.json";
  const satelliteStyle = useMemo(
    () =>
      ({
        version: 8 as const,
        sources: {
          esri: {
            type: "raster" as const,
            tiles: [
              "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
            ],
            tileSize: 256,
            attribution: "Tiles © Esri",
          },
        },
        layers: [
          {
            id: "satellite",
            type: "raster" as const,
            source: "esri",
          },
        ],
      }) satisfies Parameters<typeof Map>[0]["mapStyle"],
    []
  );
  const routeGeojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: selected.routePoints.map((point) => [
              point.lng,
              point.lat,
            ]),
          },
        },
      ],
    }),
    [selected.routePoints]
  );

  useEffect(() => {
    if (!mapRef.current || selected.routePoints.length < 2) return;
    const lats = selected.routePoints.map((point) => point.lat);
    const lngs = selected.routePoints.map((point) => point.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    mapRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 60, duration: 600 }
    );
  }, [selected.routePoints]);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Hospitel Availability System · Accra
              </p>
              <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
                Live Bed Map & Rapid Route Finder
              </h1>
            </div>
            <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 shadow-sm">
              Last refresh: 2 min ago · Live data
            </div>
          </div>
          <p className="max-w-2xl text-base text-slate-600">
            Find nearby hospitels, see available beds, and review facility metrics
            instantly. Click a hospitel to view full details and the fastest
            route.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">City Map</h2>
                <p className="text-sm text-slate-500">
                  Red markers show bed availability and capacity.
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  High availability
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  Moderate
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  Limited
                </span>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                <span>Map mode</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMapMode("street")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      mapMode === "street"
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    Street
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode("satellite")}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      mapMode === "satellite"
                        ? "bg-slate-900 text-white"
                        : "border border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    Satellite
                  </button>
                </div>
              </div>
              <div className="relative">
                <Map
                  ref={mapRef}
                  initialViewState={{
                    longitude: userLocation.lng,
                    latitude: userLocation.lat,
                    zoom: 12.5,
                  }}
                  mapStyle={mapMode === "satellite" ? satelliteStyle : streetStyle}
                  style={{ width: "100%", height: 420 }}
                  attributionControl={false}
                >
                <Source id="route" type="geojson" data={routeGeojson}>
                  <Layer
                    id="route-glow"
                    type="line"
                    paint={{
                      "line-color": "#93c5fd",
                      "line-width": 6,
                      "line-opacity": 0.6,
                    }}
                  />
                  <Layer
                    id="route-main"
                    type="line"
                    paint={{
                      "line-color": "#2563eb",
                      "line-width": 3,
                      "line-opacity": 0.95,
                    }}
                  />
                </Source>

                <Marker
                  longitude={userLocation.lng}
                  latitude={userLocation.lat}
                  anchor="bottom"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="rounded-full border border-white bg-sky-500 px-3 py-1 text-xs font-semibold text-white shadow">
                      You are here (Osu)
                    </div>
                    <div className="h-3 w-3 rounded-full bg-sky-600 shadow" />
                  </div>
                </Marker>

                {HOSPITELS.map((hospitel) => (
                  <Marker
                    key={hospitel.id}
                    longitude={hospitel.coord.lng}
                    latitude={hospitel.coord.lat}
                    anchor="bottom"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(hospitel.id)}
                      className={`group flex flex-col items-center transition ${
                        selectedId === hospitel.id
                          ? "scale-105"
                          : "hover:scale-105"
                      }`}
                    >
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-lg ring-2 ring-white/90 ${availabilityTone(
                          hospitel.bedsAvailable
                        )}`}
                      >
                        <HospitalIcon className="h-6 w-6" />
                      </span>
                      <span className="mt-2 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700 shadow opacity-0 transition group-hover:opacity-100">
                        {hospitel.name} · {hospitel.bedsAvailable} beds
                      </span>
                    </button>
                  </Marker>
                ))}
                </Map>
                <div className="map-texture pointer-events-none absolute inset-0" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                    Selected Hospitel
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {selected.name}
                  </h2>
                </div>
                <div className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
                  {selected.distanceKm} km · {selected.etaMin} min
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Beds Available</p>
                  <p className="text-3xl font-semibold text-slate-900">
                    {selected.bedsAvailable}
                    <span className="text-sm text-slate-500">
                      /{selected.totalBeds}
                    </span>
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Expected to free in {selected.waitHours} hrs
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Contact</p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selected.contact}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {selected.address}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Specialties
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                Fastest Route
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                {selected.etaMin} min to arrival
              </h3>
              <ul className="mt-4 space-y-3">
                {selected.route.map((step) => (
                  <li
                    key={step.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                  >
                    <span>{step.label}</span>
                    <span className="text-xs text-slate-500">{step.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Facility Metrics
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">ICU beds open</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {selected.stats.icu}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Oxygen units</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {selected.stats.oxygen}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Isolation rooms</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {selected.stats.isolation}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Ambulances ready</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {selected.stats.ambulances}
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2">
                <p className="text-xs text-slate-500">Staff on duty</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {selected.stats.staffOnDuty}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Facilities & Capacity
            </p>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">Facilities</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.facilities.map((facility) => (
                    <span
                      key={facility}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                    >
                      {facility}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-700">Availability Snapshot</p>
                <div className="mt-3 space-y-3 text-sm text-slate-600">
                  {HOSPITELS.map((hospitel) => (
                    <button
                      key={hospitel.id}
                      type="button"
                      onClick={() => setSelectedId(hospitel.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                        selectedId === hospitel.id
                          ? "border-slate-400 bg-white"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {hospitel.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {hospitel.distanceKm} km · {hospitel.etaMin} min
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <HospitalIcon className="h-4 w-4 text-slate-500" />
                        <span
                          className={`h-3 w-3 rounded-full ${availabilityTone(
                            hospitel.bedsAvailable
                          )}`}
                        />
                        <span className="text-sm text-slate-700">
                          {hospitel.bedsAvailable}/{hospitel.totalBeds}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
