/**
 * Shared WebMCP tools and program facts for all BrightWork program pages.
 * Office and program catalog: shared/agent-source-data.mjs via webmcp-data.js
 */
(function (global) {
  'use strict';

  var data = global.BrightWorkWebMCPData;
  if (!data) return;

  var OFFICE_INFO = data.OFFICE_INFO;
  var PROGRAMS = data.PROGRAMS;
  var SHARED_TOOL_LIMITATIONS = data.SHARED_TOOL_LIMITATIONS;

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
