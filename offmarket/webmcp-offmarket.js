/**
 * WebMCP tools for offmarket.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;
  var data = global.BrightWorkWebMCPData;

  if (!core || !shared || !lead || !data) return;

  core.pingReady({ page: 'offmarket', program: lead.LEAD_TAG });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'offmarket' };
  var OFFMARKET_PROGRAM = data.PROGRAMS_BY_SLUG.offmarket;

  shared.registerSharedTools(PROGRAM_META);

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
        var submitData = await lead.submit({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phone: args.phone
        }, { viaWebMcp: true });

        return core.jsonResult({
          success: true,
          message: 'Request received. BrightWork will text you when a new off-market property becomes available.',
          personId: submitData.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
