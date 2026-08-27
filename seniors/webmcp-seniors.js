/**
 * WebMCP tools for seniors.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;

  if (!core || !shared || !lead) return;

  core.pingReady({ page: 'seniors', program: lead.POSTHOG_PROGRAM });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.POSTHOG_PROGRAM, page: 'seniors' };

  var SENIORS_PROGRAM = {
    name: 'Senior Real Estate Planning',
    url: 'https://seniors.brightworkrealty.com/',
    tagline: 'The Smart Way to Real Estate',
    summary: 'Consultative planning for senior homeowners and families navigating Prop 13, legacy homes, trusts, timing, and transition options in Lamorinda.',
    audience: 'Senior homeowners planning their next chapter and adult children who need a structured way to start the conversation before a crisis.',
    topics: [
      'Prop 13 tax basis and capital gains questions to raise with your CPA',
      'Legacy home decisions: stay, downsize, rent, or sell on your timeline',
      'Trust and titling coordination with your estate attorney',
      'Timing a transition without pressure',
      'Options many families do not know they have, including 1031 exchanges, DSTs, and step-up in basis concepts to discuss with advisors'
    ],
    whatBenDoes: [
      'Helps families plan transitions on their own terms',
      'Coordinates real estate strategy with questions for CPA and estate attorney',
      'May recommend keeping a home as a rental when that fits the family, even when it means no listing commission'
    ],
    compliance: 'Ben Olsen is a licensed REALTOR, not an attorney, financial advisor, or CPA. Tax and estate topics are questions to raise with qualified professionals.',
    serviceArea: ['Moraga', 'Lafayette', 'Orinda', 'Lamorinda', 'East Bay, CA'],
    marketTenure: 'Ben Olsen has worked Lamorinda real estate since 2004. The BrightWork team has operated in Lamorinda since 1977.',
    workshopNote: 'Ben occasionally hosts senior real estate planning workshops. See seniors.brightworkrealty.com/workshop for workshop details.',
    faq: [
      {
        question: 'When should a senior homeowner start thinking about a real estate transition?',
        answer: 'Before a health event forces urgent decisions. Planning ahead preserves more options and autonomy.'
      },
      {
        question: 'What is Prop 13 and why does it matter if I am thinking about selling?',
        answer: 'Long-held California homes often have low assessed values. Selling can trigger capital gains your CPA should model with you first.'
      },
      {
        question: 'Should I sell my Lamorinda home or keep it as a rental?',
        answer: 'Depends on Prop 13 basis, equity, family housing needs, and rental demand. Ben helps evaluate the tradeoffs without giving tax advice.'
      },
      {
        question: 'Does Ben charge for a senior real estate planning consultation?',
        answer: 'Contact the office to discuss consultation format. This page does not publish fee schedules.'
      }
    ],
    limitations: [
      'This tool returns program information from the page only.',
      'It does not provide MLS inventory, legal or tax advice, or CRM read access.'
    ]
  };

  shared.registerSharedTools(PROGRAM_META);

  core.registerTools([
    {
      name: 'get_program',
      description: 'Return structured facts about BrightWork\'s Senior Real Estate Planning services. Not legal or tax advice. Does not return inventory.',
      inputSchema: { type: 'object', properties: {} },
      execute: function () {
        return core.jsonResult(SENIORS_PROGRAM);
      }
    },
    {
      name: 'request_consult',
      description: 'Submit a contact request to talk with Ben about senior real estate planning. Writes contact info to BrightWork\'s CRM. Contacts only; no CRM read access.',
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
          message: 'Request received. Ben will follow up about senior real estate planning for your family.',
          personId: data.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
