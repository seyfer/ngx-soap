import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

// Polyfill for setImmediate (required by httpntlm)
(global as any).setImmediate = (global as any).setImmediate || ((fn: any, ...args: any[]) => global.setTimeout(fn, 0, ...args));
(global as any).clearImmediate = (global as any).clearImmediate || ((id: any) => global.clearTimeout(id as any));

// Custom Jest matchers
Object.defineProperty(window, 'CSS', { value: null });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => {
    return {
      display: 'none',
      appearance: ['-webkit-appearance']
    };
  }
});

Object.defineProperty(document, 'doctype', {
  value: '<!DOCTYPE html>'
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true
    };
  }
});

