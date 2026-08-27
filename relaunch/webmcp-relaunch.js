/**
 * WebMCP tools for relaunch.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;

  if (!core || !shared || !lead) return;

  core.pingReady({ page: 'relaunch', program: lead.LEAD_TAG });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'relaunch' };

  var RELAUNCH_PROGRAM = {
    name: 'Relaunch Strategy',
    url: 'https://relaunch.brightworkrealty.com/',
    tagline: 'The Smart Way to Real Estate',
    summary: 'Forensic review and rebuilt plan for Lamorinda homes whose previous listing expired without selling.',
    audience: 'Homeowners whose listing expired with a previous agent and want an honest breakdown of what went wrong before relisting.',
    approach: 'Ben starts with a forensic review of the previous listing, not a new sign. The review covers pricing in context, photography, listing narrative, portal placement, and prep decisions.',
    reviewAreas: [
      'Pricing in context relative to condition and comparable sales',
      'Photography and visual storytelling',
      'Listing copy and buyer narrative',
      'Portal placement and campaign execution, including premium tools when warranted',
      'Prep and improvement decisions with realistic scope'
    ],
    whatChangesOnRelaunch: [
      'New photography and video, not a refresh of old assets',
      'Rewritten listing narrative for how Lamorinda buyers evaluate homes',
      'A pricing conversation, not just a price cut',
      'Choice between quiet reintroduction to the private buyer network or a full MLS campaign',
      'Selective use of premium tools such as Zillow Showcase, 3D tours, Final Offer, or pre-sale capital when justified'
    ],
    serviceArea: ['Moraga', 'Lafayette', 'Orinda', 'Lamorinda', 'East Bay, CA'],
    marketTenure: 'Ben Olsen has worked Lamorinda real estate since 2004. The BrightWork team has operated in Lamorinda since 1977.',
    faq: [
      {
        question: 'Why didn\'t my home sell in Lamorinda?',
        answer: 'Common causes include pricing misalignment, weak presentation, poor campaign execution, or the wrong go-to-market strategy for the property.'
      },
      {
        question: 'How is a relaunch different from relisting with a new agent?',
        answer: 'A relaunch addresses what failed in the previous campaign with a specific plan, not a rerun of the same approach.'
      },
      {
        question: 'What does a forensic listing review actually include?',
        answer: 'A structured look at price, photos, copy, marketing placement, and prep relative to comparable sales and buyer behavior.'
      },
      {
        question: 'Can expired listings still sell for full market value?',
        answer: 'Outcomes vary by property and market conditions. Ben does not guarantee a specific sale price.'
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
      description: 'Return structured facts about BrightWork\'s Relaunch Strategy for expired Lamorinda listings. Does not return inventory or MLS data.',
      inputSchema: { type: 'object', properties: {} },
      execute: function () {
        return core.jsonResult(RELAUNCH_PROGRAM);
      }
    },
    {
      name: 'request_consult',
      description: 'Submit a contact request for a free expired listing review with Ben. Writes contact info to BrightWork\'s CRM. Contacts only; no CRM read access.',
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
          message: 'Request received. Ben will follow up about your listing review.',
          personId: data.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
