/**
 * WebMCP tools for buybefore.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;

  if (!core || !shared || !lead) return;

  core.pingReady({ page: 'buybefore', program: lead.LEAD_TAG });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'buybefore' };

  var BUYBEFORE_PROGRAM = {
    name: 'Buy Before You Sell',
    url: 'https://buybefore.brightworkrealty.com/',
    tagline: 'The Smart Way to Real Estate',
    summary: 'A structure that lets Lamorinda sellers buy their next home before selling their current one, often with a non-contingent offer.',
    audience: 'Homeowners who need to buy before they sell and want to avoid losing offers because of a sale contingency.',
    problem: 'Contingent offers lose in competitive Lamorinda markets. Sellers see a sale contingency as risk even when your offer is strong on paper.',
    howItWorks: [
      'Through capital programs BrightWork maintains access to, you may receive a purchase price on your current home.',
      'That lets you make a non-contingent offer on your next home before your current home sells.',
      'When your home sells, boosted proceeds can reduce pressure to accept a fast, discounted sale.',
      'Ben maps options for your timeline without naming specific lenders or dollar amounts on this page.'
    ],
    benefits: [
      'Non-contingent offers that compete on terms, not just price',
      'Multiple program options matched to your situation',
      'Sell on your timeline, prepared rather than pressured',
      'Local Lamorinda expertise since 1977 on the BrightWork team'
    ],
    serviceArea: ['Moraga', 'Lafayette', 'Orinda', 'Lamorinda', 'East Bay, CA'],
    marketTenure: 'The BrightWork team has operated in Lamorinda since 1977. Ben Olsen has worked Lamorinda real estate since 2004.',
    faq: [
      {
        question: 'How does buy before you sell work in California?',
        answer: 'Structured programs can advance capital against your current home so you can purchase the next one without a sale contingency on your offer.'
      },
      {
        question: 'What is the difference between buy before you sell and a bridge loan?',
        answer: 'Programs vary, but the goal is the same: remove the contingency that makes sellers choose another buyer while you still own your current home.'
      },
      {
        question: 'Can I make a non-contingent offer before selling my home in Lamorinda?',
        answer: 'That is the core use case when you qualify for the right program structure for your equity and timeline.'
      },
      {
        question: 'What happens if my current home sells for more than expected?',
        answer: 'Program terms vary. Ben walks through realistic scenarios before you commit, without guaranteeing a specific outcome.'
      }
    ],
    limitations: [
      'This tool returns program information from the page only.',
      'It does not provide MLS inventory, listing addresses, lender quotes, or CRM read access.'
    ]
  };

  shared.registerSharedTools(PROGRAM_META);

  core.registerTools([
    {
      name: 'get_program',
      description: 'Return structured facts about BrightWork\'s Buy Before You Sell program: who it is for, how it works, and Lamorinda service area. Does not return inventory or lender terms.',
      inputSchema: { type: 'object', properties: {} },
      execute: function () {
        return core.jsonResult(BUYBEFORE_PROGRAM);
      }
    },
    {
      name: 'request_consult',
      description: 'Submit a contact request to discuss buy-before-you-sell options. Writes contact info to BrightWork\'s CRM. Contacts only; no CRM read access.',
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
          message: 'Request received. Ben will follow up about buy-before-you-sell options for your situation.',
          personId: data.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
