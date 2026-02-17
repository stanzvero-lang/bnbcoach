import { type ListingData } from "./mock-listing";

// Fetch an Airbnb listing page and extract data from embedded JSON-LD
// and meta tags. No external API dependencies required.
export async function scrapeAirbnbListing(url: string): Promise<ListingData | null> {
  const html = await fetchListingHTML(url);
  if (!html) return null;

  const jsonLd = extractJsonLd(html);
  const meta = extractMetaTags(html);
  const extraData = extractInlineData(html);

  if (!jsonLd && !meta.title) {
    console.error("Scraper: no JSON-LD or meta data found in page");
    return null;
  }

  // JSON-LD for Airbnb listings uses schema.org types:
  // @type: "Product", "LodgingBusiness", "SingleFamilyResidence", "Accommodation", etc.
  // Fields: name, description, image, aggregateRating, address, etc.
  const images: string[] = jsonLd?.image
    ? (Array.isArray(jsonLd.image) ? jsonLd.image : [jsonLd.image])
    : [];

  const rating = jsonLd?.aggregateRating;

  return {
    url,
    title: jsonLd?.name || meta.title || "",
    description: jsonLd?.description || meta.description || "",
    photoCount: images.length || extraData.photoCount || 0,
    photoCaptions: images.map(() => ""), // JSON-LD doesn't include captions
    amenities: extraData.amenities || [],
    price: {
      amount: extractPrice(jsonLd, meta) || 0,
      currency: "EUR",
      period: "notte",
    },
    rating: rating?.ratingValue ? parseFloat(rating.ratingValue) : 0,
    reviewCount: rating?.reviewCount ? parseInt(rating.reviewCount, 10) : 0,
    reviewSample: [], // Reviews not available from HTML scrape
    propertyType: jsonLd?.["@type"] || extraData.propertyType || "",
    location: {
      city: jsonLd?.address?.addressLocality || extraData.city || "",
      area: jsonLd?.address?.addressRegion || "",
      country: jsonLd?.address?.addressCountry || "Italia",
    },
    host: {
      name: extraData.hostName || "",
      superhost: extraData.isSuperhost || false,
      responseRate: "N/A",
    },
    guests: extraData.guests || 0,
    bedrooms: extraData.bedrooms || 0,
    beds: extraData.beds || 0,
    bathrooms: extraData.bathrooms || 0,
  };
}

async function fetchListingHTML(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      console.error(`Scraper fetch failed [${response.status}] for ${url}`);
      return null;
    }

    return await response.text();
  } catch (err) {
    console.error("Scraper fetch error:", err);
    return null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractJsonLd(html: string): any | null {
  // Match all JSON-LD script blocks
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      // Airbnb may embed an array or a single object
      const obj = Array.isArray(data) ? data[0] : data;
      // Accept any schema.org type that looks like a listing
      if (obj?.name || obj?.description) {
        return obj;
      }
    } catch {
      // Malformed JSON-LD block, try next one
    }
  }
  return null;
}

function extractMetaTags(html: string): { title: string; description: string; price: string } {
  const getContent = (nameOrProp: string): string => {
    const re = new RegExp(
      `<meta[^>]*(?:name|property)=["']${nameOrProp}["'][^>]*content=["']([^"']*)["']`,
      "i"
    );
    const m = html.match(re);
    if (m) return m[1];
    // Also try reversed attribute order: content before name/property
    const re2 = new RegExp(
      `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${nameOrProp}["']`,
      "i"
    );
    const m2 = html.match(re2);
    return m2 ? m2[1] : "";
  };

  return {
    title: getContent("og:title") || getContent("twitter:title") || extractHtmlTitle(html),
    description: getContent("og:description") || getContent("description") || "",
    price: getContent("og:price:amount") || "",
  };
}

function extractHtmlTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim() : "";
}

interface InlineData {
  amenities: string[];
  propertyType: string;
  city: string;
  hostName: string;
  isSuperhost: boolean;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  photoCount: number;
}

function extractInlineData(html: string): InlineData {
  const result: InlineData = {
    amenities: [],
    propertyType: "",
    city: "",
    hostName: "",
    isSuperhost: false,
    guests: 0,
    bedrooms: 0,
    beds: 0,
    bathrooms: 0,
    photoCount: 0,
  };

  // Airbnb pages embed a large JSON blob in a <script> tag with data-deferred-state
  // or inside __NEXT_DATA__ or in a bootstrapData/redux-like structure.
  // Try to extract key data from these inline scripts.
  try {
    // Count photo URLs (Airbnb uses a.muscache.com or images from their CDN)
    const photoMatches = html.match(/https:\/\/a0\.muscache\.com\/im\/pictures\/[^"'\s]+/g);
    if (photoMatches) {
      // Deduplicate
      result.photoCount = new Set(photoMatches).size;
    }

    // Try extracting structured data from Airbnb's internal state
    // Pattern: "pdp_listing_detail" or "listingTitle" etc. in embedded JSON
    const superhostMatch = html.match(/[Ss]uperhost|superhost":true/);
    if (superhostMatch) result.isSuperhost = true;

    // Extract capacity numbers from text like "4 ospiti · 2 camere · 2 letti · 1 bagno"
    // or English "4 guests · 2 bedrooms · 2 beds · 1 bath"
    const capacityMatch = html.match(
      /(\d+)\s*(?:ospiti|guests?)[\s·]+(\d+)\s*(?:camer[ae]|bedrooms?)[\s·]+(\d+)\s*(?:lett[io]|beds?)[\s·]+(\d+)\s*(?:bagn[io]|bath)/i
    );
    if (capacityMatch) {
      result.guests = parseInt(capacityMatch[1], 10);
      result.bedrooms = parseInt(capacityMatch[2], 10);
      result.beds = parseInt(capacityMatch[3], 10);
      result.bathrooms = parseInt(capacityMatch[4], 10);
    }

    // Try to find host name: "Hosted by <Name>" or "Host: <Name>"
    const hostMatch = html.match(
      /(?:Hosted by|Ospitato da|Host[:\s]+)[\s]*([A-ZÀ-Ú][a-zà-ú]+)/
    );
    if (hostMatch) result.hostName = hostMatch[1];

    // Try to extract amenities from the page
    // Airbnb lists amenities as text items, often in a section
    const amenityPatterns = [
      /aria-label="([^"]+)"\s*class="[^"]*amenity/gi,
      /"amenity[^"]*"[^>]*>([^<]+)</gi,
    ];
    for (const pattern of amenityPatterns) {
      let am;
      while ((am = pattern.exec(html)) !== null) {
        if (am[1] && am[1].length < 50) {
          result.amenities.push(am[1].trim());
        }
      }
    }
  } catch (err) {
    console.error("Scraper inline data extraction error:", err);
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPrice(jsonLd: any, meta: { price: string }): number {
  // Try JSON-LD offers
  if (jsonLd?.offers?.price) {
    return parseFloat(jsonLd.offers.price);
  }
  if (jsonLd?.offers?.lowPrice) {
    return parseFloat(jsonLd.offers.lowPrice);
  }
  // Try og:price:amount meta tag
  if (meta.price) {
    return parseFloat(meta.price);
  }
  return 0;
}
