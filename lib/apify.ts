// Apify API v2 requires tilde notation for actor IDs (not slash)
const ACTOR_ID = "tri_angle~airbnb-scraper";

interface ApifyRunResponse {
  data: {
    id: string;
    defaultDatasetId: string;
    status: string;
  };
}

export async function scrapeAirbnbListing(url: string) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    console.error("APIFY_API_TOKEN is not set, skipping scrape");
    return null;
  }

  const startUrl = `https://api.apify.com/v2/acts/${ACTOR_ID}/runs`;
  const response = await fetch(startUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      startUrls: [{ url }],
      maxListings: 1,
      includeReviews: true,
      maxReviews: 10,
      currency: "EUR",
      addMoreHostInfo: true,
      calendarMonths: 0,
      proxyConfiguration: { useApifyProxy: true },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`Apify start run failed [${response.status}]: ${errorBody}`);
    throw new Error(`Failed to start Apify scraper: ${response.status} - ${errorBody}`);
  }

  const run: ApifyRunResponse = await response.json();
  const datasetId = run.data.defaultDatasetId;

  // Wait for the run to finish (polling)
  let status = run.data.status;
  while (status === "RUNNING" || status === "READY") {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${run.data.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!statusRes.ok) {
      const pollErr = await statusRes.text();
      console.error(`Apify poll status failed [${statusRes.status}]: ${pollErr}`);
      throw new Error(`Failed to poll Apify run status: ${statusRes.status}`);
    }
    const statusData = await statusRes.json();
    status = statusData.data.status;
  }

  if (status !== "SUCCEEDED") {
    console.error(`Apify run finished with status: ${status}`);
    throw new Error(`Apify scraper run failed with status: ${status}`);
  }

  // Fetch results
  const datasetRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!datasetRes.ok) {
    const dsErr = await datasetRes.text();
    console.error(`Apify dataset fetch failed [${datasetRes.status}]: ${dsErr}`);
    throw new Error(`Failed to fetch Apify dataset: ${datasetRes.status}`);
  }
  const items = await datasetRes.json();

  return items[0] || null;
}
