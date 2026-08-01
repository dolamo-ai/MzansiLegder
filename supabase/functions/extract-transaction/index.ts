import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

// Challenge 04 — Micro-Business Financial Workflow Assistant
// Structured output schema for the AI extraction step.
const SYSTEM_PROMPT = `You are Mzansi Ledger AI, a financial workflow assistant for South African micro-businesses.
Your job: take raw, unstructured financial text (a receipt, invoice, SMS, email, or CSV paste) and extract it into a structured JSON object.

You MUST respond with ONLY a valid JSON object (no markdown, no explanation) matching this schema exactly:

{
  "validation_status": "clean" | "requires_review" | "rejected",
  "result": {
    "merchant": string,
    "date": string (YYYY-MM-DD, best guess from text),
    "total": number (the full amount, ZAR),
    "vat_amount": number (15% of total if VAT applies, else 0),
    "category": one of ["Office Supplies","Software","Marketing","Travel","Utilities","Rent","Payroll","Hardware","Legal","Other"]
  },
  "issues": string[] (list any problems: missing fields, ambiguous amounts, suspicious values, possible duplicates, etc.),
  "reasoning_summary": string (one sentence explaining your extraction),
  "confidence": "high" | "medium" | "low",
  "human_approval_required": boolean (true if validation_status is requires_review or rejected)
}

Rules:
- Currency is South African Rand (ZAR / R). Convert if the input is in another currency (approximate).
- VAT in South Africa is 15%. If the amount looks VAT-inclusive, compute vat_amount = total - (total / 1.15). If VAT-exclusive, vat_amount = total * 0.15.
- If the text is gibberish, empty, or not financial, set validation_status to "rejected" with an issue explaining why.
- Always output valid JSON only. No prose.`;

async function getGroqKey(): Promise<string> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) return "";
  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase
    .from("app_config")
    .select("value")
    .eq("id", "GROQ_API_KEY")
    .maybeSingle();
  if (error || !data) return "";
  return data.value ?? "";
}

function safeParseJSON(text: string): unknown | null {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find the first { ... } block
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const groqKey = await getGroqKey();
    if (!groqKey) {
      return new Response(
        JSON.stringify({ error: "Groq API key is not configured." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json();
    const inputText = body?.inputText;
    if (!inputText || typeof inputText !== "string" || inputText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing 'inputText' string in request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = {
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Extract and structure this financial text:\n\n${inputText}` },
      ],
    };

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return new Response(
        JSON.stringify({ error: `Groq API error (${groqRes.status}): ${errText}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await groqRes.json();
    const rawContent: string = data?.choices?.[0]?.message?.content ?? "";
    const parsed = safeParseJSON(rawContent);

    if (!parsed || typeof parsed !== "object") {
      return new Response(
        JSON.stringify({
          error: "AI returned unparseable output.",
          raw: rawContent,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ analysis: parsed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
