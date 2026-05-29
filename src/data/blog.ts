// Blog post type + initial seed posts. Once the admin saves their first
// post via the Admin Panel, the seed disappears (KV takes over).
export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  body: string; // HTML produced by TipTap
  tags: string[];
  author: string;
  publishedAt: string; // ISO 8601
};

export const seedBlogPosts: BlogPost[] = [
  {
    id: "seed-1",
    slug: "five-ways-to-cut-diesel-impact-on-vapi-pune-routes",
    title: "5 ways to cut diesel impact on Vapi → Pune routes",
    excerpt:
      "Diesel swings hit road freight harder than most shippers realise. Here are five practical levers we pull on the Vapi → Pune lane to keep your per-ton costs predictable.",
    coverImage: "",
    body: `<h2>Why diesel matters more on this lane</h2><p>Vapi → Pune is a 350+ km mixed-terrain run with two toll plazas and one major bypass. Even a ₹1 swing in diesel/ltr changes the per-ton cost noticeably.</p><h3>1. Lock 7-day moving averages, not spot prices</h3><p>We adjust freight against a 7-day moving average so your invoices don't bounce with daily diesel jitters.</p><h3>2. Match the truck size to the load</h3><p>A 14ft truck running half-empty costs you more per ton than a fully loaded 32ft SXL.</p><h3>3. Use return-load discounts</h3><p>Where we have a confirmed return load, we pass the saving back as a 4-6% rate cut.</p><h3>4. Bunch shipments around weighbridge windows</h3><p>Avoiding peak weighbridge hours saves 60-90 mins per consignment.</p><h3>5. Track POD digitally</h3><p>Faster POD means faster billing and fewer disputes — both reduce your effective cost of capital.</p>`,
    tags: ["Diesel", "FTL", "Cost Optimization"],
    author: "Abhay Road Carrier",
    publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "seed-2",
    slug: "why-90-percent-of-indian-logistics-is-still-unorganized",
    title: "Why 90% of Indian B2B logistics is still unorganized — and what it means for you",
    excerpt:
      "India's logistics costs are 13-14% of GDP — nearly double the developed-world average. Here's how an organized branch-led approach helps shippers reclaim that gap.",
    coverImage: "",
    body: `<p>Logistics costs in India sit at <strong>13-14% of GDP</strong>, compared to 8-9% in developed nations. The reason is well known: about 90% of the trucking market is still unorganized — owner-driven single trucks, opaque rate cards, and no document trail.</p><h3>What "unorganized" really means for shippers</h3><ul><li>No standard contracts</li><li>No POD discipline</li><li>No real-time tracking</li><li>Highly variable per-ton pricing</li></ul><h3>Where a branch-led model wins</h3><p>With four operating branches and 18+ years of relationships, we run on the organized side: written rate cards, POD-backed billing, 24×7 coordination, and trained drivers on every lane.</p>`,
    tags: ["Industry", "PAN India"],
    author: "Abhay Road Carrier",
    publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
