const BRIGHTWORK_ORIGIN_RE = /^https:\/\/([a-z0-9-]+\.)?brightworkrealty\.com$/;
const MCC_ORIGIN = "https://moragacountryclubrealestate.com";

function jsonResponse(body, corsOrigin, status = 200) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
  if (corsOrigin) {
    headers['Access-Control-Allow-Origin'] = corsOrigin;
  }
  return new Response(body, { status, headers });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    const corsOrigin = (BRIGHTWORK_ORIGIN_RE.test(origin) || origin === MCC_ORIGIN)
      ? origin
      : null;

    if (request.method === "OPTIONS") {
      if (!corsOrigin) {
        return new Response("Forbidden", { status: 403 });
      }
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": corsOrigin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    if (!corsOrigin) {
      return new Response("Forbidden", { status: 403 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(JSON.stringify({ errorMessage: 'Invalid JSON' }), corsOrigin, 400);
    }

    if (!body.person) {
      return jsonResponse(
        JSON.stringify({ errorMessage: 'No information about a person in the request body.' }),
        corsOrigin,
        400
      );
    }

    const fubRes = await fetch('https://api.followupboss.com/v1/people', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(env.FUB_API_KEY + ':'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body.person),
    });

    const fubPerson = await fubRes.json();

    if (!fubRes.ok) {
      return jsonResponse(JSON.stringify(fubPerson), corsOrigin, fubRes.status);
    }

    return jsonResponse(JSON.stringify({ success: true, personId: fubPerson.id }), corsOrigin, fubRes.status);
  },
};
