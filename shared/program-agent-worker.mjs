/**
 * Cloudflare Worker in front of program landing page static assets.
 * Homepage: Accept text/markdown negotiation, Link discovery headers, Vary: Accept.
 */

function homepageLinkHeader(origin) {
  return [
    '</llms.txt>; rel="llms.txt"',
    '</sitemap.xml>; rel="sitemap"',
    '</index.md>; rel="markdown"',
    '</agents.json>; rel="describedby"',
    '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
    '</.well-known/ai-catalog.json>; rel="ai-catalog"; type="application/json"',
    `<${origin}/>; rel="webmcp"`,
    '</agents.json>; rel="alternate"; type="application/json"',
  ].join(', ');
}

function isHomePath(pathname) {
  return pathname === '/' || pathname === '/index.html';
}

function wantsMarkdown(acceptHeader) {
  if (!acceptHeader) return false;
  return acceptHeader.toLowerCase().includes('text/markdown');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (!isHomePath(url.pathname)) {
      return env.ASSETS.fetch(request);
    }

    const origin = url.origin;
    const link = homepageLinkHeader(origin);

    if (wantsMarkdown(request.headers.get('Accept'))) {
      const mdUrl = new URL('/index.md', origin);
      const mdResponse = await env.ASSETS.fetch(new Request(mdUrl, request));
      if (mdResponse.ok) {
        const headers = new Headers(mdResponse.headers);
        headers.set('Content-Type', 'text/markdown; charset=utf-8');
        headers.set('Vary', 'Accept');
        headers.set('Link', link);
        return new Response(mdResponse.body, {
          status: mdResponse.status,
          headers,
        });
      }
    }

    const assetResponse = await env.ASSETS.fetch(request);
    const headers = new Headers(assetResponse.headers);
    headers.set('Vary', 'Accept');
    headers.set('Link', link);
    return new Response(assetResponse.body, {
      status: assetResponse.status,
      headers,
    });
  },
};
