/**
 * BrightFlip lead submission to bw-fub-proxy.
 */
(function (global) {
  'use strict';

  var FUB_PROXY_URL = 'https://bw-fub-proxy.scott-5f5.workers.dev';
  var LEAD_TAG = 'presale-improvement-inquiry';
  var LEAD_SOURCE = 'BrightFlip Landing Page';
  var PAGE_HOST = 'brightflip.brightworkrealty.com';
  var WEBMCP_TAG = 'webmcp-consult';

  function buildPayload(firstName, lastName, email, phone, options) {
    var viaWebMcp = options && options.viaWebMcp;
    var tags = [LEAD_TAG];
    if (viaWebMcp) tags.push(WEBMCP_TAG);

    var personSource = viaWebMcp ? PAGE_HOST + ' (WebMCP agent)' : PAGE_HOST;
    var eventSource = viaWebMcp ? 'WebMCP / agent' : PAGE_HOST;

    var person = {
      firstName: firstName,
      lastName: lastName,
      emails: [{ value: email, type: 'work' }],
      phones: [{ value: phone, type: 'mobile' }],
      source: personSource,
      stage: 'Lead',
      assignedTo: 'Ben Olsen',
      tags: tags
    };

    var backgroundParts = [];
    if (options && options.propertyAddress) {
      backgroundParts.push('Property: ' + options.propertyAddress);
    }
    if (options && options.concern) {
      backgroundParts.push('Biggest concern: ' + options.concern);
    }
    if (backgroundParts.length) {
      person.background = backgroundParts.join('\n\n');
    }

    var event = {
      type: 'Registration',
      source: eventSource,
      pageUrl: global.location.href,
      pageTitle: global.document.title
    };

    if (viaWebMcp) {
      event.description = 'BrightFlip analysis request submitted via WebMCP agent.';
    }

    return { person: person, event: event };
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
    if (fields.propertyAddress) submitOptions.propertyAddress = fields.propertyAddress;
    if (fields.concern) submitOptions.concern = fields.concern;

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
          property_address: fields.propertyAddress || undefined,
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
