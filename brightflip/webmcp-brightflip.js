/**
 * WebMCP tools for brightflip.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;

  if (!core || !shared || !lead) return;

  core.pingReady({ page: 'brightflip', program: lead.LEAD_TAG });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'brightflip' };

  var BRIGHTFLIP_PROGRAM = {
    name: 'BrightFlip',
    url: 'https://brightflip.brightworkrealty.com/',
    tagline: 'The Smart Way to Real Estate',
    summary: 'Pre-sale home improvements funded at attractive terms, managed by Ben, with repayment from closing proceeds when the math favors the seller.',
    audience: 'Lamorinda sellers with deferred maintenance or cosmetic issues who will not fund renovation themselves before listing.',
    positioning: 'BrightFlip manages the work and advances capital, recommends scope only when numbers favor the seller, and differs from advance-only concierge models.',
    howItWorks: [
      'Ben compares realistic as-is sale value to realistic post-improvement value for a defined scope.',
      'If the math clearly favors the seller, capital and project management proceed with no monthly payments during the project and listing period.',
      'Repayment comes from closing proceeds. Terms vary by project scope and capital source.',
      'If the math does not favor the seller, Ben does not recommend the project.'
    ],
    tiers: [
      { name: 'Cosmetic Refresh', detail: 'Paint, floors, lighting, fixtures, curb appeal, and targeted kitchen or bath updates.' },
      { name: 'Partial Remodel', detail: 'Kitchen refreshes, bathroom remodels, and significant exterior work when net value justifies scope.' },
      { name: 'Major Renovation and Partnered Projects', detail: 'Select larger projects such as ADU work, underwritten carefully. Not every home qualifies.' }
    ],
    serviceArea: ['Moraga', 'Lafayette', 'Orinda', 'Lamorinda', 'East Bay, CA'],
    marketTenure: 'Ben Olsen has worked Lamorinda real estate since 2004 and brings a construction background to improvement recommendations.',
    capitalLanguage: 'Use attractive terms and multiple capital options. Do not promise interest-free capital or name specific lenders.',
    faq: [
      {
        question: 'What home improvements add the most value before selling in Lamorinda?',
        answer: 'High-return cosmetic updates that change how buyers feel when they walk in, scoped to what comparable sales support.'
      },
      {
        question: 'How does pre-sale renovation financing work and who pays for it?',
        answer: 'Capital is structured so sellers typically pay nothing out of pocket until close, with repayment from proceeds when a project is approved.'
      },
      {
        question: 'Who manages the contractors in a BrightFlip project?',
        answer: 'Ben\'s team handles project management, vetted contractors, and timelines aligned to the listing calendar.'
      },
      {
        question: 'How long does a pre-sale improvement project typically take?',
        answer: 'Duration depends on scope. Ben sets expectations before any work begins.'
      }
    ],
    limitations: [
      'This tool returns program information from the page only.',
      'It does not provide MLS inventory, contractor bids, lender terms, or CRM read access.'
    ]
  };

  shared.registerSharedTools(PROGRAM_META);

  core.registerTools([
    {
      name: 'get_program',
      description: 'Return structured facts about BrightWork\'s BrightFlip pre-sale improvement program. Does not return project quotes or lender terms.',
      inputSchema: { type: 'object', properties: {} },
      execute: function () {
        return core.jsonResult(BRIGHTFLIP_PROGRAM);
      }
    },
    {
      name: 'request_consult',
      description: 'Submit a contact request for an as-is vs. improved analysis with Ben. Writes contact info to BrightWork\'s CRM. Contacts only; no CRM read access.',
      inputSchema: {
        type: 'object',
        properties: {
          firstName: { type: 'string', description: 'Contact first name' },
          lastName: { type: 'string', description: 'Contact last name' },
          email: { type: 'string', description: 'Contact email address' },
          phone: { type: 'string', description: 'Contact mobile phone number' }
        },
        required: ['firstName', 'lastName', 'email', 'phone']
      },
      execute: async function (args) {
        var data = await lead.submit({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phone: args.phone
        }, { viaWebMcp: true });

        return core.jsonResult({
          success: true,
          message: 'Request received. Ben will follow up about your as-is vs. improved analysis.',
          personId: data.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
