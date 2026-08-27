/**
 * WebMCP tools for offmarket.brightworkrealty.com
 * Registers only when modelContext is available (native browser or Cloudflare bridge).
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var lead = global.OffmarketLead;

  if (!core || !lead) return;
  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'offmarket' };

  var OFFMARKET_PROGRAM = {
    name: 'Off-Market Access',
    url: 'https://offmarket.brightworkrealty.com',
    tagline: 'The Smart Way to Real Estate',
    summary: 'Private VIP buyer list for off-market homes in Lamorinda before they appear on Zillow or the MLS.',
    audience: 'Serious Bay Area buyers who want early access to homes sold quietly, without public listing exposure.',
    howAccessWorks: [
      'Join the private VIP buyer list at no charge.',
      'When a new off-market home comes to BrightWork, you receive a text alert the same day.',
      'Homes are shown selectively to qualified buyers through a private buyer network, not broadcast publicly.',
      'Your information is never shared with third parties.'
    ],
    benefits: [
      { title: 'Privacy-First Sellers', detail: 'Homeowners who want a quiet sale without open houses or public exposure.' },
      { title: 'Zero Competition', detail: 'Fewer buyers means less pressure. Negotiate on your terms without a bidding frenzy.' },
      { title: 'Pre-Market Head Start', detail: 'Many listings are available before sellers commit to a full public launch.' },
      { title: 'Instant Text Notification', detail: 'You get a text the moment a new property comes to BrightWork.' }
    ],
    serviceArea: ['Moraga', 'Lafayette', 'Orinda', 'Lamorinda', 'East Bay, CA'],
    marketTenure: 'Ben Olsen and BrightWork Realty Advocates have worked Lamorinda since 2004, with team roots in the area since 1977.',
    mlsNote: 'MLS regulations require these listings not be published publicly, which is why access is through a private conversation.',
    faq: [
      {
        question: 'What is an off-market listing in Lamorinda?',
        answer: 'A home sold without a public MLS or portal listing. Sellers often want a quiet sale with no open houses, yard sign, or public days-on-market counter.'
      },
      {
        question: 'How do I get access to off-market homes before they hit Zillow?',
        answer: 'Join a private buyer list maintained by an agent who represents these sellers. The VIP list sends same-day text alerts when new off-market homes arrive.'
      },
      {
        question: 'Are off-market homes in Moraga and Lafayette available without an agent?',
        answer: 'In practice, no. These homes move through agent relationships and private buyer networks, not public portals.'
      },
      {
        question: 'What areas does the private buyer list cover?',
        answer: 'Lamorinda (Moraga, Lafayette, Orinda) and select East Bay pockets.'
      }
    ],
    limitations: [
      'This tool returns program information from the page only.',
      'It does not provide MLS inventory, listing addresses, or CRM read access.'
    ]
  };

  var OFFICE_INFO = {
    brandName: 'BrightWork Realty Advocates',
    tagline: 'The Smart Way to Real Estate',
    realtor: {
      name: 'Ben Olsen',
      title: 'REALTOR',
      profileUrl: 'https://brightworkrealty.com/about-us'
    },
    phone: '(925) 200-6000',
    phoneTel: 'tel:9252006000',
    email: 'ben@brightworkrealty.com',
    address: {
      street: '455 Moraga Road, Suite I',
      city: 'Moraga',
      state: 'CA',
      postalCode: '94556',
      formatted: '455 Moraga Road, Suite I, Moraga, CA 94556'
    },
    brokerageDre: '02014153',
    website: 'https://brightworkrealty.com',
    programPage: 'https://offmarket.brightworkrealty.com',
    hoursNote: 'Contact the office by phone or email. This page does not publish walk-in hours.'
  };

  core.registerTools([
    {
      name: 'get_program',
      description: 'Return structured facts about BrightWork\'s Off-Market Access VIP buyer list program: what it is, who it is for, how access works, and service area. Does not return listing inventory or MLS data.',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      execute: function () {
        return core.jsonResult(OFFMARKET_PROGRAM);
      }
    },
    {
      name: 'get_office',
      description: 'Return BrightWork Realty Advocates office and contact information for Ben Olsen, as stated on the off-market landing page.',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      execute: function () {
        return core.jsonResult(OFFICE_INFO);
      }
    },
    {
      name: 'request_consult',
      description: 'Submit a contact request to join the off-market VIP buyer list. Writes contact info to BrightWork\'s CRM via the same endpoint as the human form. Contacts only; no CRM read access.',
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
          message: 'Request received. BrightWork will text you when a new off-market property becomes available.',
          personId: data.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
