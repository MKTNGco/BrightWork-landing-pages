/**
 * Shared WebMCP tools and program facts for all BrightWork program pages.
 */
(function (global) {
  'use strict';

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
    marketTenure: 'The BrightWork team has operated in Lamorinda since 1977. Ben Olsen has worked Lamorinda real estate since 2004.',
    hoursNote: 'Contact the office by phone or email. Program pages do not publish walk-in hours.'
  };

  var PROGRAMS = [
    {
      name: 'Off-Market Access',
      slug: 'offmarket',
      url: 'https://offmarket.brightworkrealty.com/',
      summary: 'Private VIP buyer list for off-market homes in Lamorinda before they appear on public portals.'
    },
    {
      name: 'Buy Before You Sell',
      slug: 'buybefore',
      url: 'https://buybefore.brightworkrealty.com/',
      summary: 'Buy your next home before selling your current one with structured capital programs and non-contingent offers.'
    },
    {
      name: 'Senior Real Estate Planning',
      slug: 'seniors',
      url: 'https://seniors.brightworkrealty.com/',
      summary: 'Consultative planning for senior homeowners and families navigating Prop 13, legacy homes, and transition timing.'
    },
    {
      name: 'Quiet Listing',
      slug: 'quiet',
      url: 'https://quiet.brightworkrealty.com/',
      summary: 'Sell privately to qualified buyers without a public MLS launch, yard sign, or days-on-market pressure.'
    },
    {
      name: 'Relaunch Strategy',
      slug: 'relaunch',
      url: 'https://relaunch.brightworkrealty.com/',
      summary: 'Forensic review and rebuilt plan for Lamorinda homes whose previous listing expired without selling.'
    },
    {
      name: 'BrightFlip',
      slug: 'brightflip',
      url: 'https://brightflip.brightworkrealty.com/',
      summary: 'Pre-sale home improvements funded at attractive terms, managed by Ben, repaid from closing proceeds.'
    },
    {
      name: 'Final Offer',
      slug: 'finaloffer',
      url: 'https://finaloffer.brightworkrealty.com/',
      summary: 'Structured multi-offer environment for select listings when transparent competition helps discover true market value.'
    },
    {
      name: 'Real Estate Investing',
      slug: 'invest',
      url: 'https://invest.brightworkrealty.com/',
      summary: 'Planning conversations for Lamorinda families considering a first local investment property.'
    }
  ];

  var SHARED_TOOL_LIMITATIONS = [
    'These tools return program and office facts from BrightWork landing pages only.',
    'They do not provide MLS inventory, listing addresses, or CRM read access.'
  ];

  function getSharedTools() {
    return [
      {
        name: 'get_office',
        description: 'Return BrightWork Realty Advocates office and contact information for Ben Olsen, REALTOR: phone, email, address, DRE, and market tenure.',
        inputSchema: {
          type: 'object',
          properties: {}
        },
        execute: function () {
          return global.BrightWorkWebMCP.jsonResult(OFFICE_INFO);
        }
      },
      {
        name: 'list_programs',
        description: 'List all eight BrightWork Realty Advocates program landing pages with a one-line summary and HTTPS URL. Breadth-of-services answer with no MLS data.',
        inputSchema: {
          type: 'object',
          properties: {}
        },
        execute: function () {
          return global.BrightWorkWebMCP.jsonResult({
            brandName: OFFICE_INFO.brandName,
            tagline: OFFICE_INFO.tagline,
            programs: PROGRAMS,
            limitations: SHARED_TOOL_LIMITATIONS
          });
        }
      }
    ];
  }

  function registerSharedTools(meta) {
    var core = global.BrightWorkWebMCP;
    if (!core) return false;
    return core.registerTools(getSharedTools(), meta);
  }

  global.BrightWorkWebMCPShared = {
    OFFICE_INFO: OFFICE_INFO,
    PROGRAMS: PROGRAMS,
    getSharedTools: getSharedTools,
    registerSharedTools: registerSharedTools
  };
})(typeof window !== 'undefined' ? window : globalThis);
