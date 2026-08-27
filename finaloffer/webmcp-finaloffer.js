/**
 * WebMCP tools for finaloffer.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;
  var data = global.BrightWorkWebMCPData;

  if (!core || !shared || !lead || !data) return;

  core.pingReady({ page: 'finaloffer', program: lead.LEAD_TAG });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'finaloffer' };
  var FINALOFFER_PROGRAM = data.PROGRAMS_BY_SLUG.finaloffer;

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
        var submitData = await lead.submit({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phone: args.phone
        }, { viaWebMcp: true });

        return core.jsonResult({
          success: true,
          message: 'Request received. Ben will follow up about Final Offer candidacy for your home.',
          personId: submitData.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
