// Vercel serverless function. Deployed automatically at /api/ai-assist.
// Keeps your Anthropic API key on the server — it is never sent to the browser.
// Optional: the app works fully without this; only the "AI Quotation Assistant"
// button needs it. To enable it, add an ANTHROPIC_API_KEY environment variable
// in your Vercel project settings (Project -> Settings -> Environment Variables),
// get a key from https://console.anthropic.com, then redeploy.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(501).json({
      error: "AI assistant is not configured on this deployment yet. Add ANTHROPIC_API_KEY in your hosting provider's environment variables to enable it.",
    });
    return;
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "Missing prompt." });
    return;
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: data?.error?.message || "Anthropic API error." });
      return;
    }
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: "Failed to reach the AI assistant." });
  }
}
