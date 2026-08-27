/**
 * Off-Market Access lead submission to bw-fub-proxy.
 * Shared by the human form and the WebMCP request_consult tool.
 */
(function (global) {
  'use strict';

  var FUB_PROXY_URL = 'https://bw-fub-proxy.scott-5f5.workers.dev';
  var LEAD_TAG = 'off-market-lead';
  var LEAD_SOURCE = 'Off-Market Access';
  var WEBMCP_TAG = 'webmcp-consult';

  function buildPayload(firstName, lastName, email, phone, options) {
    var viaWebMcp = options && options.viaWebMcp;
    var tags = [LEAD_TAG];
    if (viaWebMcp) tags.push(WEBMCP_TAG);

    var personSource = viaWebMcp
      ? 'offmarket.brightworkrealty.com (WebMCP agent)'
      : 'offmarket.brightworkrealty.com';

    var eventSource = viaWebMcp
      ? 'WebMCP / agent'
      : 'offmarket.brightworkrealty.com';

    return {
      person: {
        firstName: firstName,
        lastName: lastName,
        emails: [{ value: email, type: 'work' }],
        phones: [{ value: phone, type: 'mobile' }],
        source: personSource,
        stage: 'Lead',
        assignedTo: 'Ben Olsen',
        tags: tags
      },
      event: {
        type: 'Registration',
        source: eventSource,
        pageUrl: global.location.href,
        pageTitle: global.document.title,
        description: viaWebMcp
          ? 'VIP list request submitted via WebMCP agent on off-market landing page.'
          : undefined
      }
    };
  }

  async function submitOffmarketLead(fields, options) {
    if (!FUB_PROXY_URL || !/^https:\/\//i.test(FUB_PROXY_URL)) {
      throw new Error('Form delivery is not configured.');
    }

    var firstName = String(fields.firstName || '').trim();
    var lastName = String(fields.lastName || '').trim();
    var email = String(fields.email || '').trim();
    var phone = String(fields.phone || '').trim();

    if (!firstName || !lastName || !email || !phone) {
      throw new Error('firstName, lastName, email, and phone are required.');
    }

    var payload = buildPayload(firstName, lastName, email, phone, options);

    var res = await fetch(FUB_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error('Lead submission failed.');
    }

    var data = await res.json();

    if (typeof global.posthog !== 'undefined') {
      if (data.success && data.personId) {
        global.posthog.identify(email, {
          email: email,
          name: firstName + ' ' + lastName,
          fub_source: LEAD_SOURCE,
          fub_person_id: data.personId,
          fub_identified_at: new Date().toISOString()
        });
      }
      global.posthog.capture('lead_submitted', {
        program: LEAD_TAG,
        source: options && options.viaWebMcp ? 'WebMCP / agent' : LEAD_SOURCE,
        via_webmcp: !!(options && options.viaWebMcp)
      });
    }

    return data;
  }

  global.OffmarketLead = {
    FUB_PROXY_URL: FUB_PROXY_URL,
    LEAD_TAG: LEAD_TAG,
    LEAD_SOURCE: LEAD_SOURCE,
    WEBMCP_TAG: WEBMCP_TAG,
    buildPayload: buildPayload,
    submit: submitOffmarketLead
  };
})(typeof window !== 'undefined' ? window : globalThis);
