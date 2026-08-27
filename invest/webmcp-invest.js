/**
 * WebMCP tools for invest.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;

  if (!core || !shared || !lead) return;

  core.pingReady({ page: 'invest', program: lead.LEAD_TAG });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'invest' };

  var INVEST_PROGRAM = {
    name: 'Real Estate Investing',
    url: 'https://invest.brightworkrealty.com/',
    tagline: 'The Smart Way to Real Estate',
    summary: 'Planning conversations for Lamorinda families considering a first local investment property, especially high earners who have never called themselves investors.',
    audience: 'Lamorinda homeowners age 40 to 60 with significant equity and high household income exploring whether a local rental fits their tax, wealth, and family housing goals.',
    approach: 'Ben starts with financial picture, goals, and timeline before any property search. If the math does not favor investing, he says so.',
    pillars: [
      { name: 'Tax structure', detail: 'Conceptual overview of depreciation, deductible expenses, and mortgage interest. Consult your tax advisor for specifics.' },
      { name: 'Long-term wealth', detail: 'Combination of equity build, appreciation, depreciation benefits, and eventual rental income over a multi-year horizon.' },
      { name: 'Family housing flexibility', detail: 'A local rental can house adult children or aging parents, not just generate returns.' },
      { name: 'Generational strategy', detail: 'Some families aim for one investment property per child when finances support it.' }
    ],
    compliance: 'Ben Olsen is a licensed REALTOR, not a financial advisor or CPA. Real estate investment involves risk. Nothing on this page is financial, tax, or legal advice.',
    serviceArea: ['Moraga', 'Lafayette', 'Orinda', 'Lamorinda', 'East Bay, CA'],
    marketTenure: 'Ben Olsen has worked Lamorinda real estate since 2004. The BrightWork team has operated in Lamorinda since 1977.',
    faq: [
      {
        question: 'Is Lamorinda a good place to invest in real estate?',
        answer: 'Local knowledge matters. Ben focuses on families who understand this market and want a tangible asset they can visit and evaluate.'
      },
      {
        question: 'What is depreciation and how does it help real estate investors?',
        answer: 'Depreciation is a tax concept that can offset rental income on paper. Consult your tax advisor for how it applies to your situation.'
      },
      {
        question: 'Do I have to manage a rental property myself?',
        answer: 'No. Professionally managed rentals are common for investors with full-time careers.'
      },
      {
        question: 'How much equity do I need to buy an investment property in the East Bay?',
        answer: 'Requirements vary by financing and property. Ben discusses realistic scenarios in a planning conversation without guaranteeing returns.'
      }
    ],
    limitations: [
      'This tool returns program information from the page only.',
      'It does not provide MLS inventory, financial projections, or CRM read access.'
    ]
  };

  shared.registerSharedTools(PROGRAM_META);

  core.registerTools([
    {
      name: 'get_program',
      description: 'Return structured facts about BrightWork\'s real estate investing program for Lamorinda families. Not financial advice. Does not return inventory.',
      inputSchema: { type: 'object', properties: {} },
      execute: function () {
        return core.jsonResult(INVEST_PROGRAM);
      }
    },
    {
      name: 'request_consult',
      description: 'Submit a contact request to discuss whether a Lamorinda investment property fits your situation. Writes contact info to BrightWork\'s CRM. Contacts only; no CRM read access.',
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
          message: 'Request received. Ben will follow up about investment property planning for your situation.',
          personId: data.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
