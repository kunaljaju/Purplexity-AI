/**
 * Gets customized system guidelines based on requested search flow modes.
 */
export function getSystemInstruction(mode) {
  const baseInstruction = "You are Purplexity, an elegant, fast, and factual real-time search synthesis engine. Provide structured, precise answers formatted in beautiful, readable Markdown. Cite referenced facts or statistics directly using standard citation numbers (e.g. [1], [2], etc.) that correspond precisely to the retrieved search sources listed at the start of your user prompt. Keep descriptions objective, straightforward and concise. IMPORTANT: Whenever comparing multiple entities, products, pricing tiers, capabilities, parameters, or presenting structured statistical benchmarks, you MUST construct a standard Markdown table with pipe separators (e.g. '| Column 1 | Column 2 |' followed by a separator line '|---|---|' and value rows). Do NOT include any internal database keys, server metadata, database vector indices, or technical IDs in your response.";
  
  switch (mode) {
    case "writing":
      return "You are an expert creative and technical writing companion. Provide elegant, rich, beautifully structured, and comprehensive prose. Since you are in local writing assistant mode, do NOT search the web or provide citations. Simply respond with high artistic and factual depth using standard knowledge. Whenever displaying comparisons or matrices, use Markdown tables to structure the text beautifully. Do NOT include any database keys, internal IDs, or technical metadata in your response.";
    case "academic":
      return "You are an elite academic literature synthesizer. Focus on authoritative citations, factual objectivity, scientific rigour, and dense analytical details. Cite peer-reviewed articles, statistics, and verifiable sources. Always structure answers with clear subheadings, key takeaways, and list relevant citations precisely using [1], [2], and [3] mapped to the context provided. When presenting comparisons, data charts, variables, or comparative findings, arrange them inside standard Markdown tables. Do NOT include any database keys, internal IDs, or technical metadata in your response.";
    case "copilot":
      return "You are an advanced investigative copilot. Conduct a deep research sweep of the topic. Synthesize information by breaking down multiple perspectives, including potential biases, historical context, key players, current trends, and pros/cons. Provide a structured, multi-dimensional bento-style report. Utilize standard Markdown tables extensively when presenting metrics, side-by-side feature columns, or comparison factors. Do NOT include any database keys, internal IDs, or technical metadata in your response.";
    default:
      return baseInstruction;
  }
}

/**
 * Generic helper to query the OpenRouter API.
 */
export async function queryOpenRouter(messages, model, responseFormat) {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  if (!openRouterApiKey) {
    throw new Error("We are experiencing search synthesis connectivity issues. Please try again in a few moments.");
  }

  const modelToUse = model || "google/gemini-2.5-flash";
  const candidates = [modelToUse];
  if (modelToUse.includes("claude-sonnet") || modelToUse.includes("claude-3.5-sonnet")) {
    candidates.push("anthropic/claude-sonnet-4.6");
    candidates.push("anthropic/claude-sonnet-4.5");
    candidates.push("anthropic/claude-3.5-sonnet");
  }

  let lastErrorText = "";
  for (const candidateModel of candidates) {
    console.log(
      `[OpenRouter Service] Attempting request via model: ${candidateModel} with ${messages.length} message units...`
    );

    try {
      const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.APP_URL || "https://ai.studio/build",
          "X-Title": "Purplexity Search Synthesis",
        },
        body: JSON.stringify({
          model: candidateModel,
          messages,
          temperature: 0.3,
          max_tokens: 4096,
          response_format: responseFormat,
        }),
      });

      if (orResponse.ok) {
        const orData = await orResponse.json();
        const answer = orData.choices?.[0]?.message?.content || "";
        console.log(`[OpenRouter Service] Response successfully retrieved from OpenRouter API using ${candidateModel}.`);
        return answer;
      } else {
        lastErrorText = await orResponse.text();
        console.warn(`[OpenRouter Service] OpenRouter responded with error for ${candidateModel}: ${lastErrorText}`);
      }
    } catch (orErr) {
      lastErrorText = orErr.message;
      console.warn(`[OpenRouter Service] API completion sequence failed for ${candidateModel}: ${orErr.message}`);
    }
  }

  throw new Error(`We are experiencing search synthesis connectivity issues. Please try again in a few moments.`);
}

/**
 * Executes a synthesis request against OpenRouter chat completion endpoints.
 * Integrates scraped grounded citations and historic question/answer turns.
 */
export async function synthesizeResponse(
  query,
  mode,
  citations,
  history = [],
  model
) {
  // Define focus-mode system instructions
  const systemInstruction = getSystemInstruction(mode);

  // Assemble the grounded document prompt context
  let promptToSend = query;
  if (mode !== "writing" && citations.length > 0) {
    const formattedContext = citations
      .map(
        (c) =>
          `Source [${c.id}]:\nTitle: ${c.title}\nURL: ${c.url}\nContent: ${c.snippet}\n`
      )
      .join("\n");
      
    promptToSend = `Below is the scraped search data containing the top 10 relevant browser links and pages retrieved from Tavily:\n\n${formattedContext}\n\nUser Question: ${query}\n\nPlease synthesize a balanced, factual and comprehensive answer referring to the sources above. Combine the search results with the previous conversation history to ensure context continuity if the user is asking a follow-up question. Highlight facts and back up statements with references pointing directly to their source indicators (e.g. use [1], [2], etc. matching the index of the source listed above). Do NOT mention any internal database keys, server metadata, database vector indices, or technical IDs in your response. Keep citations clean (e.g., [1], [2]).`;
  } else if (history && history.length > 0) {
    promptToSend = `${query}\n\nPlease answer the user's question, ensuring context continuity from the previous conversation history. Do NOT mention any internal database keys, server metadata, database vector indices, or technical IDs in your response.`;
  }

  const messages = [
    { role: "system", content: systemInstruction },
  ];

  // Map and append user/assistant conversation history
  if (history && Array.isArray(history)) {
    history.forEach((msg) => {
      messages.push({
        role: msg.role === "assistant" ? "assistant" : "user",
        content: msg.content,
      });
    });
  }

  // Push the final user instruction
  messages.push({
    role: "user",
    content: promptToSend,
  });

  return await queryOpenRouter(messages, model);
}
