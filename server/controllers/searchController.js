import { searchWeb } from "../services/ai/tavilyService.js";
import { synthesizeResponse } from "../services/ai/openRouterService.js";
import { vectorizeAndStoreAnswer } from "../services/ai/vectorService.js";
import { generateContextualFollowUps } from "../services/ai/followUpService.js";

/**
 * Handles synthesized research searches.
 * 1. Executes web crawl via Tavily to retrieve top 10 relevant browser sources (unless Writing Mode is active).
 * 2. Compiles prompt state and queries the OpenRouter API completions engine.
 * 3. Generates 768-dimensional text embeddings in the background using gemini-embedding-2-preview model and saves using pgvector.
 * 4. Yields 3-4 interactive follow-up questions for dynamic UX journeys.
 */
export async function handleSearch(req, res) {
  const { query, history, mode, model } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Query parameters are required and must be a string." });
  }

  try {
    const currentMode = mode || "standard";
    const enableSearch = currentMode !== "writing";

    let citations = [];
    let searchQueries = [query];

    // Step 1: Execute Scrapes and Crawling via Tavily Service
    if (enableSearch) {
      try {
        const tavilyResult = await searchWeb(query);
        citations = tavilyResult.citations;
        searchQueries = tavilyResult.searchQueries;
      } catch (searchErr) {
        console.error("[Search Controller] Tavily search execution sequence failed:", searchErr.message);
        throw new Error(`Searching and web scraping failed: ${searchErr.message}`);
      }
    }

    // Step 2: OpenRouter Synthesis
    let answer = "";
    try {
      answer = await synthesizeResponse(query, currentMode, citations, history, model);
    } catch (orErr) {
      console.error("[Search Controller] OpenRouter completion sequence failed:", orErr.message);
      throw new Error(`Synthesis engine completion failed: ${orErr.message}`);
    }

    // Step 3: Run Vectorization in background (Does not block user search presentation)
    const messageId = `msg_${Date.now()}`;
    vectorizeAndStoreAnswer(query, answer, messageId).catch((vectorErr) => {
      console.warn("[Search Controller] Background vector storage was bypassed:", vectorErr.message);
    });

    // Step 4: Generate contextual smart follow-up suggestions (Exactly 3-4 items)
    const followUps = await generateContextualFollowUps(query, answer);

    // Return structured payload response
    return res.json({
      answer,
      searchQueries,
      citations,
      followUps,
    });
  } catch (err) {
    console.error("[Search Controller] Error triggered in research pipeline:", err);
    return res.status(500).json({ error: err.message || "An unexpected error occurred during synthesis." });
  }
}
