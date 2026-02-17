import { type ListingData } from "./mock-listing";

// Public API key used by Airbnb's own frontend
const AIRBNB_API_KEY = "d306zoyjsyarp7ifhu67rjxn52tv0t20";

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

/**
 * Scrape an Airbnb listing by room ID extracted from the URL.
 *
 * Strategy:
 * 1. Fetch the listing HTML page and parse the embedded deferred state JSON
 *    (this contains the full PDP sections API response pre-rendered by Airbnb SSR)
 * 2. Fallback: call the v2 REST API endpoint /api/v2/pdp_listing_details
 */
export async function scrapeAirbnbListing(url: string): Promise<ListingData | null> {
  const roomId = extractRoomId(url);
  if (!roomId) {
    console.error("Scraper: could not extract room ID from URL:", url);
    return null;
  }

  // Strategy 1: fetch HTML and parse deferred state
  const htmlData = await scrapeFromHTML(roomId);
  if (htmlData) return htmlData;

  // Strategy 2: v2 REST API
  const apiData = await scrapeFromV2Api(roomId);
  if (apiData) return apiData;

  console.error("Scraper: all strategies failed for room", roomId);
  return null;
}

/**
 * Extract the numeric room ID from various Airbnb URL formats:
 * - https://www.airbnb.com/rooms/12345678
 * - https://www.airbnb.it/rooms/12345678?check_in=...
 * - https://airbnb.com/rooms/12345678/...
 * - https://www.airbnb.co.uk/rooms/plus/12345678
 */
export function extractRoomId(url: string): string | null {
  const match = url.match(/airbnb\.[a-z.]+\/rooms\/(?:plus\/)?(\d+)/);
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Strategy 1: Parse deferred state from listing HTML
// ---------------------------------------------------------------------------

async function scrapeFromHTML(roomId: string): Promise<ListingData | null> {
  try {
    const listingUrl = `https://www.airbnb.com/rooms/${roomId}`;
    const response = await fetch(listingUrl, {
      headers: BROWSER_HEADERS,
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Scraper HTML fetch failed [${response.status}] for room ${roomId}`);
      return null;
    }

    const html = await response.text();

    // Airbnb embeds the full PDP data in a <script id="data-deferred-state-0"> tag
    // containing a JSON blob with niobeClientData -> the StaysPdpSections response.
    const deferredMatch = html.match(
      /<script\s+id="data-deferred-state-0"[^>]*>([\s\S]*?)<\/script>/
    );

    if (!deferredMatch) {
      console.error("Scraper: no deferred state found in HTML");
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let deferred: any;
    try {
      deferred = JSON.parse(deferredMatch[1]);
    } catch {
      console.error("Scraper: failed to parse deferred state JSON");
      return null;
    }

    return parseDeferredState(deferred, roomId);
  } catch (err) {
    console.error("Scraper HTML strategy error:", err);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDeferredState(deferred: any, roomId: string): ListingData | null {
  try {
    // Navigate to the sections data. The structure is:
    // niobeMinimalClientData -> [array of [key, value]] pairs
    // One of them contains the StaysPdpSections response.
    const clientData =
      deferred?.niobeMinimalClientData || deferred?.niobeClientData;
    if (!Array.isArray(clientData)) {
      console.error("Scraper: no niobeClientData found in deferred state");
      return null;
    }

    // Find the PDP entry - it's an array of [queryKey, responseData] pairs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pdpData: any = null;
    for (const entry of clientData) {
      if (!Array.isArray(entry) || entry.length < 2) continue;
      const key = typeof entry[0] === "string" ? entry[0] : JSON.stringify(entry[0]);
      if (key.includes("StaysPdpSections") || key.includes("PdpPlatformSections")) {
        pdpData = entry[1];
        break;
      }
    }

    if (!pdpData) {
      console.error("Scraper: no StaysPdpSections data in niobeClientData");
      return null;
    }

    // Navigate to sections
    const presentation = pdpData?.data?.presentation;
    const stayPage =
      presentation?.stayProductDetailPage || presentation?.stayProductDetailPageV2;
    const sectionsContainer = stayPage?.sections;

    if (!sectionsContainer) {
      console.error("Scraper: no sections container found");
      return null;
    }

    // Extract metadata (rating, review count, capacity, etc.)
    const metadata = sectionsContainer?.metadata;
    const logging = metadata?.loggingContext?.eventDataLogging;
    const sbuiSections =
      sectionsContainer?.sbuiData?.sectionConfiguration?.root?.sections || [];
    const sections = sectionsContainer?.sections || [];

    // Extract data from typed sections
    let title = "";
    let description = "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const photos: { url: string; caption: string }[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const amenities: string[] = [];
    let hostName = "";
    let isSuperhost = false;
    let roomType = "";
    let guests = 0;
    let bedrooms = 0;
    let beds = 0;
    let bathrooms = 0;

    // Parse SBUI sections (overview with capacity)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const s of sbuiSections) {
      const data = s?.sectionData || s?.section;
      if (!data?.__typename) continue;

      if (data.__typename === "PdpOverviewV2Section" || data.__typename.includes("Overview")) {
        roomType = data.title || "";
        // overviewItems: [{title: "2 guests"}, {title: "1 bedroom"}, ...]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const item of data.overviewItems || []) {
          const t = item.title || "";
          const num = parseInt(t, 10);
          if (isNaN(num)) continue;
          const lower = t.toLowerCase();
          if (lower.includes("guest") || lower.includes("ospit")) guests = num;
          else if (lower.includes("bedroom") || lower.includes("camer")) bedrooms = num;
          else if (lower.includes("bed") || lower.includes("lett")) beds = num;
          else if (lower.includes("bath") || lower.includes("bagn")) bathrooms = num;
        }
      }
    }

    // Parse main sections
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const s of sections) {
      const section = s?.section;
      if (!section?.__typename) continue;

      switch (section.__typename) {
        case "PdpTitleSection":
          title = section.title || "";
          break;

        case "PdpDescriptionSection": {
          const htmlDesc =
            section.htmlDescription?.htmlText || section.description || "";
          // Strip HTML tags
          description = htmlDesc.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
          break;
        }

        case "PhotoTourModalSection":
        case "PdpPhotoTourSection":
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const item of section.mediaItems || []) {
            if (item.baseUrl || item.imageUrl) {
              photos.push({
                url: item.baseUrl || item.imageUrl || "",
                caption: item.accessibilityLabel || item.caption || "",
              });
            }
          }
          break;

        case "AmenitiesSection":
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const group of section.seeAllAmenitiesGroups || []) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const a of group.amenities || []) {
              if (a.available !== false && a.title) {
                amenities.push(a.title);
              }
            }
          }
          break;

        case "HostProfileSection":
          hostName = (section.title || "").replace(/^(Hosted by|Ospitato da)\s*/i, "");
          if (section.hostProfileDescription?.htmlText?.toLowerCase().includes("superhost")) {
            isSuperhost = true;
          }
          break;

        case "PdpHighlightsSection":
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          for (const h of section.highlights || []) {
            if (h.title?.toLowerCase().includes("superhost")) {
              isSuperhost = true;
            }
          }
          break;
      }
    }

    // Use metadata logging as fallback/enrichment
    if (logging) {
      if (!guests && logging.personCapacity) guests = logging.personCapacity;
      if (!isSuperhost && logging.isSuperhost) isSuperhost = true;
      if (!roomType && logging.roomType) roomType = logging.roomType;
    }

    // Extract price from metadata
    let priceAmount = 0;
    const bookingData = metadata?.bookingPrefetchData;
    if (bookingData?.p3_display_rate?.amount) {
      priceAmount = bookingData.p3_display_rate.amount;
    } else if (bookingData?.p3DisplayRate?.amount) {
      priceAmount = bookingData.p3DisplayRate.amount;
    }
    // Also try to find price in sections (BOOK_IT_SIDEBAR)
    if (!priceAmount) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const s of sections) {
        const section = s?.section;
        const priceStr = section?.structuredDisplayPrice?.primaryLine?.price;
        if (priceStr) {
          const num = parseFloat(priceStr.replace(/[^0-9.,]/g, "").replace(",", "."));
          if (!isNaN(num)) {
            priceAmount = num;
            break;
          }
        }
      }
    }

    const ratingValue = logging?.guestSatisfactionOverall || 0;
    const reviewCount = logging?.visibleReviewCount
      ? parseInt(String(logging.visibleReviewCount), 10)
      : 0;

    // Extract reviews from ReviewsSection if present
    const reviewSample: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const s of sections) {
      const section = s?.section;
      if (
        section?.__typename === "ReviewsSection" ||
        section?.__typename === "PdpReviewsSection"
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const r of section.reviews || []) {
          const text = r.comments || r.reviewText || r.comment || "";
          if (text && reviewSample.length < 4) {
            reviewSample.push(text.replace(/<[^>]+>/g, " ").trim());
          }
        }
      }
    }

    // Extract location
    const locationTitle = logging?.locationTitle || "";
    const locationParts = locationTitle.split(",").map((s: string) => s.trim());

    const url = `https://www.airbnb.com/rooms/${roomId}`;

    return {
      url,
      title,
      description,
      photoCount: photos.length,
      photoCaptions: photos.map((p) => p.caption),
      amenities,
      price: { amount: priceAmount, currency: "EUR", period: "notte" },
      rating: ratingValue,
      reviewCount,
      reviewSample,
      propertyType: roomType,
      location: {
        city: locationParts[1] || locationParts[0] || "",
        area: locationParts[0] || "",
        country: locationParts[locationParts.length - 1] || "Italia",
      },
      host: { name: hostName, superhost: isSuperhost, responseRate: "N/A" },
      guests,
      bedrooms,
      beds,
      bathrooms,
    };
  } catch (err) {
    console.error("Scraper: error parsing deferred state:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Strategy 2: Airbnb v2 REST API (fallback)
// ---------------------------------------------------------------------------

async function scrapeFromV2Api(roomId: string): Promise<ListingData | null> {
  try {
    const apiUrl =
      `https://www.airbnb.com/api/v2/pdp_listing_details/${roomId}` +
      `?adults=1&_format=for_rooms_show&key=${AIRBNB_API_KEY}` +
      `&locale=it&currency=EUR`;

    const response = await fetch(apiUrl, {
      headers: {
        ...BROWSER_HEADERS,
        "X-Airbnb-Api-Key": AIRBNB_API_KEY,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`Scraper v2 API failed [${response.status}]:`, body.slice(0, 500));
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await response.json();
    const listing = json?.pdp_listing_detail || json?.listing;

    if (!listing) {
      console.error("Scraper v2: no listing data in response");
      return null;
    }

    // Photos
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const photos = (listing.photos || []).map((p: any) => ({
      url: p.large || p.medium || p.small || p.picture || "",
      caption: p.caption || "",
    }));

    // Description: sectioned or flat
    const desc = listing.sectioned_description;
    const description = [
      desc?.description || listing.description || "",
      desc?.space || "",
      desc?.neighborhood_overview || "",
      desc?.transit || "",
    ]
      .filter(Boolean)
      .join("\n\n");

    // Amenities
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const amenities: string[] = (listing.listing_amenities || listing.amenities || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (a: any) => (typeof a === "string" ? a : a.name || a.tag || "")
    ).filter(Boolean);

    // Reviews
    const reviewSample: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const r of (listing.sorted_reviews || listing.reviews || []).slice(0, 4)) {
      const text = r.comments || r.review || "";
      if (text) reviewSample.push(text);
    }

    const url = `https://www.airbnb.com/rooms/${roomId}`;
    const host = listing.primary_host || listing.user || listing.host || {};

    return {
      url,
      title: listing.name || listing.title || "",
      description,
      photoCount: photos.length,
      photoCaptions: photos.map((p: { caption: string }) => p.caption),
      amenities,
      price: {
        amount: listing.price?.rate?.amount || listing.price_rate || listing.price || 0,
        currency: "EUR",
        period: "notte",
      },
      rating: listing.star_rating || listing.review_rating || listing.overall_rating || 0,
      reviewCount: listing.review_count || listing.reviews_count || listing.visible_review_count || 0,
      reviewSample,
      propertyType: listing.room_type || listing.property_type || listing.room_type_category || "",
      location: {
        city: listing.city || listing.localized_city || "",
        area: listing.neighborhood || listing.public_address || "",
        country: listing.country || "Italia",
      },
      host: {
        name: host.host_name || host.first_name || host.name || "",
        superhost: host.is_superhost || false,
        responseRate: host.response_rate_without_na || host.response_rate || "N/A",
      },
      guests: listing.person_capacity || listing.guest_count || 0,
      bedrooms: listing.bedrooms || listing.bedroom_count || 0,
      beds: listing.beds || listing.bed_count || 0,
      bathrooms: listing.bathrooms || listing.bathroom_count || 0,
    };
  } catch (err) {
    console.error("Scraper v2 API strategy error:", err);
    return null;
  }
}
