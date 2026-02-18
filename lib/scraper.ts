import { type ListingData } from "./mock-listing";

// Apify actor: tri_angle/airbnb-rooms-urls-scraper
// Scrapes full listing details from direct Airbnb room URLs.
const ACTOR_ID = "tri_angle~airbnb-rooms-urls-scraper";

// Max time to wait for the Apify run to finish (ms)
const MAX_POLL_TIME = 120_000;
const POLL_INTERVAL = 3_000;

interface ApifyRunResponse {
  data: {
    id: string;
    defaultDatasetId: string;
    status: string;
  };
}

/**
 * Scrape an Airbnb listing via Apify tri_angle/airbnb-rooms-urls-scraper.
 * Requires APIFY_API_TOKEN env var.
 */
export async function scrapeAirbnbListing(url: string): Promise<ListingData | null> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    console.error("APIFY_API_TOKEN is not set, skipping scrape");
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await runApifyActor(token, url);
  if (!raw) return null;

  return normalizeToListingData(raw, url);
}

// ---------------------------------------------------------------------------
// Apify actor execution
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runApifyActor(token: string, listingUrl: string): Promise<any | null> {
  // 1. Start the actor run
  const startUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/runs`;
  const startRes = await fetch(startUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      urls: [listingUrl],
    }),
  });

  if (!startRes.ok) {
    const body = await startRes.text().catch(() => "");
    console.error(`Apify start run failed [${startRes.status}]:`, body.slice(0, 500));
    throw new Error(`Failed to start Apify scraper: ${startRes.status}`);
  }

  const run: ApifyRunResponse = await startRes.json();
  const runId = run.data.id;
  const datasetId = run.data.defaultDatasetId;

  // 2. Poll until the run finishes
  let status = run.data.status;
  const deadline = Date.now() + MAX_POLL_TIME;

  while ((status === "RUNNING" || status === "READY") && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));

    const pollRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!pollRes.ok) {
      const pollErr = await pollRes.text().catch(() => "");
      console.error(`Apify poll failed [${pollRes.status}]:`, pollErr.slice(0, 300));
      throw new Error(`Failed to poll Apify run: ${pollRes.status}`);
    }
    const pollData = await pollRes.json();
    status = pollData.data.status;
  }

  if (status !== "SUCCEEDED") {
    console.error(`Apify run finished with status: ${status}`);
    throw new Error(`Apify scraper failed with status: ${status}`);
  }

  // 3. Fetch dataset items
  const dsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!dsRes.ok) {
    const dsErr = await dsRes.text().catch(() => "");
    console.error(`Apify dataset fetch failed [${dsRes.status}]:`, dsErr.slice(0, 300));
    throw new Error(`Failed to fetch Apify dataset: ${dsRes.status}`);
  }

  const items = await dsRes.json();
  if (!Array.isArray(items) || items.length === 0) {
    console.error("Apify returned empty dataset");
    return null;
  }

  return items[0];
}

// ---------------------------------------------------------------------------
// Normalize Apify response → ListingData
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeToListingData(raw: any, originalUrl: string): ListingData {
  // Photos / images — may be array of strings or objects with url/caption
  const rawPhotos = raw.images || raw.photos || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photoCaptions: string[] = rawPhotos.map((p: any) =>
    typeof p === "string" ? "" : (p.caption || p.title || p.accessibilityLabel || "")
  );

  // Description
  const description =
    raw.description || raw.detailDescription || raw.sectioned_description?.description || "";

  // Amenities — may be array of strings or objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const amenities: string[] = (raw.amenities || []).map((a: any) =>
    typeof a === "string" ? a : (a.name || a.title || a.tag || "")
  ).filter(Boolean);

  // Reviews
  const reviewSample: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (raw.reviews || []).slice(0, 4)) {
    const text = typeof r === "string" ? r : (r.comments || r.reviewText || r.comment || "");
    if (text) reviewSample.push(text);
  }

  // Host
  const hostObj = raw.host || {};
  const hostName =
    hostObj.name || hostObj.hostName || hostObj.firstName || hostObj.first_name || raw.hostName || "";
  const isSuperhost =
    hostObj.isSuperhost || hostObj.isSuperHost || hostObj.is_superhost || raw.isSuperhost || false;
  const responseRate =
    hostObj.responseRate || hostObj.response_rate || "N/A";

  // Location
  const city =
    raw.city || raw.address?.city || raw.locationTitle?.split(",")[0]?.trim() || "";
  const area =
    raw.neighborhood || raw.address?.neighborhood || "";
  const country =
    raw.country || raw.address?.country || raw.countryCode || "Italia";

  // Price
  let priceAmount = 0;
  if (typeof raw.price === "number") {
    priceAmount = raw.price;
  } else if (raw.price?.rate) {
    priceAmount = raw.price.rate;
  } else if (raw.price?.amount) {
    priceAmount = raw.price.amount;
  } else if (raw.pricing?.rate?.amount) {
    priceAmount = raw.pricing.rate.amount;
  }

  return {
    url: raw.url || originalUrl,
    title: raw.name || raw.title || raw.detailTitle || "",
    description,
    photoCount: rawPhotos.length,
    photoCaptions,
    amenities,
    price: { amount: priceAmount, currency: "EUR", period: "notte" },
    rating: raw.stars || raw.rating || raw.star_rating || raw.guestSatisfactionOverall || 0,
    reviewCount: raw.reviewsCount || raw.numberOfReviews || raw.reviews_count || raw.reviewCount || 0,
    reviewSample,
    propertyType: raw.roomType || raw.propertyType || raw.room_type || "",
    location: { city, area, country },
    host: { name: hostName, superhost: isSuperhost, responseRate },
    guests: raw.numberOfGuests || raw.personCapacity || raw.guestCount || raw.person_capacity || 0,
    bedrooms: raw.bedrooms || raw.bedroomCount || raw.bedroom_count || 0,
    beds: raw.beds || raw.bedCount || raw.bed_count || 0,
    bathrooms: raw.bathrooms || raw.bathroomCount || raw.bathroom_count || 0,
  };
}
