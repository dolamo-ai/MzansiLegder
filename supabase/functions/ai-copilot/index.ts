import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are CostPilot AI, a friendly financial copilot for small businesses.
You help analyze receipts, invoices, expenses, detect anomalies, identify duplicate transactions,
provide savings recommendations, and generate financial insights.

Keep answers concise, practical, and data-driven. Use short paragraphs and occasional bullet points.
When the user asks about specific figures, reference realistic small-business numbers.
You can discuss: expenses, VAT, budgets, duplicates, savings, cash flow, forecasts, and reports.
Always be helpful, clear, and professional. Never invent specific transaction IDs unless the user provides them.`;

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
    const messages = body?.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing 'messages' array in request body." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const payload = {
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
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
    const reply =
      data?.choices?.[0]?.message?.content ??
      "I'm sorry, I couldn't generate a response right now.";

    return new Response(
      JSON.stringify({ reply }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
