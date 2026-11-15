const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const source = readFileSync(resolve(__dirname, '../script.js'), 'utf8');

function element(attributes = {}) {
  const classes = new Set();
  const listeners = {};
  return {
    attributes, listeners, dataset: {},
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle(name, force = !classes.has(name)) { if (force) classes.add(name); else classes.delete(name); },
    },
    setAttribute(name, value) { attributes[name] = value; },
    getAttribute(name) { return attributes[name]; },
    addEventListener(name, callback) { listeners[name] = callback; },
    focus() { this.focused = true; },
  };
}

function load(withObserver = true) {
  const toggle = element({ 'aria-expanded': 'false' });
  const nav = element();
  const navLink = element();
  nav.querySelectorAll = () => [navLink];
  const filters = ['all', 'light', 'dark'].map((filter) => Object.assign(element(), { dataset: { filter } }));
  const cards = ['light', 'dark'].map((theme) => Object.assign(element(), { dataset: { theme } }));
  const reveals = [element(), element()];
  const stores = [element(), element()];
  const document = Object.assign(element(), {
    body: element(), documentElement: element(),
    querySelector: (selector) => ({
      '.nav-toggle': toggle, '.main-nav': nav,
      '[data-store="apple"]': stores[0], '[data-store="google"]': stores[1],
    })[selector] || null,
    querySelectorAll: (selector) => ({
      '.screen-filter': filters, '.screen-card': cards, '.reveal': reveals,
    })[selector] || [],
  });
  let intersection;
  const observed = [];
  const unobserved = [];
  class Observer {
    constructor(callback) { intersection = callback; }
    observe(target) { observed.push(target); }
    unobserve(target) { unobserved.push(target); }
  }
  const window = {
    YORMIO_CONFIG: { appStoreUrl: 'https://example.test/ios', googlePlayUrl: 'https://example.test/android' },
    addEventListener() {}, scrollY: 0,
    ...(withObserver ? { IntersectionObserver: Observer } : {}),
  };
  vm.runInNewContext(source, { window, document, IntersectionObserver: Observer });
  return { toggle, nav, navLink, document, filters, cards, stores, reveals, observed, unobserved,
    intersect: (...entries) => intersection(entries) };
}

test('mobile menu exposes its state, closes on Escape and restores focus', () => {
  const page = load();
  assert.ok(page.document.documentElement.classList.contains('nav-ready'));
  page.toggle.listeners.click();
  assert.equal(page.toggle.attributes['aria-expanded'], 'true');
  assert.equal(page.toggle.attributes['aria-label'], 'Close menu');
  assert.ok(page.nav.classList.contains('is-open'));
  page.document.listeners.keydown({ key: 'Escape' });
  assert.equal(page.toggle.attributes['aria-expanded'], 'false');
  assert.equal(page.toggle.attributes['aria-label'], 'Open menu');
  assert.equal(page.nav.classList.contains('is-open'), false);
  assert.equal(page.toggle.focused, true);
  page.toggle.listeners.click();
  page.navLink.listeners.click();
  assert.equal(page.document.body.classList.contains('nav-open'), false);
});

test('screenshot filters update both visible cards and accessible button state', () => {
  const page = load();
  page.filters[2].listeners.click();
  assert.deepEqual(page.filters.map((item) => item.attributes['aria-pressed']), ['false', 'false', 'true']);
  assert.deepEqual(page.cards.map((item) => item.classList.contains('is-filtered-out')), [true, false]);
  page.filters[0].listeners.click();
  assert.deepEqual(page.cards.map((item) => item.classList.contains('is-filtered-out')), [false, false]);
});

test('reveal animations still run with an observer and show content without one', () => {
  const page = load();
  assert.equal(page.observed.length, 2);
  page.intersect({ target: page.reveals[0], isIntersecting: true });
  assert.ok(page.reveals[0].classList.contains('is-visible'));
  assert.deepEqual(page.unobserved, [page.reveals[0]]);
  assert.ok(load(false).reveals.every((item) => item.classList.contains('is-visible')));
});

test('download buttons retain configured store URLs and safe new-tab behavior', () => {
  const { stores } = load();
  assert.deepEqual(stores.map((store) => store.href), ['https://example.test/ios', 'https://example.test/android']);
  assert.ok(stores.every((store) => store.target === '_blank' && store.rel === 'noopener noreferrer'));
});
