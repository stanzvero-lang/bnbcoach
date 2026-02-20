import { type ListingData } from "./mock-listing";

// Apify actor: tri_angle/airbnb-rooms-urls-scraper
// Scrapes full listing details from direct Airbnb room URLs.
const ACTOR_ID = "tri_angle~airbnb-rooms-urls-scraper";

// Max time to wait for the Apify run to finish (ms)
const MAX_POLL_TIME = 30_000;
const POLL_INTERVAL = 3_000;
// Timeout for individual HTTP requests to Apify API (ms)
const FETCH_TIMEOUT = 10_000;

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
export async function scrapeAirbnbListing(url: string): Promise<ListingData> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not set — cannot scrape listing");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await runApifyActor(token, url);
  if (!raw) {
    throw new Error("Apify returned no data for this listing");
  }

  return normalizeToListingData(raw, url);
}

// ---------------------------------------------------------------------------
// Apify actor execution
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runApifyActor(token: string, listingUrl: string): Promise<any | null> {
  const input = { startUrls: [{ url: listingUrl }] };

  // 1. Start the actor run
  const startUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/runs`;
  console.log(`[Apify] Starting actor ${ACTOR_ID}`);
  console.log(`[Apify] POST ${startUrl}`);
  console.log(`[Apify] Input: ${JSON.stringify(input)}`);

  const startRes = await fetch(startUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });

  if (!startRes.ok) {
    const body = await startRes.text().catch(() => "");
    console.error(`[Apify] Start run FAILED [${startRes.status} ${startRes.statusText}]`);
    console.error(`[Apify] Response headers:`, Object.fromEntries(startRes.headers.entries()));
    console.error(`[Apify] Response body:`, body);
    throw new Error(`Failed to start Apify scraper: ${startRes.status} - ${body}`);
  }

  const run: ApifyRunResponse = await startRes.json();
  const runId = run.data.id;
  const datasetId = run.data.defaultDatasetId;
  console.log(`[Apify] Run started: id=${runId}, dataset=${datasetId}, status=${run.data.status}`);

  // 2. Poll until the run finishes
  let status = run.data.status;
  const deadline = Date.now() + MAX_POLL_TIME;

  while ((status === "RUNNING" || status === "READY") && Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL));

    const pollRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(FETCH_TIMEOUT) }
    );
    if (!pollRes.ok) {
      const pollErr = await pollRes.text().catch(() => "");
      console.error(`[Apify] Poll FAILED [${pollRes.status}]:`, pollErr);
      throw new Error(`Failed to poll Apify run: ${pollRes.status}`);
    }
    const pollData = await pollRes.json();
    status = pollData.data.status;
    console.log(`[Apify] Poll: status=${status}`);
  }

  if (status !== "SUCCEEDED") {
    // Fetch run details to get the error message
    try {
      const detailRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const detail = await detailRes.json();
      console.error(`[Apify] Run FAILED with status: ${status}`);
      console.error(`[Apify] Run details:`, JSON.stringify(detail.data, null, 2));
    } catch {
      console.error(`[Apify] Run FAILED with status: ${status} (could not fetch details)`);
    }
    throw new Error(`Apify scraper failed with status: ${status}`);
  }

  console.log(`[Apify] Run succeeded, fetching dataset ${datasetId}`);

  // 3. Fetch dataset items
  const dsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items`,
    { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(FETCH_TIMEOUT) }
  );
  if (!dsRes.ok) {
    const dsErr = await dsRes.text().catch(() => "");
    console.error(`[Apify] Dataset fetch FAILED [${dsRes.status}]:`, dsErr);
    throw new Error(`Failed to fetch Apify dataset: ${dsRes.status}`);
  }

  const items = await dsRes.json();
  console.log(`[Apify] Dataset returned ${Array.isArray(items) ? items.length : 0} items`);

  if (!Array.isArray(items) || items.length === 0) {
    console.error("[Apify] Dataset is empty — no results returned");
    return null;
  }

  // Log full raw data for debugging field mapping and normalization issues
  console.log(`[Apify] Item keys: ${Object.keys(items[0]).join(", ")}`);
  console.log("[Apify] RAW FULL RESPONSE:", JSON.stringify(items[0]));

  return items[0];
}

// ---------------------------------------------------------------------------
// Normalize Apify response → ListingData
// ---------------------------------------------------------------------------

// Parse room details from subDescription.items like ['2 guests', '1 bedroom', '2 beds', '1 bath']
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSubDescription(raw: any): { guests: number; bedrooms: number; beds: number; bathrooms: number } {
  const result = { guests: 0, bedrooms: 0, beds: 0, bathrooms: 0 };
  const items: string[] = raw.subDescription?.items || raw.subDescription || [];
  if (!Array.isArray(items)) return result;

  for (const item of items) {
    if (typeof item !== "string") continue;
    const lower = item.toLowerCase();
    const num = parseInt(item.match(/\d+/)?.[0] || "0", 10);
    if (lower.includes("guest") || lower.includes("ospit")) result.guests = num;
    else if (lower.includes("bedroom") || lower.includes("camer")) result.bedrooms = num;
    else if (lower.includes("bed") || lower.includes("lett")) result.beds = num;
    else if (lower.includes("bath") || lower.includes("bagn")) result.bathrooms = num;
  }
  return result;
}

// Extract individual amenity names from Apify's nested amenity structure.
// Apify may return: array of strings, array of { title, items: [...] } categories,
// or array of { name } / { title } objects.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractAmenities(raw: any): string[] {
  const rawAmenities = raw.amenities || [];
  if (!Array.isArray(rawAmenities)) return [];

  const amenities: string[] = [];
  for (const a of rawAmenities) {
    if (typeof a === "string") {
      amenities.push(a);
    } else if (a && typeof a === "object") {
      // If it's a category with nested items, extract each item
      if (Array.isArray(a.items)) {
        for (const item of a.items) {
          const name = typeof item === "string" ? item : (item?.title || item?.name || "");
          if (name) amenities.push(name);
        }
      } else {
        // Simple object with name/title
        const name = a.name || a.title || a.tag || "";
        if (name) amenities.push(name);
      }
    }
  }
  return amenities;
}

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

  // Amenities — extract individual items, not categories
  const amenities = extractAmenities(raw);

  // Reviews
  const reviewSample: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const r of (raw.reviews || []).slice(0, 4)) {
    const text = typeof r === "string" ? r : (r.comments || r.reviewText || r.comment || "");
    if (text) reviewSample.push(text);
  }

  // Host — responseRate may be on host object or top-level as string like "100%"
  const hostObj = raw.host || {};
  const hostName =
    hostObj.name || hostObj.hostName || hostObj.firstName || hostObj.first_name || raw.hostName || "";
  const isSuperhost =
    hostObj.isSuperhost || hostObj.isSuperHost || hostObj.is_superhost || raw.isSuperhost || false;
  const responseRate =
    hostObj.responseRate || hostObj.response_rate
    || raw.responseRate || raw.response_rate || "N/A";

  // Location — try location object, locationSubtitle, locationTitle, address
  const locationObj = raw.location || {};
  const city =
    locationObj.city
    || raw.city
    || raw.address?.city
    // locationSubtitle often has "City, Country" format
    || raw.locationSubtitle?.split(",")[0]?.trim()
    || raw.locationTitle?.split(",")[0]?.trim()
    || "";
  const area =
    locationObj.area || locationObj.neighborhood
    || raw.neighborhood || raw.address?.neighborhood || "";
  const country =
    locationObj.country
    || raw.country
    || raw.address?.country
    || raw.locationSubtitle?.split(",").pop()?.trim()
    || raw.countryCode
    || "";

  // Price — may be a number, object, array of nightly prices, or string
  const priceAmount = extractPrice(raw);

  // Rating — may be nested in a rating object or top-level
  const ratingObj = raw.rating && typeof raw.rating === "object" ? raw.rating : null;
  const ratingValue = ratingObj
    ? (ratingObj.value || ratingObj.accuracy || ratingObj.overall || 0)
    : (raw.stars || raw.rating || raw.star_rating || raw.guestSatisfactionOverall || 0);

  // Review count — may be inside rating object as reviewsCount
  const reviewCount = ratingObj?.reviewsCount
    || ratingObj?.reviewCount
    || ratingObj?.numberOfReviews
    || raw.reviewsCount
    || raw.numberOfReviews
    || raw.reviews_count
    || raw.reviewCount
    || 0;

  // Room details — first try subDescription.items, then fall back to top-level fields
  const subDesc = parseSubDescription(raw);

  const guests = subDesc.guests
    || raw.numberOfGuests || raw.personCapacity || raw.guestCount || raw.person_capacity || 0;
  const bedrooms = subDesc.bedrooms
    || raw.bedrooms || raw.bedroomCount || raw.bedroom_count || 0;
  const beds = subDesc.beds
    || raw.beds || raw.bedCount || raw.bed_count || 0;
  const bathrooms = subDesc.bathrooms
    || raw.bathrooms || raw.bathroomCount || raw.bathroom_count || 0;

  return {
    url: raw.url || originalUrl,
    title: raw.name || raw.title || raw.detailTitle || "",
    description,
    photoCount: rawPhotos.length,
    photoCaptions,
    amenities,
    price: { amount: priceAmount, currency: "EUR", period: "notte" },
    rating: ratingValue,
    reviewCount,
    reviewSample,
    propertyType: raw.roomType || raw.propertyType || raw.room_type || "",
    location: { city, area, country },
    host: { name: hostName, superhost: isSuperhost, responseRate },
    guests,
    bedrooms,
    beds,
    bathrooms,
  };
}

// ---------------------------------------------------------------------------
// Price extraction — handles number, object, array, string, deep scan
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPrice(raw: any): number | null {
  // 1. Direct numeric field
  if (typeof raw.price === "number" && raw.price > 0) return raw.price;

  // 2. Price as object with known sub-fields
  if (raw.price && typeof raw.price === "object" && !Array.isArray(raw.price)) {
    const p = raw.price;
    const candidate = p.rate || p.amount || p.pricePerNight || p.basePrice || p.total;
    if (typeof candidate === "number" && candidate > 0) return candidate;
  }

  // 3. Price as array of nightly values → compute average
  if (Array.isArray(raw.price) && raw.price.length > 0) {
    const nums = raw.price
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((v: any) => (typeof v === "number" ? v : typeof v === "object" ? (v.rate || v.amount || v.price || 0) : 0))
      .filter((n: number) => n > 0);
    if (nums.length > 0) {
      return Math.round(nums.reduce((a: number, b: number) => a + b, 0) / nums.length);
    }
  }

  // 4. Known alternative field names
  const altFields = [
    raw.pricing?.rate?.amount,
    raw.pricing?.amount,
    raw.pricePerNight,
    raw.price_per_night,
    raw.priceRate,
    raw.price_rate,
    raw.basePrice,
    raw.nightlyPrice,
    raw.nightly_price,
  ];
  for (const val of altFields) {
    if (typeof val === "number" && val > 0) return val;
  }

  // 5. Price as string like "€85" or "$120 per night"
  const priceStr = raw.priceString || raw.price_string || raw.priceLabel || raw.price_label
    || (typeof raw.price === "string" ? raw.price : null);
  if (priceStr) {
    const num = parseFloat(String(priceStr).replace(/[^0-9.,]/g, "").replace(",", "."));
    if (!isNaN(num) && num > 0) return num;
  }

  // 6. Deep scan: look for any top-level key containing "price" with a numeric value
  for (const key of Object.keys(raw)) {
    if (key.toLowerCase().includes("price") && typeof raw[key] === "number" && raw[key] > 0) {
      return raw[key];
    }
  }

  // Nothing found
  return null;
}
