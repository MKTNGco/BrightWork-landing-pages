import {
  buildRootAgentsJson,
  buildRootLlmsTxt,
  buildRobotsTxt,
} from "../shared/agent-response-builders.mjs";

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname === "/robots.txt") {
      return new Response(buildRobotsTxt(), {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (pathname === "/llms.txt") {
      return new Response(buildRootLlmsTxt(), {
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    if (pathname === "/agents.json") {
      return new Response(JSON.stringify(buildRootAgentsJson(), null, 2), {
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};
