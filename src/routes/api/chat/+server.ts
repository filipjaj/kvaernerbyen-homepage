// src/routes/api/chat/+server.ts
import { toolset } from "$lib/ai/tools/parking-tool";
import {
  convertToModelMessages,
  streamText,
  stepCountIs,
  type UIMessage,
} from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { GEMINI_API_KEY } from "$env/static/private";

const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY });

export async function POST({ request }) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    tools: toolset,
    messages: convertToModelMessages([
      {
        role: "system",
        parts: [
          {
            type: "text",
            text: [
              // Persona
              "You are ParkingBot for Kværnerbyen (Oslo).",
              // Inputs & defaults
              "Do not ask for missing inputs. Default to: vehicle=standard, durationMinutes=60, startISO=now.",
              // Time handling
              "If the last user message includes a literal 'current time: <ISO>' string, prefer that as startISO; otherwise omit startISO (the tool uses now).",
              // Destination handling
              "If the user gives a destination (coords or address/landmark), pass destination to tools. If it's an address/landmark, first call getGeolocation to resolve lat/lng.",
              // Promotions
              'If the user mentions Kiwi supermarket, first call confirmPromo. If confirmed, include "kiwi" in eligiblePromotions when calling rankParking.',
              // Tool calling
              "When calling rankParking, pass parsed values and a limit (e.g., 5).",
              // Output format
              "Reply with a compact table: name · price (NOK) · walk (minutes), followed by a one-sentence summary mentioning any applied promotions.",
            ].join(" "),
          },
        ],
      },

      ...messages,
    ]),
    // Let the model do a few steps: (e.g., confirmPromo -> rankParking -> summarize)
    stopWhen: stepCountIs(5),
  });

  return result.toUIMessageStreamResponse();
}
