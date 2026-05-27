// Mock logistics data used across the platform.
// These act as the seed data; the admin can override them via the Admin Panel
// (changes persist in localStorage until exported and re-committed).
export type Branch = {
  slug: string;
  name: string;
  city: string;
  state: string;
  isHeadOffice?: boolean;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  routes: string[];
  industries: string[];
};

export const branches: Branch[] = [
  {
    slug: "vapi",
    name: "Vapi Head Office",
    city: "Vapi",
    state: "Gujarat",
    isHeadOffice: true,
    address: "Plot 12, GIDC Industrial Estate, Vapi, Gujarat 396195",
    contactPerson: "Rakesh Patel",
    phone: "+91 98XXXXXX01",
    email: "vapi@trinetralogistics.in",
    routes: ["Vapi → Pune", "Vapi → Bhiwandi", "Vapi → Raipur", "Vapi → Delhi"],
    industries: ["Chemicals", "Packaging", "Engineering Goods", "Textiles"],
  },
  {
    slug: "raipur",
    name: "Raipur Branch",
    city: "Raipur",
    state: "Chhattisgarh",
    address: "Urla Industrial Area, Raipur, Chhattisgarh 493221",
    contactPerson: "Suresh Verma",
    phone: "+91 98XXXXXX02",
    email: "raipur@trinetralogistics.in",
    routes: ["Raipur → Vapi", "Raipur → Pune", "Raipur → Nagpur"],
    industries: ["Steel & Fabrication", "Industrial Supplies", "FMCG"],
  },
  {
    slug: "pune",
    name: "Pune Branch",
    city: "Pune",
    state: "Maharashtra",
    address: "Chakan MIDC Phase II, Pune, Maharashtra 410501",
    contactPerson: "Anil Deshmukh",
    phone: "+91 98XXXXXX03",
    email: "pune@trinetralogistics.in",
    routes: ["Pune → Vapi", "Pune → Raipur", "Pune → Bhiwandi"],
    industries: ["Manufacturing", "Engineering Goods", "FMCG"],
  },
  {
    slug: "bhiwandi",
    name: "Bhiwandi Branch",
    city: "Bhiwandi",
    state: "Maharashtra",
    address: "Mankoli Naka, Bhiwandi, Maharashtra 421302",
    contactPerson: "Imran Shaikh",
    phone: "+91 98XXXXXX04",
    email: "bhiwandi@trinetralogistics.in",
    routes: ["Bhiwandi → Vapi", "Bhiwandi → Pune", "Bhiwandi → Surat"],
    industries: ["FMCG", "Packaging", "Textiles", "Industrial Supplies"],
  },
];

export type FreightRate = {
  from: string;
  to: string;
  vehicle: string;
  loadType: string;
  rate: number; // ₹ per ton
  dieselImpact: string;
  updated: string;
};

export const freightRates: FreightRate[] = [
  {
    from: "Vapi",
    to: "Pune",
    vehicle: "32ft SXL",
    loadType: "FTL",
    rate: 1850,
    dieselImpact: "+1.2%",
    updated: "2025-05-19",
  },
  {
    from: "Vapi",
    to: "Bhiwandi",
    vehicle: "20ft Container",
    loadType: "FTL",
    rate: 1100,
    dieselImpact: "+0.4%",
    updated: "2025-05-19",
  },
  {
    from: "Vapi",
    to: "Raipur",
    vehicle: "32ft MXL",
    loadType: "FTL",
    rate: 3650,
    dieselImpact: "+1.8%",
    updated: "2025-05-18",
  },
  {
    from: "Pune",
    to: "Raipur",
    vehicle: "32ft SXL",
    loadType: "FTL",
    rate: 3200,
    dieselImpact: "+1.6%",
    updated: "2025-05-18",
  },
  {
    from: "Bhiwandi",
    to: "Vapi",
    vehicle: "14ft Truck",
    loadType: "PTL",
    rate: 1250,
    dieselImpact: "+0.5%",
    updated: "2025-05-19",
  },
  {
    from: "Raipur",
    to: "Vapi",
    vehicle: "32ft MXL",
    loadType: "FTL",
    rate: 3580,
    dieselImpact: "+1.7%",
    updated: "2025-05-17",
  },
  {
    from: "Pune",
    to: "Vapi",
    vehicle: "32ft SXL",
    loadType: "FTL",
    rate: 1820,
    dieselImpact: "+1.1%",
    updated: "2025-05-19",
  },
  {
    from: "Vapi",
    to: "Delhi",
    vehicle: "32ft MXL",
    loadType: "FTL",
    rate: 2950,
    dieselImpact: "+1.4%",
    updated: "2025-05-18",
  },
];

export type Delivery = {
  industry: string;
  route: string;
  load: string;
  challenge: string;
  solution: string;
  result: string;
};

export const deliveries: Delivery[] = [
  {
    industry: "Specialty Chemicals",
    route: "Vapi → Pune",
    load: "18 Ton, Hazardous Class 3",
    challenge: "Time-bound dispatch with hazardous handling clearance.",
    solution: "Dedicated 32ft SXL with licensed driver, GPS tracking, midnight dispatch.",
    result: "Delivered in 19 hours, POD collected, zero incident.",
  },
  {
    industry: "Engineering Goods",
    route: "Pune → Raipur",
    load: "24 Ton CNC components",
    challenge: "Fragile load over 1,100+ km mixed terrain.",
    solution: "MXL with custom bracing, two-driver relay, daily live updates.",
    result: "On-time delivery in 36 hours, zero damage.",
  },
  {
    industry: "FMCG",
    route: "Bhiwandi → Vapi",
    load: "12 Ton mixed SKU PTL",
    challenge: "Multi-drop with strict retailer slot timings.",
    solution: "Hub-routed PTL with sequenced loading and slot-matched delivery.",
    result: "100% slot adherence across 9 drops.",
  },
  {
    industry: "Steel & Fabrication",
    route: "Raipur → Vapi",
    load: "27 Ton TMT bundles",
    challenge: "Heavy load, weighbridge and toll documentation.",
    solution: "MXL with overweight permit pre-clearance, route audit.",
    result: "Delivered in 48 hours with full doc trail.",
  },
];

export const industries = [
  { name: "Manufacturing", desc: "Plant-to-plant raw material and finished goods movement." },
  { name: "Engineering Goods", desc: "Sensitive machinery and component transport with bracing." },
  { name: "Chemicals", desc: "Licensed hazardous and non-haz chemical logistics." },
  { name: "FMCG", desc: "Multi-drop PTL and FTL with retailer slot adherence." },
  { name: "Packaging", desc: "High-volume low-density loads with optimized cubing." },
  { name: "Industrial Supplies", desc: "MRO and B2B distribution across industrial hubs." },
  { name: "Steel & Fabrication", desc: "Heavy load handling with permit and weighbridge support." },
  { name: "Textiles", desc: "Roll and bale movement between Surat–Bhiwandi–Vapi belt." },
];

export const trustMetrics = [
  { label: "Successful Deliveries", value: "48,000+" },
  { label: "Active Clients", value: "420+" },
  { label: "Branch Network", value: "4 Hubs" },
  { label: "On-time Delivery", value: "97.4%" },
];

export const deliveryCounters = [
  { label: "Total Deliveries", value: "48,210" },
  { label: "PODs Collected", value: "47,985" },
  { label: "Repeat Clients", value: "78%" },
  { label: "Avg. Transit Time", value: "32 hrs" },
];
