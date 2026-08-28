const POSTHOG_KEY = "phc_D4PErHHVrdiiphQqEZ8qmintbxdNLtzCShtmgmwWC79i";
const POSTHOG_CAPTURE = "https://us.i.posthog.com/capture/";
const BODY_CAP_BYTES = 4096;

const HONEST_404 = `No MCP server is currently hosted at this address.

Structured, agent-readable information about BrightWork Realty
Advocates is available at:
https://brightworkrealty.com/llms.txt
https://brightworkrealty.com/agents.json

Individual program pages also expose WebMCP tools where supported:
https://offmarket.brightworkrealty.com/
https://buybefore.brightworkrealty.com/
https://seniors.brightworkrealty.com/
https://quiet.brightworkrealty.com/
https://relaunch.brightworkrealty.com/
https://brightflip.brightworkrealty.com/
https://finaloffer.brightworkrealty.com/
https://invest.brightworkrealty.com/
`;

export default {
  async fetch(request, _env, ctx) {
    const bodySnippet = await readBodySnippet(request);
    ctx.waitUntil(captureProbe(request, bodySnippet));

    return new Response(HONEST_404, {
      status: 404,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  },
};

async function readBodySnippet(request) {
  const method = request.method.toUpperCase();
  if (method !== "POST" && method !== "PUT") return "";
  if (!request.body) return "";

  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;

  try {
    while (total < BODY_CAP_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      total += value.byteLength;
    }
  } finally {
    try {
      await reader.cancel();
    } catch {
      /* stream already closed */
    }
  }

  const out = new Uint8Array(Math.min(total, BODY_CAP_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    if (offset >= BODY_CAP_BYTES) break;
    const take =
      chunk.byteLength > BODY_CAP_BYTES - offset
        ? chunk.subarray(0, BODY_CAP_BYTES - offset)
        : chunk;
    out.set(take, offset);
    offset += take.byteLength;
  }

  return new TextDecoder().decode(out.subarray(0, offset));
}

async function captureProbe(request, bodySnippet) {
  try {
    const url = new URL(request.url);
    const headers = {};
    for (const [key, value] of request.headers) {
      headers[key] = value;
    }

    const ip = request.headers.get("cf-connecting-ip") || "";
    const userAgent = request.headers.get("user-agent") || "";
    const distinctId = await stableDistinctId(ip, userAgent);

    await fetch(POSTHOG_CAPTURE, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event: "mcp_probe_request",
        distinct_id: distinctId,
        properties: {
          method: request.method,
          path: url.pathname,
          query: url.search,
          headers,
          body_snippet: bodySnippet,
          timestamp: new Date().toISOString(),
        },
      }),
    });
  } catch {
    /* diagnostic capture must never affect the client response */
  }
}

async function stableDistinctId(ip, userAgent) {
  const bytes = new TextEncoder().encode(`${ip}|${userAgent}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hex = [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `mcp-probe:${hex.slice(0, 32)}`;
}
