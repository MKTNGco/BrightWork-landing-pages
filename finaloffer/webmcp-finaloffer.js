/**
 * WebMCP tools for finaloffer.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;

  if (!core || !shared || !lead) return;

  core.pingReady({ page: 'finaloffer', program: lead.LEAD_TAG });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'finaloffer' };

  var FINALOFFER_PROGRAM = {
    name: 'Final Offer',
    url: 'https://finaloffer.brightworkrealty.com/',
    tagline: 'The Smart Way to Real Estate',
    summary: 'Structured multi-offer environment Ben deploys selectively when transparent competition helps discover true market value.',
    audience: 'Sellers interviewing agents or researching offer-management options for homes where structured competition may improve price discovery.',
    positioning: 'Final Offer is a selective premium tool, not a baseline listing service. Ben deploys it when property and market conditions justify structured competition.',
    howItWorks: [
      'Serious buyers following the listing see offer activity in real time instead of submitting blind offers.',
      'Visibility creates genuine competition rather than manufactured pressure.',
      'Standard purchase contracts still apply. Final Offer manages the competitive environment.',
      '100% of leads route back to the listing team.'
    ],
    platformFacts: [
      'Compliant nationwide and aligned with NAR Clear Cooperation Policy',
      'Standard contracts still work alongside the offer environment',
      'Useful when automated valuations undervalue unique Lamorinda homes with limited comps'
    ],
    serviceArea: ['Moraga', 'Lafayette', 'Orinda', 'Lamorinda', 'East Bay, CA'],
    marketTenure: 'Ben Olsen has worked Lamorinda real estate since 2004. The BrightWork team has operated in Lamorinda since 1977.',
    copyRules: [
      'Do not use the word auction in residential copy.',
      'Do not list Final Offer alongside baseline services like photography.'
    ],
    faq: [
      {
        question: 'What is Final Offer in residential real estate?',
        answer: 'A structured offer environment where buyers see competing activity in real time so sellers can discover market value with more transparency.'
      },
      {
        question: 'Is Final Offer used on every BrightWork listing?',
        answer: 'No. Ben treats it as a precision instrument deployed when conditions warrant it.'
      },
      {
        question: 'Do standard California purchase contracts still apply?',
        answer: 'Yes. Final Offer manages the competitive environment around standard contract documents.'
      }
    ],
    limitations: [
      'This tool returns program information from the page only.',
      'It does not provide MLS inventory, listing addresses, or CRM read access.'
    ]
  };

  shared.registerSharedTools(PROGRAM_META);

  core.registerTools([
    {
      name: 'get_program',
      description: 'Return structured facts about BrightWork\'s Final Offer offer-management program. Does not return inventory or MLS data.',
      inputSchema: { type: 'object', properties: {} },
      execute: function () {
        return core.jsonResult(FINALOFFER_PROGRAM);
      }
    },
    {
      name: 'request_consult',
      description: 'Submit a contact request to ask whether a home is a Final Offer candidate. Writes contact info to BrightWork\'s CRM. Contacts only; no CRM read access.',
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
          message: 'Request received. Ben will follow up about Final Offer candidacy for your home.',
          personId: data.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
