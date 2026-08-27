/**
 * Quiet Listing lead submission to bw-fub-proxy.
 */
(function (global) {
  'use strict';

  var FUB_PROXY_URL = 'https://bw-fub-proxy.scott-5f5.workers.dev';
  var LEAD_TAG = 'quiet-listing-inquiry';
  var LEAD_SOURCE = 'Quiet Listing Landing Page';
  var PAGE_HOST = 'quiet.brightworkrealty.com';
  var WEBMCP_TAG = 'webmcp-consult';

  function buildPayload(firstName, lastName, email, phone, options) {
    var viaWebMcp = options && options.viaWebMcp;
    var tags = [LEAD_TAG];
    if (viaWebMcp) tags.push(WEBMCP_TAG);

    var personSource = viaWebMcp ? PAGE_HOST + ' (WebMCP agent)' : PAGE_HOST;
    var eventSource = viaWebMcp ? 'WebMCP / agent' : PAGE_HOST;

    var payload = {
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
        pageTitle: global.document.title
      }
    };

    if (options && options.situation) {
      payload.timeframe = options.situation;
    }

    if (viaWebMcp) {
      payload.event.description = 'Quiet listing consult request submitted via WebMCP agent.';
    }

    return payload;
  }

  async function submitLead(fields, options) {
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

    var submitOptions = Object.assign({}, options || {});
    if (fields.situation) submitOptions.situation = fields.situation;

    var payload = buildPayload(firstName, lastName, email, phone, submitOptions);

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
        program: 'quiet-listing',
        source: options && options.viaWebMcp ? 'WebMCP / agent' : LEAD_SOURCE,
        via_webmcp: !!(options && options.viaWebMcp),
        situation: fields.situation || 'not-provided'
      });
    }

    return data;
  }

  global.BrightWorkLead = {
    FUB_PROXY_URL: FUB_PROXY_URL,
    LEAD_TAG: LEAD_TAG,
    LEAD_SOURCE: LEAD_SOURCE,
    PAGE_HOST: PAGE_HOST,
    WEBMCP_TAG: WEBMCP_TAG,
    buildPayload: buildPayload,
    submit: submitLead
  };
})(typeof window !== 'undefined' ? window : globalThis);
