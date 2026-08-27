/**
 * WebMCP tools for quiet.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;

  if (!core || !shared || !lead) return;

  core.pingReady({ page: 'quiet', program: lead.LEAD_TAG });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'quiet' };

  var QUIET_PROGRAM = {
    name: 'Quiet Listing',
    url: 'https://quiet.brightworkrealty.com/',
    tagline: 'The Smart Way to Real Estate',
    summary: 'A private listing strategy for Lamorinda sellers who want qualified buyers without a public MLS launch, yard sign, or days-on-market pressure.',
    audience: 'Lamorinda homeowners who want to sell privately: privacy-first sellers, previously unsold listings, senior transitions, or sellers testing price and timing.',
    howItWorks: [
      'Ben markets the home to a curated private buyer network before deciding whether to start the public MLS clock.',
      'Stages include private invitation-only exposure, controlled pre-market signals, and full on-market launch if earlier stages do not produce the right offer.',
      'Every quiet listing is documented and conducted in compliance with MLS rules and NAR Clear Cooperation Policy.',
      'If the private phase does not produce the right result, you can go to market better informed with a clean slate.'
    ],
    benefits: [
      'No days-on-market pressure until you decide to start the MLS clock',
      'Fewer showings from serious, qualified buyers',
      'Privacy where it matters: no public listing history until you choose',
      'Option to pivot to a full MLS campaign with real market feedback'
    ],
    serviceArea: ['Moraga', 'Lafayette', 'Orinda', 'Lamorinda', 'East Bay, CA'],
    marketTenure: 'Ben Olsen has worked Lamorinda real estate since 2004. The BrightWork team has operated in Lamorinda since 1977.',
    complianceNote: 'Private means selective exposure to qualified buyers, not a workaround of MLS rules.',
    faq: [
      {
        question: 'What is a quiet listing in real estate?',
        answer: 'A structured private marketing phase where serious buyers see the home before a full public MLS launch.'
      },
      {
        question: 'Do quiet listings in Lamorinda sell for less than MLS listings?',
        answer: 'Not necessarily. The goal is the right buyer and terms without public exposure pressure, not a guaranteed discount.'
      },
      {
        question: 'Is selling a home quietly legal in California?',
        answer: 'Yes when conducted through compliant agent representation and MLS documentation requirements.'
      },
      {
        question: 'How long does a quiet listing phase typically last before going to MLS?',
        answer: 'Timing depends on seller goals and buyer response. Ben sets expectations in the initial conversation.'
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
      description: 'Return structured facts about BrightWork\'s Quiet Listing program for private Lamorinda sellers. Does not return inventory or MLS data.',
      inputSchema: { type: 'object', properties: {} },
      execute: function () {
        return core.jsonResult(QUIET_PROGRAM);
      }
    },
    {
      name: 'request_consult',
      description: 'Submit a contact request to start a quiet listing conversation with Ben. Writes contact info to BrightWork\'s CRM. Contacts only; no CRM read access.',
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
          message: 'Request received. Ben will follow up about whether a quiet listing fits your situation.',
          personId: data.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
