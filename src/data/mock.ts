// Seed data for Abhay Road Carrier. Used when the KV store is empty;
// the admin can override any of these via the Admin Panel.
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
    address:
      "Plot no.10, Param Industrial Hub, opposite Evershine Industrial Park, Karvad Road, Karvad, Vapi 396193",
    contactPerson: "Prabhashankar Upadhyay / Shubham Upadhyay",
    phone: "+91 94290-08362",
    email: "office@abhayroadcarrier.in",
    routes: [
      "Head Office & Control Tower",
      "24/7 Operations Monitoring",
      "Customer Support Desk",
      "Freight Planning & Coordination",
    ],
    industries: ["Chemicals", "Welding", "Paper", "Rubber", "Engineering Goods", "Textiles"],
  },
  {
    slug: "raipur",
    name: "Raipur Branch",
    city: "Raipur",
    state: "Chhattisgarh",
    address: "Block No. 7, Parking No. 3, Transport Nagar, Rawabhata, Raipur (C.G.) 493221",
    contactPerson: "Nishakant Pathak",
    phone: "+91 81888-87362",
    email: "office@abhayroadcarrier.in",
    routes: [
      "Central India Hub",
      "Industrial Cargo Experts",
      "Regional Dispatch Team",
      "Fast POD Processing",
    ],
    industries: ["Steel & Fabrication", "Minerals", "Construction Equipment", "FMCG"],
  },
  {
    slug: "pune",
    name: "Pune Branch",
    city: "Pune",
    state: "Maharashtra",
    address:
      "Shop No. 2, Gate No. 57, Dehu-Alandi Road, Opp. Gulmohar Compound, Talawade, Pune (MH) 411062",
    contactPerson: "Kuldeep Mishra",
    phone: "+91 94263-95222",
    email: "office@abhayroadcarrier.in",
    routes: [
      "Manufacturing Corridor Coverage",
      "Dedicated Local Operations Team",
      "Daily Vehicle Placement",
      "Warehouse Coordination",
    ],
    industries: ["Manufacturing", "Engineering Goods", "FMCG", "Construction Equipment"],
  },
  {
    slug: "bhiwandi",
    name: "Bhiwandi Branch",
    city: "Bhiwandi",
    state: "Maharashtra",
    address:
      "House No. 142/A, Godown No. 5, near U.P Dhaba & Sumit Logistic Park, Village Borivali (Kukse), Post Amne, Bhiwandi 421320",
    contactPerson: "Vishal Upadhyay",
    phone: "+91 96217-77284",
    email: "office@abhayroadcarrier.in",
    routes: [
      "Warehousing & Distribution Hub",
      "Mumbai & NCR Connectivity",
      "Consolidation Services",
      "Last-Mile Dispatch Support",
    ],
    industries: ["FMCG", "Textiles", "Industrial Supplies", "Welding"],
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
    industry: "Welding & Engineering",
    route: "Pune → Raipur",
    load: "24 Ton precision welding consumables",
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
    industry: "Construction Equipment",
    route: "Raipur → Vapi",
    load: "27 Ton heavy machinery spares",
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
  {
    name: "Welding & Electrodes",
    desc: "Specialized handling for welding consumables and electrodes.",
  },
  { name: "Paper", desc: "Bulk paper roll transport with moisture-protected loads." },
  { name: "Rubber", desc: "Heat-sensitive rubber products with covered fleet." },
  {
    name: "Construction Equipment",
    desc: "Heavy machinery and spare parts across pan-India sites.",
  },
  { name: "Minerals", desc: "Bulk mineral transport with weighbridge and permit support." },
  { name: "Textiles", desc: "Roll and bale movement between Surat–Bhiwandi–Vapi belt." },
];

export const trustMetrics = [
  { label: "Years of Experience", value: "18+" },
  { label: "Attached Trucks", value: "500+" },
  { label: "Own Trucks", value: "15" },
  { label: "Fixed Drivers", value: "18" },
];

export const deliveryCounters = [
  { label: "Branch Network", value: "4 Hubs" },
  { label: "PAN India FTL", value: "Yes" },
  { label: "PTL Strength", value: "MH · GJ · CG" },
  { label: "Customer Service", value: "24×7" },
];
