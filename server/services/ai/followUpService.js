import { queryOpenRouter } from "./openRouterService.js";

/**
 * Generates exactly 3-4 engaging and contextual search-related follow-up recommendations.
 */
export async function generateContextualFollowUps(query, answer) {
  let followUps = [];
  try {
    console.log("[FollowUp Service] Querying OpenRouter for contextual follow-up pathways...");
    
    const prompt = `Based on this search inquiry and synthesized result, generate exactly 4 relevant, helpful, and highly-contextual follow-up questions that the user might want to click next to explore more deeply. Keep each question short, engaging, and under 12 words. Return ONLY a valid JSON string array of 4 questions. Do NOT write any markdown wrapper of json, backticks, or extra text.

Query: ${query}
Answer: ${answer.slice(0, 400)}...`;

    const openRouterResponse = await queryOpenRouter(
      [{ role: "user", content: prompt }]
    );

    if (openRouterResponse) {
      let cleanedText = openRouterResponse.trim();
      if (cleanedText.startsWith("```")) {
        cleanedText = cleanedText
          .replace(/^```(?:json)?\n?/i, "")
          .replace(/\n?```$/, "")
          .trim();
      }
      followUps = JSON.parse(cleanedText);
    }
  } catch (e) {
    console.warn("[FollowUp Service] Question generation list bypassed. Utilizing defaults:", e.message);
    followUps = [
      `Could you elaborate more on the key details of ${query}?`,
      `What are the future developments or trends regarding this?`,
      `Are there any alternative viewpoints or controversies surrounding this?`,
      `How does this compare with traditional approaches?`
    ];
  }

  // Ensure compliance with the exact 3-4 follow-ups constraint
  if (followUps.length < 3) {
    followUps.push(`Can you show comparisons associated with ${query}?`);
  }
  
  return followUps.slice(0, 4);
}
