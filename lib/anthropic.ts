import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = "claude-sonnet-4-5-20250514";

// Create client on demand.  We pass the key explicitly because Next.js
// only makes env vars available at runtime when it sees a direct
// `process.env.VARIABLE` reference in *our* code.  The SDK's internal
// `process.env['ANTHROPIC_API_KEY']` (bracket notation) is not inlined
// by the Next.js bundler, which causes the "Could not resolve
// authentication method" error on Vercel.
export function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}
