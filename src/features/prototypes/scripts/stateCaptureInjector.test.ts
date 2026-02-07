// src/features/prototypes/scripts/stateCaptureInjector.test.ts

import { describe, it, expect } from 'vitest';
import {
  generateStateCaptureScript,
  generateGuardedStateCaptureScript,
  STATE_CAPTURE_INJECTED_FLAG,
} from './stateCaptureInjector';
import { PROTOTYPE_STATE_VERSION } from '../types/prototypeState';

describe('generateStateCaptureScript', () => {
  it('returns a non-empty string', () => {
    const script = generateStateCaptureScript('proto-123');
    expect(typeof script).toBe('string');
    expect(script.length).toBeGreaterThan(100);
  });

  it('contains the prototype id', () => {
    const script = generateStateCaptureScript('my-proto-uuid');
    expect(script).toContain('my-proto-uuid');
  });

  it('contains the state version constant', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain(PROTOTYPE_STATE_VERSION);
  });

  it('contains the PROTOTYPE_STATE_UPDATE message type', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('PROTOTYPE_STATE_UPDATE');
  });

  it('contains the sandpack-state-capture source', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('sandpack-state-capture');
  });

  it('contains postMessage call to parent', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('parent.postMessage');
  });

  it('includes route capture logic', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('captureRoute');
    expect(script).toContain('pathname');
    expect(script).toContain('history.pushState');
    expect(script).toContain('popstate');
  });

  it('includes form capture logic', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('captureForms');
    expect(script).toContain('input');
    expect(script).toContain('textarea');
    expect(script).toContain('select');
  });

  it('excludes password fields', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain("field.type === 'password'");
  });

  it('respects data-no-capture attribute', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('noCapture');
  });

  it('includes component state capture logic', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('captureComponents');
    expect(script).toContain('aria-checked');
    expect(script).toContain('aria-selected');
    expect(script).toContain('data-persist-state');
  });

  it('includes localStorage capture logic', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('captureLocalStorage');
    expect(script).toContain('localStorage');
    expect(script).toContain('__sandpack__');
    expect(script).toContain('_debug_');
  });

  it('includes debouncing logic', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('scheduleCapture');
    expect(script).toContain('clearTimeout');
    expect(script).toContain('setTimeout');
  });

  it('includes performance measurement', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('performance.now');
    expect(script).toContain('captureDurationMs');
    expect(script).toContain('serializedSizeBytes');
  });

  it('includes 100KB size warning', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('102400');
    expect(script).toContain('exceeds 100KB');
  });

  it('includes MutationObserver for dynamic content', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('MutationObserver');
    expect(script).toContain('observer.observe');
  });

  it('includes beforeUnload handler', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('beforeunload');
    expect(script).toContain('beforeUnload');
  });

  it('includes initial capture with delay', () => {
    const script = generateStateCaptureScript('proto-1');
    // The initial capture uses setTimeout with 1000ms
    expect(script).toContain('1000');
  });

  it('wraps in an IIFE', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('(function()');
    expect(script).toContain('})()');
  });

  it('captures checkbox and radio states', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('checkbox');
    expect(script).toContain('radio');
    expect(script).toContain('checked');
  });

  it('captures select/multi-select options', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('selectedOpts');
    expect(script).toContain('multiple');
  });

  it('captures dialog/modal open state', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('dialog');
    expect(script).toContain('alertdialog');
  });

  it('captures accordion/details open state', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('details');
    expect(script).toContain('accordion');
  });

  it('captures tabs via aria-selected', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('role="tab"');
    expect(script).toContain('aria-selected');
  });

  it('intercepts pushState and replaceState', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('originalPushState');
    expect(script).toContain('originalReplaceState');
  });
});

describe('generateGuardedStateCaptureScript', () => {
  it('contains the guard flag check', () => {
    const script = generateGuardedStateCaptureScript('proto-1');
    expect(script).toContain(STATE_CAPTURE_INJECTED_FLAG);
  });

  it('prevents double injection', () => {
    const script = generateGuardedStateCaptureScript('proto-1');
    expect(script).toContain(`if (!window.${STATE_CAPTURE_INJECTED_FLAG})`);
    expect(script).toContain(`window.${STATE_CAPTURE_INJECTED_FLAG} = true`);
  });

  it('wraps the capture script inside the guard', () => {
    const script = generateGuardedStateCaptureScript('proto-1');
    expect(script).toContain('PROTOTYPE_STATE_UPDATE');
    expect(script).toContain('sandpack-state-capture');
  });
});

describe('STATE_CAPTURE_INJECTED_FLAG', () => {
  it('is a valid JavaScript identifier', () => {
    expect(STATE_CAPTURE_INJECTED_FLAG).toMatch(/^[A-Za-z_$][A-Za-z0-9_$]*$/);
  });
});

describe('prototypeId sanitization (XSS prevention)', () => {
  it('escapes single quotes in prototypeId', () => {
    const script = generateStateCaptureScript("proto-'; alert('xss');//");
    // The single quote should be escaped, not breaking out of the string literal
    expect(script).toContain("\\'");
    expect(script).not.toContain("alert('xss')");
  });

  it('escapes backslashes in prototypeId', () => {
    const script = generateStateCaptureScript('proto-with\\backslash');
    expect(script).toContain('\\\\');
  });

  it('escapes newlines in prototypeId', () => {
    const script = generateStateCaptureScript('proto\nwith\nnewlines');
    expect(script).toContain('\\n');
    // Should not contain a raw newline inside the PROTOTYPE_ID assignment
    const idLine = script.split('\n').find((l: string) => l.includes('PROTOTYPE_ID'));
    expect(idLine).toBeDefined();
    expect(idLine).not.toContain('proto\nwith');
  });

  it('handles a normal UUID safely', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    const script = generateStateCaptureScript(uuid);
    expect(script).toContain(uuid);
  });
});

describe('byte counting with TextEncoder', () => {
  it('includes TextEncoder-based byte counting', () => {
    const script = generateStateCaptureScript('proto-1');
    expect(script).toContain('TextEncoder');
  });
});
