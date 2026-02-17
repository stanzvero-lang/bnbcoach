import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = "claude-sonnet-4-5-20250514";

// Lazy initialization - only create the client when actually used
export function getAnthropic() {
  if (!process.env.ANTHROPIC_API_KEY) {
    return null;
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}
