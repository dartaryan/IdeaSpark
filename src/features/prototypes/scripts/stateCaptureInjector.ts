// src/features/prototypes/scripts/stateCaptureInjector.ts
//
// Generates the state capture script that is injected into the Sandpack iframe.
// The script monitors route changes, form fields, component states, and localStorage.
// It sends captured state to the parent window via postMessage.
//
// IMPORTANT: This file exports a _string_ containing JavaScript to be injected,
// NOT code that runs directly in the host app. The script runs inside the iframe.

import { PROTOTYPE_STATE_VERSION } from '../types/prototypeState';

/** Debounce interval for state capture (ms) */
const CAPTURE_DEBOUNCE_MS = 500;

/** Keys to exclude from localStorage capture */
const EXCLUDED_LS_PREFIXES = ['__sandpack__', '_debug_'];

/** Maximum localStorage value size for a single key (50KB) */
const MAX_LS_VALUE_SIZE = 50 * 1024;

/**
 * Sanitize a string for safe embedding inside a JavaScript single-quoted literal.
 * Escapes backslashes, single quotes, newlines, and other control characters.
 */
function sanitizeForJsString(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Generate the state capture injection script as a string.
 * This script is meant to be injected into a Sandpack iframe and executed there.
 *
 * @param prototypeId - The prototype UUID (passed so the captured state is tagged)
 * @returns JavaScript source code string to inject
 */
export function generateStateCaptureScript(prototypeId: string): string {
  // Sanitize prototypeId to prevent script injection via crafted IDs
  const safePrototypeId = sanitizeForJsString(prototypeId);

  // We embed the constants directly in the script string.
  return `
(function() {
  'use strict';

  // ---------- Configuration ----------
  var DEBOUNCE_MS = ${CAPTURE_DEBOUNCE_MS};
  var STATE_VERSION = '${PROTOTYPE_STATE_VERSION}';
  var PROTOTYPE_ID = '${safePrototypeId}';
  var EXCLUDED_LS_PREFIXES = ${JSON.stringify(EXCLUDED_LS_PREFIXES)};
  var MAX_LS_VALUE_SIZE = ${MAX_LS_VALUE_SIZE};

  // ---------- Capture state object ----------
  var captureTimer = null;
  var observer = null;

  // ---------- Route capture (AC #3) ----------
  function captureRoute() {
    try {
      return {
        pathname: window.location.pathname || '/',
        search: window.location.search || '',
        hash: window.location.hash || '',
        state: (window.history && window.history.state) ? window.history.state : null
      };
    } catch (e) {
      return { pathname: '/', search: '', hash: '', state: null };
    }
  }

  // ---------- Form field capture (AC #4) ----------
  function captureForms() {
    var forms = {};
    try {
      var fields = document.querySelectorAll('input, textarea, select');
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];

        // Skip sensitive fields
        if (field.type === 'password') continue;
        if (field.dataset && field.dataset.noCapture !== undefined) continue;

        // Determine key: prefer name, then id, then generate from index
        var key = field.name || field.id || ('field-' + field.tagName.toLowerCase() + '-' + i);

        if (field.tagName === 'SELECT') {
          var selectedOpts = [];
          for (var j = 0; j < field.options.length; j++) {
            if (field.options[j].selected) {
              selectedOpts.push(field.options[j].value);
            }
          }
          forms[key] = {
            value: field.multiple ? selectedOpts : field.value,
            type: 'select',
            selectedOptions: selectedOpts
          };
        } else if (field.type === 'checkbox') {
          forms[key] = {
            value: field.checked,
            type: 'checkbox',
            checked: field.checked
          };
        } else if (field.type === 'radio') {
          // Only capture the checked radio in a group
          if (field.checked) {
            forms[key] = {
              value: field.value,
              type: 'radio',
              checked: true
            };
          }
        } else {
          forms[key] = {
            value: field.value || '',
            type: field.type || 'text'
          };
        }
      }
    } catch (e) {
      // Silently fail - don't crash prototype
    }
    return forms;
  }

  // ---------- Component state capture (AC #2, #4) ----------
  function captureComponents() {
    var components = {};
    try {
      // Capture toggles/switches via aria-checked or data-state
      var toggles = document.querySelectorAll('[role="switch"], [aria-checked]');
      for (var i = 0; i < toggles.length; i++) {
        var toggle = toggles[i];
        var tKey = toggle.id || toggle.getAttribute('aria-label') || ('toggle-' + i);
        components[tKey] = {
          type: 'toggle',
          state: toggle.getAttribute('aria-checked') === 'true' ||
                 toggle.getAttribute('data-state') === 'checked'
        };
      }

      // Capture modals/dialogs
      var dialogs = document.querySelectorAll('dialog, [role="dialog"], [role="alertdialog"]');
      for (var j = 0; j < dialogs.length; j++) {
        var dialog = dialogs[j];
        var dKey = dialog.id || ('dialog-' + j);
        var isOpen = dialog.hasAttribute('open') ||
                     dialog.getAttribute('aria-hidden') !== 'true';
        components[dKey] = { type: 'modal', state: isOpen };
      }

      // Capture accordions/collapsibles via details/summary
      var details = document.querySelectorAll('details');
      for (var k = 0; k < details.length; k++) {
        var detail = details[k];
        var aKey = detail.id || ('accordion-' + k);
        components[aKey] = {
          type: 'accordion',
          state: detail.hasAttribute('open')
        };
      }

      // Capture tab panels (active tab)
      var tabs = document.querySelectorAll('[role="tab"]');
      for (var l = 0; l < tabs.length; l++) {
        var tab = tabs[l];
        if (tab.getAttribute('aria-selected') === 'true') {
          var tabKey = tab.getAttribute('aria-controls') ||
                       tab.id || ('tab-' + l);
          components[tabKey] = {
            type: 'tabs',
            state: tab.textContent || tab.id || String(l)
          };
        }
      }

      // Capture elements with data-persist-state attribute (opt-in)
      var persistEls = document.querySelectorAll('[data-persist-state]');
      for (var m = 0; m < persistEls.length; m++) {
        var el = persistEls[m];
        var pKey = el.id || el.getAttribute('data-persist-state') || ('persist-' + m);
        var pState = el.getAttribute('data-state') ||
                     el.getAttribute('aria-expanded') ||
                     el.getAttribute('aria-checked') ||
                     String(el.classList.contains('active'));
        components[pKey] = {
          type: el.getAttribute('data-persist-state') || 'custom',
          state: pState,
          attributes: { tagName: el.tagName.toLowerCase() }
        };
      }
    } catch (e) {
      // Silently fail
    }
    return components;
  }

  // ---------- localStorage capture (AC #5) ----------
  function captureLocalStorage() {
    var ls = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (!key) continue;

        // Exclude internal keys
        var excluded = false;
        for (var j = 0; j < EXCLUDED_LS_PREFIXES.length; j++) {
          if (key.indexOf(EXCLUDED_LS_PREFIXES[j]) === 0) {
            excluded = true;
            break;
          }
        }
        if (excluded) continue;

        var val = localStorage.getItem(key);
        if (val !== null && val.length <= MAX_LS_VALUE_SIZE) {
          ls[key] = val;
        }
      }
    } catch (e) {
      // Silently fail (e.g., SecurityError in some contexts)
    }
    return ls;
  }

  // ---------- Full state capture ----------
  function captureAndSend(method) {
    var start = typeof performance !== 'undefined' ? performance.now() : Date.now();

    var state = {
      version: STATE_VERSION,
      timestamp: new Date().toISOString(),
      prototypeId: PROTOTYPE_ID,
      route: captureRoute(),
      forms: captureForms(),
      components: captureComponents(),
      localStorage: captureLocalStorage(),
      metadata: {
        captureDurationMs: 0,
        serializedSizeBytes: 0,
        capturedAt: new Date().toISOString(),
        captureMethod: method || 'auto'
      }
    };

    // Measure performance
    var duration = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - start;
    state.metadata.captureDurationMs = Math.round(duration * 100) / 100;

    try {
      var serialized = JSON.stringify(state);
      // Use TextEncoder for accurate UTF-8 byte count (handles multi-byte chars)
      state.metadata.serializedSizeBytes = typeof TextEncoder !== 'undefined'
        ? new TextEncoder().encode(serialized).length
        : serialized.length;

      // Warn if state is large (>100KB)
      if (serialized.length > 102400) {
        console.warn('[StateCapture] State size (' + serialized.length + ' bytes) exceeds 100KB');
      }

      // Send to parent.
      // NOTE: We use '*' as targetOrigin because the Sandpack iframe doesn't
      // reliably know the parent origin (it varies across bundler/CDN hosts).
      // Security is enforced on the RECEIVER side (useSandpackStateBridge)
      // which validates message origin before processing.
      parent.postMessage({
        type: 'PROTOTYPE_STATE_UPDATE',
        payload: state,
        source: 'sandpack-state-capture'
      }, '*');
    } catch (e) {
      console.debug('[StateCapture] Failed to send state:', e);
    }
  }

  // ---------- Debounced capture ----------
  function scheduleCapture() {
    if (captureTimer) clearTimeout(captureTimer);
    captureTimer = setTimeout(function() {
      captureAndSend('auto');
    }, DEBOUNCE_MS);
  }

  // ---------- Event listeners ----------

  // Form input changes
  document.addEventListener('input', scheduleCapture, { passive: true });
  document.addEventListener('change', scheduleCapture, { passive: true });

  // Route changes
  window.addEventListener('popstate', scheduleCapture);
  window.addEventListener('hashchange', scheduleCapture);

  // Intercept pushState/replaceState for SPA route detection
  var originalPushState = history.pushState;
  var originalReplaceState = history.replaceState;

  history.pushState = function() {
    originalPushState.apply(this, arguments);
    scheduleCapture();
  };

  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    scheduleCapture();
  };

  // MutationObserver for dynamic content changes (new forms, toggles, etc.)
  if (typeof MutationObserver !== 'undefined') {
    observer = new MutationObserver(function(mutations) {
      var hasRelevantChange = false;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (m.type === 'childList' && m.addedNodes.length > 0) {
          hasRelevantChange = true;
          break;
        }
        if (m.type === 'attributes') {
          var attr = m.attributeName;
          if (attr === 'aria-checked' || attr === 'aria-selected' ||
              attr === 'aria-expanded' || attr === 'aria-hidden' ||
              attr === 'open' || attr === 'data-state') {
            hasRelevantChange = true;
            break;
          }
        }
      }
      if (hasRelevantChange) {
        scheduleCapture();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-checked', 'aria-selected', 'aria-expanded',
                        'aria-hidden', 'open', 'data-state']
    });
  }

  // ---------- State restoration handler (Story 8.3) ----------
  window.addEventListener('message', function(event) {
    if (!event.data || event.data.type !== 'RESTORE_STATE' || event.data.source !== 'ideaspark-parent') {
      return;
    }

    var state = event.data.payload;
    try {
      // 1. Restore route state
      if (state.route && state.route.pathname && state.route.pathname !== window.location.pathname) {
        try {
          var routeUrl = state.route.pathname + (state.route.search || '') + (state.route.hash || '');
          history.pushState(state.route.state || null, '', routeUrl);
        } catch (routeErr) {
          console.debug('[StateCapture] Route restoration failed:', routeErr);
        }
      }

      // 2. Restore form fields
      if (state.forms && typeof state.forms === 'object') {
        var fieldKeys = Object.keys(state.forms);
        for (var fi = 0; fi < fieldKeys.length; fi++) {
          var fieldKey = fieldKeys[fi];
          var fieldData = state.forms[fieldKey];
          try {
            // Sanitize fieldKey for safe CSS selector usage (review fix M2)
            var safeKey = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(fieldKey) : fieldKey.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^{|}~])/g, '\\\\$1');
            var field = document.querySelector('[name="' + safeKey + '"], #' + safeKey);
            if (field) {
              if (fieldData.type === 'checkbox' || fieldData.type === 'radio') {
                field.checked = fieldData.checked || false;
              } else if (fieldData.type === 'select' && field.tagName === 'SELECT') {
                if (Array.isArray(fieldData.selectedOptions)) {
                  for (var si = 0; si < field.options.length; si++) {
                    field.options[si].selected = fieldData.selectedOptions.indexOf(field.options[si].value) >= 0;
                  }
                } else {
                  field.value = String(fieldData.value);
                }
              } else {
                field.value = String(fieldData.value || '');
              }
              // Trigger input event so frameworks detect the change
              field.dispatchEvent(new Event('input', { bubbles: true }));
              field.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } catch (fieldErr) {
            console.debug('[StateCapture] Form field restoration failed for key:', fieldKey, fieldErr);
          }
        }
      }

      // 3. Restore localStorage
      if (state.localStorage && typeof state.localStorage === 'object') {
        var lsKeys = Object.keys(state.localStorage);
        for (var li = 0; li < lsKeys.length; li++) {
          try {
            localStorage.setItem(lsKeys[li], state.localStorage[lsKeys[li]]);
          } catch (lsErr) {
            console.debug('[StateCapture] localStorage restoration failed for key:', lsKeys[li], lsErr);
          }
        }
      }

      // 4. Restore component states via custom events
      if (state.components && typeof state.components === 'object') {
        var compKeys = Object.keys(state.components);
        for (var ci = 0; ci < compKeys.length; ci++) {
          try {
            window.dispatchEvent(new CustomEvent('restore-component-state', {
              detail: { key: compKeys[ci], state: state.components[compKeys[ci]] }
            }));
          } catch (compErr) {
            console.debug('[StateCapture] Component state restoration failed for key:', compKeys[ci], compErr);
          }
        }
      }

      // 5. Send success acknowledgment
      parent.postMessage({
        type: 'RESTORE_STATE_ACK',
        success: true,
        source: 'sandpack-state-capture'
      }, '*');
    } catch (e) {
      // 6. Send error acknowledgment
      console.debug('[StateCapture] State restoration error:', e);
      parent.postMessage({
        type: 'RESTORE_STATE_ACK',
        success: false,
        error: String(e),
        source: 'sandpack-state-capture'
      }, '*');
    }
  });

  // ---------- Initial capture after DOM settles ----------
  setTimeout(function() {
    captureAndSend('auto');
  }, 1000);

  // ---------- Cleanup on unload ----------
  window.addEventListener('beforeunload', function() {
    captureAndSend('beforeUnload');
    if (observer) observer.disconnect();
  });
})();
`;
}

/**
 * Check whether the state capture script has already been injected.
 * Uses a global flag set by the injected script itself.
 *
 * NOTE: Not used inside the generated script (which is self-contained),
 * but by the host-side injection logic (SandpackLivePreview) to prevent
 * double-injection.
 */
export const STATE_CAPTURE_INJECTED_FLAG = '__IDEASPARK_STATE_CAPTURE_INJECTED__';

/**
 * Wrap the state capture script with a guard to prevent double-injection.
 */
export function generateGuardedStateCaptureScript(prototypeId: string): string {
  return `
if (!window.${STATE_CAPTURE_INJECTED_FLAG}) {
  window.${STATE_CAPTURE_INJECTED_FLAG} = true;
  ${generateStateCaptureScript(prototypeId)}
}
`;
}
