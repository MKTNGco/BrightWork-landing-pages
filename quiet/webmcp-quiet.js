/**
 * WebMCP tools for quiet.brightworkrealty.com
 */
(function (global) {
  'use strict';

  var core = global.BrightWorkWebMCP;
  var shared = global.BrightWorkWebMCPShared;
  var lead = global.BrightWorkLead;
  var data = global.BrightWorkWebMCPData;

  if (!core || !shared || !lead || !data) return;

  core.pingReady({ page: 'quiet', program: lead.LEAD_TAG });

  if (!core.isSupported()) return;

  var PROGRAM_META = { program: lead.LEAD_TAG, page: 'quiet' };
  var QUIET_PROGRAM = data.PROGRAMS_BY_SLUG.quiet;

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
        var submitData = await lead.submit({
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          phone: args.phone
        }, { viaWebMcp: true });

        return core.jsonResult({
          success: true,
          message: 'Request received. Ben will follow up about whether a quiet listing fits your situation.',
          personId: submitData.personId || null,
          source: 'WebMCP / agent'
        });
      }
    }
  ], PROGRAM_META);
})(typeof window !== 'undefined' ? window : globalThis);
