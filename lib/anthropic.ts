import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = "claude-sonnet-4-5-20250514";

// Create client on demand. The Anthropic SDK reads ANTHROPIC_API_KEY from
// process.env automatically, so we don't gate on the value here — if the
// key is genuinely missing at call-time the SDK will throw and our route-
// level try/catch will return a proper 500.
export function getAnthropic() {
  return new Anthropic();
}
