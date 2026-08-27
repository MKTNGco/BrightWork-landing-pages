/**
 * BrightWork WebMCP core utilities.
 * Feature-detects modelContext (navigator or document) and wraps tool execute()
 * with PostHog tracking. Reusable across program landing pages.
 */
(function (global) {
  'use strict';

  function getModelContext() {
    if (global.navigator && global.navigator.modelContext) {
      return global.navigator.modelContext;
    }
    if (global.document && global.document.modelContext) {
      return global.document.modelContext;
    }
    return null;
  }

  function isWebMcpSupported() {
    return getModelContext() !== null;
  }

  function trackToolCall(toolName, success, extra) {
    var props = {
      tool_name: toolName,
      success: success
    };
    if (extra) {
      for (var key in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, key)) {
          props[key] = extra[key];
        }
      }
    }
    if (typeof global.posthog !== 'undefined') {
      global.posthog.capture('webmcp_tool_called', props);
    }
  }

  function pingReady(meta) {
    if (typeof global.posthog !== 'undefined') {
      global.posthog.capture('webmcp_ready', {
        supported: isWebMcpSupported(),
        page: meta && meta.page ? meta.page : null,
        program: meta && meta.program ? meta.program : null
      });
    }
  }

  function textResult(text) {
    return {
      content: [{ type: 'text', text: String(text) }]
    };
  }

  function jsonResult(data) {
    return textResult(JSON.stringify(data, null, 2));
  }

  function wrapExecute(toolName, executeFn, meta) {
    return async function (args, agent) {
      try {
        var result = await executeFn(args, agent);
        trackToolCall(toolName, true, meta);
        return result;
      } catch (err) {
        trackToolCall(toolName, false, Object.assign({}, meta, {
          error: err && err.message ? err.message : 'unknown_error'
        }));
        throw err;
      }
    };
  }

  function registerTools(tools, meta) {
    var ctx = getModelContext();
    if (!ctx || typeof ctx.registerTool !== 'function') return false;

    tools.forEach(function (tool) {
      ctx.registerTool({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        execute: wrapExecute(tool.name, tool.execute, meta)
      });
    });

    return true;
  }

  global.BrightWorkWebMCP = {
    getModelContext: getModelContext,
    isSupported: isWebMcpSupported,
    pingReady: pingReady,
    registerTools: registerTools,
    textResult: textResult,
    jsonResult: jsonResult,
    trackToolCall: trackToolCall
  };
})(typeof window !== 'undefined' ? window : globalThis);
