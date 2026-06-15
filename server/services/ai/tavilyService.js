/**
 * Searches the web using Tavily API to retrieve and scrape relevant documentation.
 * Retrieves up to 10 highly-grounded results to power synthesized completions.
 */
export async function searchWeb(query) {
  const tavilyApiKey = process.env.TAVILY_API_KEY;
  
  if (!tavilyApiKey) {
    console.warn("[Tavily Service] TAVILY_API_KEY is missing.");
    throw new Error("We are having problems retrieving search results. Please try again in a few moments.");
  }

  console.log(`[Tavily Service] Querying Tavily for: "${query}" (requesting max 10 results)...`);
  
  try {
    const tavilyResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: query,
        search_depth: "advanced",
        max_results: 10,
      }),
    });

    if (!tavilyResponse.ok) {
      const errText = await tavilyResponse.text();
      console.warn(`[Tavily Service] Tavily API returned error status ${tavilyResponse.status}: ${errText}.`);
      throw new Error("We are having problems retrieving search results. Please try again in a few moments.");
    }

    const tavilyData = await tavilyResponse.json();
    const results = tavilyData.results || [];
    
    const citations = results.slice(0, 10).map((r, idx) => ({
      id: idx + 1,
      title: r.title || "Web Source Info",
      url: r.url || "#",
      snippet: r.content || "",
    }));

    const searchQueries = tavilyData.query ? [tavilyData.query] : [query];
    console.log(`[Tavily Service] Successfully scraped and calibrated ${citations.length} search results from Tavily.`);
    
    return {
      citations,
      searchQueries,
    };
  } catch (searchErr) {
    console.error("[Tavily Service] Search execution failed:", searchErr.message);
    throw new Error("We are having problems retrieving search results. Please try again in a few moments.");
  }
}
