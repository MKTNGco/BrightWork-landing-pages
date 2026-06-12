const BRIGHTWORK_ORIGIN_RE = /^https:\/\/([a-z0-9-]+\.)?brightworkrealty\.com$/;
const MCC_ORIGIN = "https://moragacountryclubrealestate.com";

const TIMEFRAME_MAP = {
  // Actively looking / ready now
  'actively-looking': '0-3 Months',
  'ready-now': '0-3 Months',
  'asap': '0-3 Months',
  '0-3-months': '0-3 Months',
  'found-home': '0-3 Months',

  // Hot / near term
  'hot-90-days': '0-3 Months',
  '3-6-months': '3-6 Months',
  'soon': '3-6 Months',
  'planning-6mo': '3-6 Months',
  'move-6-months': '3-6 Months',
  'listing-didnt-sell': '3-6 Months',

  // Warm / mid term
  'warm-6-12': '6-12 Months',
  '6-12-months': '6-12 Months',
  'considering': '6-12 Months',

  // Long term
  '12-plus-months': '12+ Months',
  'just-looking': '12+ Months',
  'exploring': '12+ Months',
  'just-exploring': '12+ Months',

  // No plans
  'no-plans': 'No Plans',
  'not-sure': 'No Plans',
};

const TIMEFRAME_TAGS = [
  'Hot 90 Days',
  'Warm 6-12 Months',
  'Warm 12 Months',
];

const TAG_MAP = {
  '0-3 Months': 'Hot 90 Days',
  '3-6 Months': 'Hot 90 Days',
  '6-12 Months': 'Warm 6-12 Months',
  '12+ Months': 'Warm 12 Months',
};

const TIMEFRAME_FIELD_NAMES = [
  'timeframe',
  'timeline',
  'process',
  'where_in_process',
  'whereInProcess',
];

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

function fubAuthHeader(env) {
  return 'Basic ' + btoa(env.FUB_API_KEY + ':');
}

function normalizeTimeframeKey(value) {
  return String(value).trim().toLowerCase();
}

function extractTimeframeValue(person) {
  for (const field of TIMEFRAME_FIELD_NAMES) {
    if (person[field]) {
      const key = normalizeTimeframeKey(person[field]);
      if (TIMEFRAME_MAP[key]) return key;
    }
  }

  for (const tag of person.tags ?? []) {
    const key = normalizeTimeframeKey(tag);
    if (TIMEFRAME_MAP[key]) return key;
  }

  return null;
}

async function syncTimeframeAndTags(personId, person, env) {
  const rawValue = extractTimeframeValue(person);
  if (!rawValue) return;

  const fubTimeframe = TIMEFRAME_MAP[rawValue];
  if (!fubTimeframe) return;

  const auth = fubAuthHeader(env);

  try {
    const timeframeRes = await fetch(`https://api.followupboss.com/v1/people/${personId}`, {
      method: 'PATCH',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timeframe: fubTimeframe }),
    });

    if (!timeframeRes.ok) {
      console.error('FUB timeframe PATCH failed:', timeframeRes.status, await timeframeRes.text());
    }
  } catch (err) {
    console.error('FUB timeframe PATCH error:', err);
  }

  try {
    const personRes = await fetch(`https://api.followupboss.com/v1/people/${personId}`, {
      headers: { Authorization: auth },
    });

    if (!personRes.ok) {
      console.error('FUB person GET failed:', personRes.status, await personRes.text());
      return;
    }

    const personData = await personRes.json();
    const currentTags = personData.tags ?? [];
    const cleanedTags = currentTags.filter((t) => !TIMEFRAME_TAGS.includes(t));
    const newTag = TAG_MAP[fubTimeframe];
    const updatedTags = newTag ? [...cleanedTags, newTag] : cleanedTags;

    const tagsRes = await fetch(`https://api.followupboss.com/v1/people/${personId}`, {
      method: 'PATCH',
      headers: {
        Authorization: auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tags: updatedTags }),
    });

    if (!tagsRes.ok) {
      console.error('FUB tags PATCH failed:', tagsRes.status, await tagsRes.text());
    }
  } catch (err) {
    console.error('FUB tags sync error:', err);
  }
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
        Authorization: fubAuthHeader(env),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body.person),
    });

    const fubPerson = await fubRes.json();

    if (!fubRes.ok) {
      return jsonResponse(JSON.stringify(fubPerson), corsOrigin, fubRes.status);
    }

    const personId = fubPerson?.person?.id ?? fubPerson?.id ?? null;

    if (body.event && personId) {
      try {
        const eventRes = await fetch('https://api.followupboss.com/v1/events', {
          method: 'POST',
          headers: {
            Authorization: fubAuthHeader(env),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...body.event,
            person: { id: personId },
          }),
        });

        if (!eventRes.ok) {
          console.error('FUB event POST failed:', eventRes.status, await eventRes.text());
        }
      } catch (err) {
        console.error('FUB event POST error:', err);
      }
    }

    if (personId) {
      await syncTimeframeAndTags(personId, body.person, env);
    }

    return jsonResponse(JSON.stringify({ success: true, personId }), corsOrigin, 200);
  },
};
