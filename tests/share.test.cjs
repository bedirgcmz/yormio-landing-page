const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

const root = resolve(__dirname, '..');
const html = readFileSync(resolve(root, 'share/index.html'), 'utf8');
const script = readFileSync(resolve(root, 'share/share.js'), 'utf8');
const config = readFileSync(resolve(root, 'config.js'), 'utf8');
const sampleToken = 'aB01'.repeat(16);

// Run the shipped scripts against the actual HTML's elements without dependencies.
function render(languages, hash = `#${sampleToken}`, options = {}) {
  const elements = [...html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)].map((match) => {
    const attributes = Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)]
      .map((attribute) => [attribute[1], attribute[2]]));
    const listeners = {};
    const element = {
      attributes,
      dataset: Object.fromEntries(Object.entries(attributes)
        .filter(([key]) => key.startsWith('data-'))
        .map(([key, value]) => [key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase()), value])),
      textContent: '',
      disabled: /\bdisabled\b/.test(match[2]),
      hidden: /\bhidden\b/.test(match[2]),
      setAttribute(key, value) { attributes[key] = value; },
      removeAttribute(key) { delete attributes[key]; },
      addEventListener(name, callback) { listeners[name] = callback; },
      click() { if (!this.disabled) listeners.click?.(); },
    };
    return element;
  });
  const document = {
    documentElement: {},
    title: '',
    getElementById: (id) => elements.find((element) => element.attributes.id === id),
    querySelectorAll: (selector) => elements.filter((element) => Object.hasOwn(element.attributes, selector.slice(1, -1))),
  };
  const location = { hash, href: `https://example.test/share${hash}` };
  const context = vm.createContext({
    window: { location }, document,
    navigator: { languages, language: options.language }, URL,
    // Any attempt to send a request or log in the production script fails the test.
    fetch() { throw new Error('Unexpected network request'); },
    console: new Proxy({}, { get() { throw new Error('Unexpected logging'); } }),
  });
  vm.runInContext(config, context);
  if (options.noStores) vm.runInContext('window.YORMIO_CONFIG = {};', context);
  vm.runInContext(script, context);
  return {
    document, location, elements,
    get: document.getElementById,
    messages: vm.runInContext('messages', context),
    translations: vm.runInContext('TRANSLATIONS', context),
  };
}

const headings = {
  en: 'A checklist was shared with you',
  tr: 'Sizinle bir kontrol listesi paylaşıldı',
  de: 'Eine Checkliste wurde mit dir geteilt',
  sv: 'En checklista har delats med dig',
};

for (const [locale, language] of [['en-US', 'en'], ['tr-TR', 'tr'], ['de-DE', 'de'], ['sv-SE', 'sv']]) {
  test(`${locale}: localizes content, metadata, accessibility and valid-link behavior`, () => {
    const page = render([locale]);
    assert.equal(page.document.documentElement.lang, language);
    assert.equal(page.document.title, page.messages.title);
    assert.equal(page.get('share-title').textContent, headings[language]);
    for (const element of page.elements) {
      if (element.dataset.i18n) {
        const key = element.attributes.id === 'store-note' ? 'installedNote' : element.dataset.i18n;
        assert.equal(element.textContent, page.messages[key]);
      }
      if (element.dataset.i18nAriaLabel) assert.equal(element.attributes['aria-label'], page.messages[element.dataset.i18nAriaLabel]);
      if (element.dataset.i18nContent) assert.equal(element.attributes.content, page.messages[element.dataset.i18nContent]);
    }
    for (const translation of Object.values(page.translations)) {
      assert.deepEqual(Object.keys(translation).sort(), Object.keys(page.translations.en).sort());
      assert.ok(Object.values(translation).every((value) => typeof value === 'string' && value.length));
    }
    assert.equal(page.get('open-yormio').disabled, false);
    assert.equal(page.get('status-panel').hidden, true);
    assert.equal(page.get('store-note').textContent, page.messages.installedNote);
    assert.equal(page.get('app-store-link').href, 'https://apps.apple.com/app/yormio/id6812642125');
    assert.equal(page.get('google-play-link').href, 'https://play.google.com/store/apps/details?id=com.yormio.app');
    assert.equal(page.location.href, `https://example.test/share#${sampleToken}`);
    page.get('open-yormio').click();
    assert.equal(page.location.href, `yormio://share/${sampleToken}`);
    for (const element of page.elements) {
      assert.ok(!JSON.stringify(element.attributes).includes(sampleToken));
      assert.ok(!element.textContent.includes(sampleToken));
    }
  });

  test(`${locale}: invalid and missing fragments disable all actions with localized messages`, () => {
    for (const hash of ['', '#', '#invalid', '#%61'.repeat(64), `#${'a'.repeat(63)}`, `#${'a'.repeat(65)}`, `#${'g'.repeat(64)}`, `#${sampleToken}?extra=1`]) {
      const page = render([locale], hash);
      assert.equal(page.document.documentElement.lang, language);
      assert.equal(page.get('open-yormio').disabled, true);
      assert.equal(page.get('status-panel').hidden, false);
      assert.equal(page.get('status-message').textContent, page.messages.invalidLink);
      assert.equal(page.get('store-note').textContent, page.messages.invalidDownloads);
      for (const id of ['app-store-link', 'google-play-link']) {
        assert.equal(page.get(id).attributes['aria-disabled'], 'true');
        assert.equal(page.get(id).attributes.tabindex, '-1');
        assert.equal(page.get(id).href, undefined);
      }
      page.get('open-yormio').click();
      assert.equal(page.location.href, `https://example.test/share${hash}`);
    }
  });
}

test('uses the first supported preference and normalizes regional codes and casing', () => {
  for (const [languages, expected] of [
    [['fr-FR', 'de-DE', 'tr-TR'], 'de'],
    [['sv-SE', 'en-US'], 'sv'],
    [['en-US', 'tr-TR'], 'en'],
    [['fr', 'TR-tr', 'sv'], 'tr'],
    [[' SV_se ', 'de'], 'sv'],
    [['toString', 'constructor', 'de-AT'], 'de'],
  ]) assert.equal(render(languages).document.documentElement.lang, expected);
});

test('falls back to English when no preference is supported', () => {
  for (const languages of [['fr-FR', 'es-ES'], [], undefined]) {
    const page = render(languages);
    assert.equal(page.document.documentElement.lang, 'en');
    assert.equal(page.get('share-title').textContent, headings.en);
  }
  assert.equal(render(['fr'], '#bad').get('status-message').textContent, render(['en'], '#bad').messages.invalidLink);
});

test('uses navigator.language only when navigator.languages is absent or empty', () => {
  assert.equal(render([], undefined, { language: 'de-DE' }).document.documentElement.lang, 'de');
  assert.equal(render(undefined, undefined, { language: 'tr-TR' }).document.documentElement.lang, 'tr');
  assert.equal(render(['fr'], undefined, { language: 'sv-SE' }).document.documentElement.lang, 'en');
});

test('unconfigured stores keep a localized availability note in every language', () => {
  for (const language of Object.keys(headings)) {
    const page = render([language], undefined, { noStores: true });
    assert.equal(page.get('store-note').textContent, page.messages.storesUnavailable);
    assert.equal(page.get('app-store-link').attributes['aria-disabled'], 'true');
    assert.equal(page.get('google-play-link').attributes['aria-disabled'], 'true');
  }
});

test('retains fragment privacy and static, same-origin localization assets', () => {
  assert.match(html, /connect-src 'none'/);
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.doesNotMatch(script, /location\.(?:search|pathname)|fetch\s*\(|XMLHttpRequest|sendBeacon|console\./);
  assert.deepEqual([...html.matchAll(/<script src="([^"]+)"/g)].map((match) => match[1]), ['/config.js', '/share/share.js']);
});
