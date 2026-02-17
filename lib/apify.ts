const ACTOR_ID = "dtrungtin/airbnb-scraper";

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
    return null;
  }

  const response = await fetch(
    `https://api.apify.com/v2/acts/${ACTOR_ID}/runs?token=${token}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: [{ url }],
        maxListings: 1,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to start Apify scraper");
  }

  const run: ApifyRunResponse = await response.json();
  const datasetId = run.data.defaultDatasetId;

  // Wait for the run to finish (polling)
  let status = run.data.status;
  while (status === "RUNNING" || status === "READY") {
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${run.data.id}?token=${token}`
    );
    const statusData = await statusRes.json();
    status = statusData.data.status;
  }

  // Fetch results
  const datasetRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items?token=${token}`
  );
  const items = await datasetRes.json();

  return items[0] || null;
}
