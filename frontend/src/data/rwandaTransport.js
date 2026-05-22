// @ts-nocheck

export const SCHEDULE_TIMES = [
  '05:00',
  '06:00',
  '07:30',
  '09:00',
  '10:30',
  '12:00',
  '14:00',
  '16:00',
  '18:00',
  '20:00',
];

export const RWANDA_BUS_TYPES = [
  'Coaster',
  'Luxury Coach',
  'Executive Bus',
  'VIP Bus',
  'Standard Bus',
  'Mini Bus',
];

export const RWANDA_DISTRICTS = [
  { name: 'Gasabo', province: 'Kigali City', stationName: 'Kimironko Transit Hub', latitude: -1.9353, longitude: 30.1303 },
  { name: 'Kicukiro', province: 'Kigali City', stationName: 'Kicukiro Bus Terminal', latitude: -1.9706, longitude: 30.1044 },
  { name: 'Nyarugenge', province: 'Kigali City', stationName: 'Nyarugenge Downtown Stop', latitude: -1.9507, longitude: 30.0588 },
  { name: 'Burera', province: 'Northern Province', stationName: 'Burera Cyanika Station', latitude: -1.4459, longitude: 29.8302 },
  { name: 'Gakenke', province: 'Northern Province', stationName: 'Gakenke Main Stop', latitude: -1.7042, longitude: 29.7852 },
  { name: 'Gicumbi', province: 'Northern Province', stationName: 'Gicumbi Byumba Station', latitude: -1.5786, longitude: 30.0675 },
  { name: 'Musanze', province: 'Northern Province', stationName: 'Musanze Bus Station', latitude: -1.4998, longitude: 29.6349 },
  { name: 'Rulindo', province: 'Northern Province', stationName: 'Rulindo Base Stop', latitude: -1.7302, longitude: 29.9937 },
  { name: 'Gisagara', province: 'Southern Province', stationName: 'Gisagara Ndora Stop', latitude: -2.6068, longitude: 29.8307 },
  { name: 'Huye', province: 'Southern Province', stationName: 'Huye Main Station', latitude: -2.5967, longitude: 29.7394 },
  { name: 'Kamonyi', province: 'Southern Province', stationName: 'Kamonyi Runda Stop', latitude: -2.0058, longitude: 29.8993 },
  { name: 'Muhanga', province: 'Southern Province', stationName: 'Muhanga Station', latitude: -2.0845, longitude: 29.7566 },
  { name: 'Nyamagabe', province: 'Southern Province', stationName: 'Nyamagabe Terminal', latitude: -2.4661, longitude: 29.5689 },
  { name: 'Nyanza', province: 'Southern Province', stationName: 'Nyanza Station', latitude: -2.3519, longitude: 29.7509 },
  { name: 'Nyaruguru', province: 'Southern Province', stationName: 'Nyaruguru Kibeho Stop', latitude: -2.7007, longitude: 29.5452 },
  { name: 'Ruhango', province: 'Southern Province', stationName: 'Ruhango Bus Stop', latitude: -2.2226, longitude: 29.7802 },
  { name: 'Bugesera', province: 'Eastern Province', stationName: 'Bugesera Nyamata Terminal', latitude: -2.1410, longitude: 30.1127 },
  { name: 'Gatsibo', province: 'Eastern Province', stationName: 'Gatsibo Kabarore Stop', latitude: -1.5995, longitude: 30.4561 },
  { name: 'Kayonza', province: 'Eastern Province', stationName: 'Kayonza Bus Station', latitude: -1.8833, longitude: 30.6333 },
  { name: 'Kirehe', province: 'Eastern Province', stationName: 'Kirehe Nyakarambi Stop', latitude: -2.2533, longitude: 30.6597 },
  { name: 'Ngoma', province: 'Eastern Province', stationName: 'Ngoma Kibungo Station', latitude: -2.1597, longitude: 30.5427 },
  { name: 'Nyagatare', province: 'Eastern Province', stationName: 'Nyagatare Bus Station', latitude: -1.2987, longitude: 30.3275 },
  { name: 'Rwamagana', province: 'Eastern Province', stationName: 'Rwamagana Station', latitude: -1.9487, longitude: 30.4347 },
  { name: 'Karongi', province: 'Western Province', stationName: 'Karongi Kibuye Station', latitude: -2.0597, longitude: 29.3478 },
  { name: 'Ngororero', province: 'Western Province', stationName: 'Ngororero Terminal', latitude: -1.8605, longitude: 29.6266 },
  { name: 'Nyabihu', province: 'Western Province', stationName: 'Nyabihu Mukamira Stop', latitude: -1.6551, longitude: 29.5364 },
  { name: 'Nyamasheke', province: 'Western Province', stationName: 'Nyamasheke Station', latitude: -2.3379, longitude: 29.1476 },
  { name: 'Rubavu', province: 'Western Province', stationName: 'Rubavu Taxi Park', latitude: -1.6818, longitude: 29.3134 },
  { name: 'Rusizi', province: 'Western Province', stationName: 'Rusizi Bus Station', latitude: -2.4833, longitude: 28.9075 },
  { name: 'Rutsiro', province: 'Western Province', stationName: 'Rutsiro Station', latitude: -1.9304, longitude: 29.3280 },
];

export const KIGALI_HUB = {
  id: 'kigali',
  name: 'Nyabugogo Bus Park',
  city: 'Kigali',
  district: 'Nyarugenge',
  province: 'Kigali City',
  country: 'Rwanda',
  latitude: -1.9392,
  longitude: 30.0446,
};

export const EAST_AFRICA_STATIONS = [
  {
    id: 'kampala',
    name: 'Kampala Coach Terminal',
    city: 'Kampala',
    district: 'Kampala Central',
    province: 'Central Region',
    country: 'Uganda',
    latitude: 0.3476,
    longitude: 32.5825,
  },
  {
    id: 'nairobi',
    name: 'Nairobi River Road Terminal',
    city: 'Nairobi',
    district: 'Nairobi Central',
    province: 'Nairobi County',
    country: 'Kenya',
    latitude: -1.2864,
    longitude: 36.8172,
  },
  {
    id: 'goma',
    name: 'Goma Grand Barrier Stop',
    city: 'Goma',
    district: 'Goma',
    province: 'North Kivu',
    country: 'DR Congo',
    latitude: -1.6585,
    longitude: 29.2205,
  },
  {
    id: 'bujumbura',
    name: 'Bujumbura Gare du Nord',
    city: 'Bujumbura',
    district: 'Mukaza',
    province: 'Bujumbura Mairie',
    country: 'Burundi',
    latitude: -3.3614,
    longitude: 29.3599,
  },
  {
    id: 'dar-es-salaam',
    name: 'Dar es Salaam Ubungo Terminal',
    city: 'Dar es Salaam',
    district: 'Ubungo',
    province: 'Dar es Salaam',
    country: 'Tanzania',
    latitude: -6.7924,
    longitude: 39.2083,
  },
];

const slugify = (value) => String(value || '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

export const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createUuid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);

  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20)
  ].join('-');
};

export const RWANDA_MAJOR_TRANSPORT_HUBS = [
  { id: 'remera', name: 'Remera Bus Terminal', city: 'Kigali', district: 'Gasabo', province: 'Kigali City', country: 'Rwanda', latitude: -1.9545, longitude: 30.1121, hubType: 'intercity' },
  { id: 'sonatubes', name: 'Sonatubes Roadside Pickup', city: 'Kigali', district: 'Kicukiro', province: 'Kigali City', country: 'Rwanda', latitude: -1.9607, longitude: 30.1017, hubType: 'pickup' },
  { id: 'giporoso', name: 'Giporoso Transit Stop', city: 'Kigali', district: 'Gasabo', province: 'Kigali City', country: 'Rwanda', latitude: -1.9486, longitude: 30.1269, hubType: 'pickup' },
  { id: 'kicukiro-hub', name: 'Kicukiro Bus Terminal', city: 'Kigali', district: 'Kicukiro', province: 'Kigali City', country: 'Rwanda', latitude: -1.9706, longitude: 30.1044, hubType: 'city-terminal' },
  { id: 'nyamata', name: 'Nyamata Bus Park', city: 'Nyamata', district: 'Bugesera', province: 'Eastern Province', country: 'Rwanda', latitude: -2.1410, longitude: 30.1127, hubType: 'district-terminal' },
  { id: 'rwamagana-main', name: 'Rwamagana Main Station', city: 'Rwamagana', district: 'Rwamagana', province: 'Eastern Province', country: 'Rwanda', latitude: -1.9487, longitude: 30.4347, hubType: 'district-terminal' },
  { id: 'gicumbi-byumba', name: 'Gicumbi Byumba Station', city: 'Gicumbi', district: 'Gicumbi', province: 'Northern Province', country: 'Rwanda', latitude: -1.5786, longitude: 30.0675, hubType: 'district-terminal' },
  { id: 'karongi-kibuye', name: 'Karongi Kibuye Station', city: 'Karongi', district: 'Karongi', province: 'Western Province', country: 'Rwanda', latitude: -2.0597, longitude: 29.3478, hubType: 'lake-corridor' },
  { id: 'huye-main', name: 'Huye Main Station', city: 'Huye', district: 'Huye', province: 'Southern Province', country: 'Rwanda', latitude: -2.5967, longitude: 29.7394, hubType: 'district-terminal' },
  { id: 'musanze-main', name: 'Musanze Bus Station', city: 'Musanze', district: 'Musanze', province: 'Northern Province', country: 'Rwanda', latitude: -1.4998, longitude: 29.6349, hubType: 'district-terminal' },
  { id: 'rubavu-main', name: 'Rubavu Taxi Park', city: 'Rubavu', district: 'Rubavu', province: 'Western Province', country: 'Rwanda', latitude: -1.6818, longitude: 29.3134, hubType: 'border-corridor' },
  { id: 'rusizi-main', name: 'Rusizi Bus Station', city: 'Rusizi', district: 'Rusizi', province: 'Western Province', country: 'Rwanda', latitude: -2.4833, longitude: 28.9075, hubType: 'border-corridor' },
  { id: 'nyanza-main', name: 'Nyanza Station', city: 'Nyanza', district: 'Nyanza', province: 'Southern Province', country: 'Rwanda', latitude: -2.3519, longitude: 29.7509, hubType: 'heritage-corridor' },
];

export const RWANDA_STATIONS = [
  KIGALI_HUB,
  ...RWANDA_MAJOR_TRANSPORT_HUBS,
  ...RWANDA_DISTRICTS.map((district) => ({
    id: slugify(district.name),
    name: district.stationName,
    city: district.name,
    district: district.name,
    province: district.province,
    country: 'Rwanda',
    latitude: district.latitude,
    longitude: district.longitude,
  })),
  ...EAST_AFRICA_STATIONS,
];

export const RWANDA_OPERATORS = [
  {
    id: 'volcano-express',
    name: 'Volcano Express',
    logoPlaceholder: 'VE',
    rating: 4.8,
    reviewCount: 1840,
    supportPhone: '+250 788 305 050',
    email: 'support@volcano.rw',
    terminal: 'Nyabugogo Bus Park',
    busTypes: ['Luxury Coach', 'Executive Bus', 'VIP Bus'],
    amenities: ['WiFi', 'USB charging', 'Air conditioning', 'Reclining seats'],
    brandColor: '#dc2626',
  },
  {
    id: 'kigali-coach',
    name: 'Kigali Coach',
    logoPlaceholder: 'KC',
    rating: 4.5,
    reviewCount: 950,
    supportPhone: '+250 788 440 010',
    email: 'hello@kigalicoach.rw',
    terminal: 'Nyabugogo Bus Park',
    busTypes: ['Executive Bus', 'Standard Bus', 'Coaster'],
    amenities: ['Express service', 'Mobile ticketing', 'Clean coaches', 'Parcel desk'],
    brandColor: '#2563eb',
  },
  {
    id: 'omega',
    name: 'Omega',
    logoPlaceholder: 'OM',
    rating: 4.4,
    reviewCount: 780,
    supportPhone: '+250 788 552 255',
    email: 'bookings@omega.rw',
    terminal: 'Muhanga Road Terminal',
    busTypes: ['Standard Bus', 'Coaster', 'Mini Bus'],
    amenities: ['Affordable fares', 'Daily departures', 'Parcel desk', 'Luggage hold'],
    brandColor: '#ea580c',
  },
  {
    id: 'ritco',
    name: 'Ritco',
    logoPlaceholder: 'RT',
    rating: 4.6,
    reviewCount: 2260,
    supportPhone: '+250 788 319 333',
    email: 'info@ritco.rw',
    terminal: 'Remera and Nyabugogo',
    busTypes: ['Standard Bus', 'Executive Bus', 'Luxury Coach'],
    amenities: ['Reliable schedule', 'Large luggage hold', 'Professional drivers', 'QR boarding'],
    brandColor: '#1d4ed8',
  },
  {
    id: 'international-express',
    name: 'International Express',
    logoPlaceholder: 'IE',
    rating: 4.3,
    reviewCount: 640,
    supportPhone: '+250 788 900 112',
    email: 'care@internationalexpress.rw',
    terminal: 'Downtown Kigali',
    busTypes: ['Luxury Coach', 'Executive Bus'],
    amenities: ['Cross-border desk', 'Air conditioning', 'USB charging', 'Comfort seats'],
    brandColor: '#0f766e',
  },
  {
    id: 'jaguar-executive',
    name: 'Jaguar Executive Coaches',
    logoPlaceholder: 'JE',
    rating: 4.7,
    reviewCount: 1120,
    supportPhone: '+250 788 771 177',
    email: 'desk@jaguarexecutive.rw',
    terminal: 'Nyabugogo Executive Bay',
    busTypes: ['Executive Bus', 'VIP Bus', 'Luxury Coach'],
    amenities: ['Extra legroom', 'Onboard host', 'Priority boarding', 'Air conditioning'],
    brandColor: '#111827',
  },
  {
    id: 'east-africa-link',
    name: 'East Africa Link',
    logoPlaceholder: 'EA',
    rating: 4.5,
    reviewCount: 680,
    supportPhone: '+250 788 640 796',
    email: 'regional@eastafricalink.rw',
    terminal: 'Nyabugogo Cross-Border Desk',
    busTypes: ['VIP Bus', 'Luxury Coach', 'Executive Bus'],
    amenities: ['Cross-border manifests', 'Immigration stop alerts', 'USB charging', 'Reclining seats'],
    brandColor: '#0f172a',
  },
  {
    id: 'royal-express',
    name: 'Royal Express',
    logoPlaceholder: 'RE',
    rating: 4.7,
    reviewCount: 1215,
    supportPhone: '+250 788 770 070',
    email: 'care@royalexpress.rw',
    terminal: 'Downtown Kigali',
    busTypes: ['Executive Bus', 'VIP Bus'],
    amenities: ['Executive coach', 'Extra legroom', 'USB charging', 'Reserved seating'],
    brandColor: '#7c3aed',
  },
  {
    id: 'trinity',
    name: 'Trinity',
    logoPlaceholder: 'TR',
    rating: 4.4,
    reviewCount: 880,
    supportPhone: '+250 788 333 909',
    email: 'travel@trinity.rw',
    terminal: 'Kimironko Transit Hub',
    busTypes: ['Standard Bus', 'Coaster', 'Mini Bus'],
    amenities: ['Family seating', 'Mobile alerts', 'Daily service', 'Luggage hold'],
    brandColor: '#0891b2',
  },
  {
    id: 'yahoo-car',
    name: 'Yahoo Car',
    logoPlaceholder: 'YC',
    rating: 4.2,
    reviewCount: 520,
    supportPhone: '+250 788 222 303',
    email: 'book@yahoocar.rw',
    terminal: 'Nyabugogo Shared Mobility Desk',
    busTypes: ['Mini Bus', 'Coaster'],
    amenities: ['Flexible stops', 'Fast boarding', 'Compact luggage', 'Mobile ticketing'],
    brandColor: '#ca8a04',
  },
  {
    id: 'horizon',
    name: 'Horizon',
    logoPlaceholder: 'HZ',
    rating: 4.5,
    reviewCount: 970,
    supportPhone: '+250 788 454 545',
    email: 'support@horizon.rw',
    terminal: 'Remera Intercity Terminal',
    busTypes: ['Luxury Coach', 'Standard Bus', 'Executive Bus'],
    amenities: ['WiFi', 'Air conditioning', 'Quiet coach', 'USB charging'],
    brandColor: '#059669',
  },
  {
    id: 'virunga-express',
    name: 'Virunga Express',
    logoPlaceholder: 'VX',
    rating: 4.6,
    reviewCount: 1090,
    supportPhone: '+250 788 660 066',
    email: 'travel@virungaexpress.rw',
    terminal: 'Musanze Road Desk',
    busTypes: ['Luxury Coach', 'Executive Bus', 'Coaster'],
    amenities: ['Mountain route experts', 'WiFi', 'USB charging', 'Air conditioning'],
    brandColor: '#16a34a',
  },
  {
    id: 'capital-express',
    name: 'Capital Express',
    logoPlaceholder: 'CE',
    rating: 4.3,
    reviewCount: 710,
    supportPhone: '+250 788 121 909',
    email: 'hello@capitalexpress.rw',
    terminal: 'Kigali Downtown Desk',
    busTypes: ['Standard Bus', 'Executive Bus', 'Coaster'],
    amenities: ['City pickup', 'Reserved seats', 'SMS reminders', 'Parcel desk'],
    brandColor: '#be123c',
  },
];

const PLATE_NUMBERS = [
  'RAB 123 A',
  'RAE 245 M',
  'RAG 882 K',
  'RAC 201 V',
  'RAD 118 R',
  'RAF 550 X',
  'RAH 330 G',
  'RAJ 721 C',
  'RAK 415 T',
  'RAL 908 Y',
  'RAM 604 P',
  'RAN 777 B',
  'RAP 342 L',
  'RAR 219 E',
  'RAS 510 N',
  'RAT 835 S',
  'RAU 481 D',
  'RAV 663 H',
  'RAW 294 F',
  'RAX 730 Q',
  'RAY 105 Z',
  'RAZ 918 W',
  'RBA 421 J',
  'RBB 609 R',
];

const BUS_CAPACITY = {
  Coaster: { totalSeats: 30, rows: 8, columns: 4 },
  'Luxury Coach': { totalSeats: 40, rows: 10, columns: 4 },
  'Executive Bus': { totalSeats: 36, rows: 9, columns: 4 },
  'VIP Bus': { totalSeats: 32, rows: 8, columns: 4 },
  'Standard Bus': { totalSeats: 44, rows: 11, columns: 4 },
  'Mini Bus': { totalSeats: 24, rows: 6, columns: 4 },
};

const hashString = (value) => {
  let hash = 0;
  const text = String(value || '');
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
};

const createStableTripUuid = (value) => {
  const hex = Array.from({ length: 8 }, (_, index) => (
    hashString(`${value}:${index}`).toString(16).padStart(8, '0')
  )).join('').slice(0, 32).split('');
  hex[12] = '4';
  hex[16] = ['8', '9', 'a', 'b'][hashString(value) % 4];
  const text = hex.join('');

  return [
    text.slice(0, 8),
    text.slice(8, 12),
    text.slice(12, 16),
    text.slice(16, 20),
    text.slice(20)
  ].join('-');
};

const toIsoDate = (value = new Date()) => {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDateKey = (value) => toIsoDate(value).replace(/-/g, '');

const parseDateKey = (key) => {
  if (!/^\d{8}$/.test(String(key))) return null;
  return `${String(key).slice(0, 4)}-${String(key).slice(4, 6)}-${String(key).slice(6, 8)}`;
};

const addMinutes = (date, minutes) => {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
};

const formatTime = (date) => (
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
);

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  return `${hours}h ${String(remaining).padStart(2, '0')}m`;
};

const getDistanceKm = (origin, destination) => {
  const earthRadiusKm = 6371;
  const toRadians = (value) => (value * Math.PI) / 180;
  const dLat = toRadians(destination.latitude - origin.latitude);
  const dLng = toRadians(destination.longitude - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destination.latitude);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const directKm = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(18, Math.round((directKm * 1.35) + 8));
};

const routePairKey = (from, to) => `${from}->${to}`;

const buildRoutePairs = () => {
  const pairs = new Map();
  const cities = RWANDA_STATIONS.map((station) => station.city);
  const add = (from, to) => {
    if (from && to && from !== to) {
      pairs.set(routePairKey(from, to), { from, to });
    }
  };

  cities.filter((city) => city !== 'Kigali').forEach((city) => {
    add('Kigali', city);
    add(city, 'Kigali');
  });

  [
    ['Musanze', 'Rubavu'],
    ['Rubavu', 'Rusizi'],
    ['Rusizi', 'Nyamasheke'],
    ['Nyamasheke', 'Karongi'],
    ['Karongi', 'Rutsiro'],
    ['Rutsiro', 'Rubavu'],
    ['Musanze', 'Burera'],
    ['Musanze', 'Gakenke'],
    ['Gicumbi', 'Nyagatare'],
    ['Rulindo', 'Gicumbi'],
    ['Huye', 'Nyanza'],
    ['Huye', 'Gisagara'],
    ['Huye', 'Nyamagabe'],
    ['Nyamagabe', 'Nyaruguru'],
    ['Muhanga', 'Ruhango'],
    ['Kamonyi', 'Muhanga'],
    ['Kayonza', 'Nyagatare'],
    ['Rwamagana', 'Kayonza'],
    ['Kayonza', 'Ngoma'],
    ['Ngoma', 'Kirehe'],
    ['Nyagatare', 'Gatsibo'],
    ['Bugesera', 'Ngoma'],
    ['Gasabo', 'Rwamagana'],
    ['Kicukiro', 'Bugesera'],
    ['Nyarugenge', 'Muhanga'],
    ['Nyabihu', 'Rubavu'],
    ['Ngororero', 'Muhanga'],
    ['Karongi', 'Ngororero'],
    ['Kigali', 'Kampala'],
    ['Kigali', 'Nairobi'],
    ['Kigali', 'Goma'],
    ['Kigali', 'Bujumbura'],
    ['Kigali', 'Dar es Salaam'],
  ].forEach(([from, to]) => {
    add(from, to);
    add(to, from);
  });

  return Array.from(pairs.values());
};

const ROUTE_PAIRS = buildRoutePairs();

const stationByCity = (city) => RWANDA_STATIONS.find((station) => station.city === city) || KIGALI_HUB;

const getBorderCrossings = (origin, destination) => {
  const pair = [origin.country, destination.country].sort().join('-');
  const crossings = {
    'Rwanda-Uganda': ['Gatuna/Katuna border'],
    'Kenya-Rwanda': ['Gatuna/Katuna border', 'Busia or Malaba border'],
    'DR Congo-Rwanda': ['Goma/La Corniche border'],
    'Burundi-Rwanda': ['Akanyaru border'],
    'Rwanda-Tanzania': ['Rusumo border'],
  };

  return crossings[pair] || [];
};

const getRouteStops = (from, to, origin, destination) => {
  if (from === 'Kigali' && to === 'Kampala') {
    return ['Nyabugogo', 'Sonatubes', 'Gishushu', 'Remera', 'Nyacyonga', 'Gatuna', 'Kabale', 'Mbarara', 'Kampala'];
  }

  if (from === 'Kigali' && to === 'Nairobi') {
    return ['Nyabugogo', 'Remera', 'Gatuna', 'Mbarara', 'Kampala', 'Jinja', 'Busia', 'Kisumu', 'Nakuru', 'Nairobi'];
  }

  if (from === 'Kigali' && to === 'Goma') {
    return ['Nyabugogo', 'Rulindo', 'Musanze', 'Nyabihu', 'Rubavu', 'Goma'];
  }

  if (from === 'Kigali' && to === 'Bujumbura') {
    return ['Nyabugogo', 'Muhanga', 'Nyanza', 'Huye', 'Akanyaru', 'Kayanza', 'Bujumbura'];
  }

  if (from === 'Kigali' && to === 'Dar es Salaam') {
    return ['Nyabugogo', 'Rwamagana', 'Kayonza', 'Rusumo', 'Kahama', 'Dodoma', 'Morogoro', 'Dar es Salaam'];
  }

  if (from === 'Kigali') {
    return ['Nyabugogo', 'Sonatubes', 'Gishushu', 'Remera', destination.city];
  }

  return [origin.city, 'District stop', 'Main road checkpoint', 'Nyabugogo'];
};

const buildBus = (operator, routeHash, index) => {
  const type = operator.busTypes[(routeHash + index) % operator.busTypes.length];
  const capacity = BUS_CAPACITY[type] || BUS_CAPACITY['Standard Bus'];
  const plateNumber = PLATE_NUMBERS[(routeHash + index) % PLATE_NUMBERS.length];

  return {
    id: `${operator.id}-${slugify(type)}-${index % 4}`,
    name: `${operator.name} ${type}`,
    type,
    plateNumber,
    ...capacity,
    amenities: Array.from(new Set([...operator.amenities.slice(0, 3), type.includes('Luxury') ? 'Air conditioning' : 'Reserved seating'])),
  };
};

const buildTripForRoute = ({ from, to }, time, date, scheduleIndex, routeIndex) => {
  const origin = stationByCity(from);
  const destination = stationByCity(to);
  const routeHash = hashString(`${from}-${to}-${time}`);
  const operator = RWANDA_OPERATORS[(routeHash + scheduleIndex + routeIndex) % RWANDA_OPERATORS.length];
  const bus = buildBus(operator, routeHash, scheduleIndex);
  const distanceKm = getDistanceKm(origin, destination);
  const durationMinutes = Math.max(35, Math.round((distanceKm / 56) * 60) + ((routeHash % 4) * 7));
  const [hour, minute] = time.split(':').map(Number);
  const departureDate = new Date(`${toIsoDate(date)}T00:00:00`);
  departureDate.setHours(hour, minute, 0, 0);
  const arrivalDate = addMinutes(departureDate, durationMinutes);
  const premium = bus.type === 'VIP Bus' ? 1700 : bus.type === 'Luxury Coach' ? 1200 : bus.type === 'Executive Bus' ? 800 : 0;
  const baseFare = 900 + (distanceKm * 24) + premium + ((routeHash % 5) * 100);
  const price = Math.max(900, Math.round(baseFare / 100) * 100);
  const sold = Math.min(bus.totalSeats - 3, 4 + (routeHash % Math.max(8, bus.totalSeats - 9)));
  const seatsLeft = Math.max(3, bus.totalSeats - sold - (scheduleIndex % 3));
  const bookedSeats = Math.max(0, bus.totalSeats - seatsLeft);
  const occupancyPercent = Math.round((bookedSeats / bus.totalSeats) * 100);
  const dateKey = toDateKey(date);
  const isCrossBorder = origin.country !== 'Rwanda' || destination.country !== 'Rwanda';
  const routeStops = getRouteStops(from, to, origin, destination);
  const borderCrossings = getBorderCrossings(origin, destination);
  const status = seatsLeft <= 7 ? 'selling-fast' : scheduleIndex % 4 === 0 ? 'boarding' : 'scheduled';
  const legacyId = `rw-${dateKey}-${slugify(from)}-${slugify(to)}-${time.replace(':', '')}-${scheduleIndex}`;

  return {
    id: createStableTripUuid(`rindaseat:trip:${legacyId}`),
    legacyId,
    routeId: `route-${slugify(from)}-${slugify(to)}`,
    departure: from,
    arrival: to,
    departureStation: origin.name,
    arrivalStation: destination.name,
    departureDistrict: origin.district,
    arrivalDistrict: destination.district,
    departureProvince: origin.province,
    arrivalProvince: destination.province,
    departureCountry: origin.country,
    arrivalCountry: destination.country,
    departureDate: departureDate.toISOString(),
    arrivalDate: arrivalDate.toISOString(),
    date: departureDate.toISOString(),
    departureTime: time,
    arrivalTime: formatTime(arrivalDate),
    arrivalEstimate: formatTime(arrivalDate),
    duration: formatDuration(durationMinutes),
    durationMinutes,
    distanceKm,
    price,
    seatsLeft,
    availableSeats: seatsLeft,
    bookedSeats,
    totalSeats: bus.totalSeats,
    occupancyPercent,
    passengerLoadPercent: occupancyPercent,
    status,
    boardingStatus: status === 'boarding' ? 'Active boarding' : status === 'selling-fast' ? 'Selling fast' : 'On time',
    platform: from === 'Kigali' ? `Bay ${((routeHash + scheduleIndex) % 8) + 1}` : `Stand ${((routeHash + scheduleIndex) % 4) + 1}`,
    liveDemand: seatsLeft <= 7 ? 'High demand' : scheduleIndex % 3 === 0 ? 'Updating live' : 'Seats available',
    paymentMethods: ['MTN MOMO'],
    ticketType: 'QR ticket',
    isCrossBorder,
    borderCrossings,
    routeStops,
    driverApp: {
      pickupQueueEnabled: true,
      livePassengerMarkers: true,
      boardingQrScan: true,
      seatStatusSync: true,
    },
    company: {
      ...operator,
      phone: operator.supportPhone,
      logoUrl: null,
    },
    bus,
    amenities: Array.from(new Set([...operator.amenities, ...bus.amenities])),
  };
};

export const generateRwandaTrips = ({ date = toIsoDate(new Date()) } = {}) => (
  ROUTE_PAIRS.flatMap((route, routeIndex) => (
    SCHEDULE_TIMES.map((time, scheduleIndex) => buildTripForRoute(route, time, date, scheduleIndex, routeIndex))
  ))
);

const matchesText = (candidate, value) => (
  !value || String(candidate || '').toLowerCase().includes(String(value).toLowerCase())
);

export const searchRwandaTrips = (filters = {}) => {
  const date = filters.date || toIsoDate(new Date());
  const from = filters.from || '';
  const to = filters.to || '';
  const company = filters.company || '';
  const busType = filters.busType || '';
  const maxPrice = Number(filters.maxPrice || filters.price || 0);
  const limit = Number(filters.limit || 140);

  return generateRwandaTrips({ date })
    .filter((trip) => matchesText(trip.departure, from) || matchesText(trip.departureDistrict, from) || matchesText(trip.departureStation, from))
    .filter((trip) => matchesText(trip.arrival, to) || matchesText(trip.arrivalDistrict, to) || matchesText(trip.arrivalStation, to))
    .filter((trip) => !company || trip.company.id === company || matchesText(trip.company.name, company))
    .filter((trip) => !busType || trip.bus.type === busType)
    .filter((trip) => !maxPrice || Number(trip.price) <= maxPrice)
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate))
    .slice(0, limit);
};

const getStationSearchText = (station) => [
  station.name,
  station.city,
  station.district,
  station.province,
  station.country,
  station.hubType
].filter(Boolean).join(' ').toLowerCase();

export const getRwandaStationHierarchy = () => {
  const provinces = RWANDA_STATIONS
    .filter((station) => station.country === 'Rwanda')
    .reduce((provinceGroups, station) => {
      const province = provinceGroups[station.province] || {
        name: station.province,
        districts: {}
      };
      const district = province.districts[station.district] || {
        name: station.district,
        city: station.city,
        stations: []
      };

      district.stations.push(station);
      province.districts[station.district] = district;
      provinceGroups[station.province] = province;
      return provinceGroups;
    }, {});

  return Object.values(provinces).map((province) => ({
    ...province,
    districts: Object.values(province.districts).map((district) => ({
      ...district,
      stations: district.stations.sort((a, b) => a.name.localeCompare(b.name))
    })).sort((a, b) => a.name.localeCompare(b.name))
  })).sort((a, b) => a.name.localeCompare(b.name));
};

export const searchRwandaLocations = (query = '') => {
  const normalized = String(query || '').trim().toLowerCase();

  if (!normalized) {
    return getRwandaStationHierarchy();
  }

  return RWANDA_STATIONS
    .filter((station) => getStationSearchText(station).includes(normalized))
    .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
};

export const getStationsForLocation = (location = '') => {
  const normalized = String(location || '').trim().toLowerCase();

  return RWANDA_STATIONS
    .filter((station) => (
      station.city.toLowerCase() === normalized
      || station.district.toLowerCase() === normalized
      || station.province.toLowerCase() === normalized
      || station.name.toLowerCase().includes(normalized)
    ))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const getCompaniesForStation = (stationIdOrName = '') => {
  const station = RWANDA_STATIONS.find((item) => (
    item.id === stationIdOrName
    || item.name === stationIdOrName
    || item.city === stationIdOrName
  ));
  const seed = hashString(station?.id || stationIdOrName || 'rwanda');

  return RWANDA_OPERATORS
    .filter((operator, index) => station?.city === 'Kigali' || ((seed + index) % 3 !== 0))
    .slice(0, station?.city === 'Kigali' ? 8 : 5);
};

export const getAvailableBusesForStation = (stationIdOrName = '') => (
  getCompaniesForStation(stationIdOrName).flatMap((operator, operatorIndex) => (
    operator.busTypes.slice(0, 2).map((type, busIndex) => {
      const capacity = BUS_CAPACITY[type] || BUS_CAPACITY['Standard Bus'];
      return {
        id: createStableTripUuid(`rindaseat:station-bus:${stationIdOrName}:${operator.id}:${type}:${busIndex}`),
        companyId: operator.id,
        companyName: operator.name,
        type,
        plateNumber: PLATE_NUMBERS[(operatorIndex * 3 + busIndex) % PLATE_NUMBERS.length],
        seatsLeft: Math.max(3, capacity.totalSeats - (8 + operatorIndex + busIndex)),
        totalSeats: capacity.totalSeats,
        status: busIndex === 0 ? 'boarding' : 'scheduled'
      };
    })
  ))
);

export const getRwandaTripById = (tripId) => {
  const [, dateKey] = String(tripId || '').match(/^rw-(\d{8})-/) || [];
  const today = new Date();
  const candidateDates = dateKey
    ? [parseDateKey(dateKey)]
    : Array.from({ length: 33 }, (_, index) => toIsoDate(addMinutes(today, (index - 2) * 24 * 60)));

  return candidateDates
    .filter(Boolean)
    .flatMap((date) => generateRwandaTrips({ date }))
    .find((trip) => trip.id === tripId || trip.legacyId === tripId) || null;
};

export const getRwandaSeatInfo = (tripId) => {
  const trip = getRwandaTripById(tripId);
  const rows = trip?.bus?.rows || 10;
  const columns = trip?.bus?.columns || 4;
  const totalSeats = trip?.bus?.totalSeats || rows * columns;
  const seatCount = Math.max(4, Math.min(totalSeats - 3, totalSeats - Number(trip?.seatsLeft || 12)));
  const seed = hashString(tripId);
  const unavailableSeats = Array.from({ length: seatCount }, (_, index) => {
    const row = String.fromCharCode(65 + ((seed + index * 3) % rows));
    const col = ((seed + index * 5) % columns) + 1;
    return `${row}${col}`;
  });

  return {
    rows,
    columns,
    totalSeats,
    unavailableSeats: Array.from(new Set(unavailableSeats)),
    reservedSeats: Array.from(new Set(unavailableSeats)).slice(0, Math.ceil(seatCount / 3)),
    lockedSeats: Array.from(new Set(unavailableSeats)).slice(0, Math.ceil(seatCount / 2)),
  };
};

export const getRwandaTripMeta = () => ({
  stations: RWANDA_STATIONS,
  stationHierarchy: getRwandaStationHierarchy(),
  companies: RWANDA_OPERATORS.map((operator) => ({
    id: operator.id,
    name: operator.name,
    logoUrl: null,
    logoPlaceholder: operator.logoPlaceholder,
    rating: operator.rating,
    reviewCount: operator.reviewCount,
    amenities: operator.amenities,
    brandColor: operator.brandColor,
    supportPhone: operator.supportPhone,
  })),
  busTypes: RWANDA_BUS_TYPES,
});

export const LIVE_PICKUP_POINTS = [
  { id: 'sonatubes', name: 'Sonatubes', latitude: -1.9607, longitude: 30.1017, roadNote: 'Kicukiro outbound lane' },
  { id: 'gishushu', name: 'Gishushu', latitude: -1.9486, longitude: 30.0963, roadNote: 'KG 9 Avenue stop' },
  { id: 'remera', name: 'Remera', latitude: -1.9545, longitude: 30.1121, roadNote: 'Stadium junction' },
  { id: 'nyacyonga', name: 'Nyacyonga', latitude: -1.8446, longitude: 30.0809, roadNote: 'Northern corridor pickup' },
  { id: 'kabuga', name: 'Kabuga', latitude: -1.9459, longitude: 30.2149, roadNote: 'Eastern corridor pickup' },
];

export const getLiveTrackingSnapshot = (trip = searchRwandaTrips({ from: 'Kigali', limit: 1 })[0]) => {
  const stops = trip?.routeStops?.length ? trip.routeStops : ['Nyabugogo', 'Sonatubes', 'Gishushu', 'Remera', trip?.arrival || 'Huye'];
  const seed = hashString(trip?.id || `${trip?.departure}-${trip?.arrival}`);
  const progressPercent = Math.max(18, Math.min(82, 24 + (seed % 55)));
  const stopIndex = Math.min(stops.length - 2, Math.max(0, Math.floor((progressPercent / 100) * (stops.length - 1))));
  const currentStop = stops[stopIndex];
  const nextStop = stops[stopIndex + 1] || stops[stops.length - 1];
  const seatsLeft = Number(trip?.seatsLeft || 8);
  const totalSeats = Number(trip?.totalSeats || trip?.bus?.totalSeats || 40);
  const passengersOnboard = Math.max(0, totalSeats - seatsLeft);

  return {
    tripId: trip?.id,
    operator: trip?.company?.name || 'RindaSeat Coach',
    departure: trip?.departure || 'Kigali',
    arrival: trip?.arrival || 'Huye',
    currentStop,
    currentLocation: currentStop,
    nextStop,
    etaToNextStop: `${8 + (seed % 18)} min`,
    progressPercent,
    seatsLeft,
    totalSeats,
    passengersOnboard,
    latitude: LIVE_PICKUP_POINTS[stopIndex % LIVE_PICKUP_POINTS.length]?.latitude || KIGALI_HUB.latitude,
    longitude: LIVE_PICKUP_POINTS[stopIndex % LIVE_PICKUP_POINTS.length]?.longitude || KIGALI_HUB.longitude,
    remainingStops: stops.slice(stopIndex + 1).map((name, index) => ({
      name,
      eta: `${10 + (index * 14) + (seed % 6)} min`,
    })),
  };
};

export const getRoadsidePickupOptions = (trip = searchRwandaTrips({ from: 'Kigali', limit: 1 })[0]) => (
  LIVE_PICKUP_POINTS.map((point, index) => ({
    ...point,
    distanceKm: Number((0.4 + (index * 0.7)).toFixed(1)),
    eta: `${6 + (index * 4)} min`,
    seatsLeft: Math.max(2, Number(trip?.seatsLeft || 10) - index),
    fare: Number(trip?.price || 2500),
    driverNotification: {
      passengerName: 'Pending passenger',
      passengerPhone: 'Pending phone',
      markerType: 'roadside-pickup',
      pickupPoint: point.name,
    },
  }))
);

export const DRIVER_APP_SERVICE_BLUEPRINT = {
  sharedTripFields: ['tripId', 'routeStops', 'seatsLeft', 'passengersOnboard', 'boardingStatus'],
  driverQueueFields: ['passengerName', 'phone', 'pickupPoint', 'latitude', 'longitude', 'etaToPickup', 'seatCount'],
  boardingActions: ['scanQrTicket', 'confirmBoarding', 'releaseNoShowSeat', 'syncSeatStatus'],
  realtimeChannels: ['driver-location', 'passenger-pickup-marker', 'seat-inventory', 'boarding-confirmation'],
};

const DEMO_BOOKINGS_KEY = 'rindaseat_demo_bookings';

const getStorage = () => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
};

const readDemoBookings = () => {
  const storage = getStorage();
  if (!storage) return [];
  try {
    return JSON.parse(storage.getItem(DEMO_BOOKINGS_KEY) || '[]');
  } catch (error) {
    return [];
  }
};

const writeDemoBookings = (bookings) => {
  const storage = getStorage();
  if (storage) {
    storage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(bookings));
  }
};

export const getDemoBookings = () => readDemoBookings();

export const getDemoBooking = (bookingId) => (
  readDemoBookings().find((booking) => String(booking.id) === String(bookingId) || String(booking.bookingReference) === String(bookingId)) || null
);

export const createDemoBooking = ({ tripId, seats = [], passengerInfo = {} }) => {
  const trip = getRwandaTripById(tripId);
  const bookingNumber = `RS-${Date.now().toString().slice(-6)}`;
  const normalizedSeats = seats.map((seat) => (typeof seat === 'string' ? seat : seat.number)).filter(Boolean);
  const booking = {
    id: createUuid(),
    source: 'rwanda-demo-fallback',
    isDemoBooking: true,
    bookingReference: bookingNumber,
    tripId,
    departure: trip?.departure || 'Kigali',
    arrival: trip?.arrival || 'Huye',
    date: trip?.departureDate || new Date().toISOString(),
    departureTime: trip?.departureTime || '09:00',
    arrivalTime: trip?.arrivalTime || '12:00',
    company: trip?.company?.name || 'RindaSeat Demo',
    busType: trip?.bus?.type || 'Standard Bus',
    plateNumber: trip?.bus?.plateNumber || 'RAB 123 A',
    seats: normalizedSeats,
    passengerInfo,
    totalPrice: Number(trip?.price || 0) * normalizedSeats.length,
    paymentStatus: 'pending',
    status: 'reserved',
    createdAt: new Date().toISOString(),
  };

  const bookings = [booking, ...readDemoBookings().filter((item) => item.id !== booking.id)].slice(0, 20);
  writeDemoBookings(bookings);
  return booking;
};

export const confirmDemoPayment = ({ bookingId, method = 'momo' } = {}) => {
  const bookings = readDemoBookings();
  const nextBookings = bookings.map((booking) => (
    String(booking.id) === String(bookingId)
      ? {
        ...booking,
        paymentStatus: 'paid',
        status: 'confirmed',
        paymentMethod: method,
        paidAt: new Date().toISOString(),
      }
      : booking
  ));
  writeDemoBookings(nextBookings);
  return nextBookings.find((booking) => String(booking.id) === String(bookingId)) || null;
};

export const dashboardFallbackBookings = () => {
  const stored = readDemoBookings();
  if (stored.length > 0) return stored;

  const sampleTrips = searchRwandaTrips({ from: 'Kigali', limit: 3 });
  return sampleTrips.map((trip, index) => ({
    id: createStableTripUuid(`rindaseat:sample-booking:${trip.id}`),
    source: 'rwanda-demo-fallback',
    isDemoBooking: true,
    bookingReference: `RS-SAMPLE-${index + 1}`,
    tripId: trip.id,
    departure: trip.departure,
    arrival: trip.arrival,
    date: trip.departureDate,
    departureTime: trip.departureTime,
    arrivalTime: trip.arrivalTime,
    company: trip.company.name,
    seats: [`${String.fromCharCode(65 + index)}${index + 1}`],
    totalPrice: trip.price,
    paymentStatus: index === 0 ? 'paid' : 'pending',
    status: index === 0 ? 'confirmed' : 'reserved',
  }));
};
