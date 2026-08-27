/**
 * WebMCP tools for buybefore.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;
  var data = global.BrightWorkWebMCPData;

  if (!core || !shared || !lead || !data) return;

  core.pingReady({ page: 'buybefore', program: lead.LEAD_TAG });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'buybefore' };
  var BUYBEFORE_PROGRAM = data.PROGRAMS_BY_SLUG.buybefore;

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
        var submitData = await lead.submit({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phone: args.phone
        }, { viaWebMcp: true });

        return core.jsonResult({
          success: true,
          message: 'Request received. Ben will follow up about buy-before-you-sell options for your situation.',
          personId: submitData.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
