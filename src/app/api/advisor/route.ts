import { NextRequest } from "next/server";
import Groq from "groq-sdk";

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY ?? "" });
}

const SYSTEM_PROMPT = `You are a sharp, practical financial advisor embedded in KnowYourRate — a tool that helps workers understand their true earning power. Your job is to give concise, specific insights about salary vs contractor comparisons, effective tax rates, hourly rates, and compensation strategy.

Rules:
- Always reference the user's specific numbers when context is provided
- Keep responses under 160 words
- Be direct — no hedging, no "it depends on many factors" non-answers
- Flag one concrete action the user can take
- Never recommend a specific tax professional or broker by name
- End with a one-line summary starting with "Bottom line:"`;

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return new Response("Question is required", { status: 400 });
    }

    const contextBlock = context
      ? `\n\nUser's current calculation data:\n${JSON.stringify(context, null, 2)}`
      : "";

    const groq = getGroq();
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `${question.trim()}${contextBlock}` },
      ],
      stream: true,
      max_tokens: 320,
      temperature: 0.5,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("[advisor]", err);
    return new Response("AI advisor unavailable. Check your GROQ_API_KEY.", {
      status: 500,
    });
  }
}
