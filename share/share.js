'use strict';

const APP_STORE_URL = window.YORMIO_CONFIG?.appStoreUrl || '';
const GOOGLE_PLAY_URL = window.YORMIO_CONFIG?.googlePlayUrl || '';
const TOKEN_PATTERN = /^[0-9a-f]{64}$/i;

const TRANSLATIONS = {
  en: {
    title: 'Shared checklist — Yormio',
    metaDescription: 'Open a checklist shared with you in Yormio.',
    home: 'Yormio home',
    eyebrow: 'Shared checklist',
    heading: 'A checklist was shared with you',
    description: 'Open it in Yormio to preview and add your own copy.',
    open: 'Open in Yormio',
    openNote: 'The Yormio app is required to preview this shared checklist.',
    downloadTitle: 'Don’t have Yormio yet?',
    downloadCopy: 'After installing, open this shared link again to continue.',
    appStore: 'Download on the',
    googlePlay: 'Get it on',
    storesUnavailable: 'Store links will be available when Yormio is published.',
    installedNote: 'After installing Yormio, open this shared link again to continue.',
    invalidLink: 'This checklist link is unavailable. Ask the sender to create a new link.',
    invalidDownloads: 'Downloads are disabled because this shared checklist link is unavailable.',
    privacy: 'Privacy',
    terms: 'Terms',
    support: 'Support',
  },
  tr: {
    title: 'Paylaşılan kontrol listesi — Yormio',
    metaDescription: 'Sizinle paylaşılan kontrol listesini Yormio’da açın.',
    home: 'Yormio ana sayfası',
    eyebrow: 'Paylaşılan kontrol listesi',
    heading: 'Sizinle bir kontrol listesi paylaşıldı',
    description: 'Önizlemek ve kendi kopyanızı eklemek için Yormio’da açın.',
    open: 'Yormio’da aç',
    openNote: 'Bu paylaşılan kontrol listesini önizlemek için Yormio uygulaması gereklidir.',
    downloadTitle: 'Henüz Yormio’nuz yok mu?',
    downloadCopy: 'Yükledikten sonra devam etmek için bu paylaşım bağlantısını yeniden açın.',
    appStore: 'İndirin:',
    googlePlay: 'Edinin:',
    storesUnavailable: 'Mağaza bağlantıları Yormio yayınlandığında kullanılabilir olacak.',
    installedNote: 'Yormio’yu yükledikten sonra devam etmek için bu paylaşım bağlantısını yeniden açın.',
    invalidLink: 'Bu kontrol listesi bağlantısı kullanılamıyor. Gönderenden yeni bir bağlantı oluşturmasını isteyin.',
    invalidDownloads: 'Bu paylaşılan kontrol listesi bağlantısı kullanılamadığı için indirmeler devre dışı.',
    privacy: 'Gizlilik',
    terms: 'Kullanım koşulları',
    support: 'Destek',
  },
  de: {
    title: 'Geteilte Checkliste — Yormio',
    metaDescription: 'Öffne eine mit dir geteilte Checkliste in Yormio.',
    home: 'Yormio-Startseite',
    eyebrow: 'Geteilte Checkliste',
    heading: 'Eine Checkliste wurde mit dir geteilt',
    description: 'Öffne sie in Yormio, um eine Vorschau anzusehen und deine eigene Kopie hinzuzufügen.',
    open: 'In Yormio öffnen',
    openNote: 'Du benötigst die Yormio-App, um eine Vorschau dieser geteilten Checkliste anzusehen.',
    downloadTitle: 'Du hast Yormio noch nicht?',
    downloadCopy: 'Öffne diesen Freigabelink nach der Installation erneut, um fortzufahren.',
    appStore: 'Laden im',
    googlePlay: 'Jetzt bei',
    storesUnavailable: 'Die Store-Links sind verfügbar, sobald Yormio veröffentlicht wurde.',
    installedNote: 'Öffne diesen Freigabelink nach der Installation von Yormio erneut, um fortzufahren.',
    invalidLink: 'Dieser Checklisten-Link ist nicht verfügbar. Bitte den Absender, einen neuen Link zu erstellen.',
    invalidDownloads: 'Downloads sind deaktiviert, da dieser Link zur geteilten Checkliste nicht verfügbar ist.',
    privacy: 'Datenschutz',
    terms: 'Nutzungsbedingungen',
    support: 'Hilfe',
  },
  sv: {
    title: 'Delad checklista — Yormio',
    metaDescription: 'Öppna en checklista som delats med dig i Yormio.',
    home: 'Yormios startsida',
    eyebrow: 'Delad checklista',
    heading: 'En checklista har delats med dig',
    description: 'Öppna den i Yormio för att förhandsgranska och lägga till en egen kopia.',
    open: 'Öppna i Yormio',
    openNote: 'Du behöver Yormio-appen för att förhandsgranska den delade checklistan.',
    downloadTitle: 'Har du inte Yormio än?',
    downloadCopy: 'Öppna den här delningslänken igen efter installationen för att fortsätta.',
    appStore: 'Hämta i',
    googlePlay: 'Hämta på',
    storesUnavailable: 'Butikslänkarna blir tillgängliga när Yormio har publicerats.',
    installedNote: 'Öppna den här delningslänken igen efter att du installerat Yormio för att fortsätta.',
    invalidLink: 'Den här checklistans länk är inte tillgänglig. Be avsändaren att skapa en ny länk.',
    invalidDownloads: 'Nedladdningar är inaktiverade eftersom länken till den delade checklistan inte är tillgänglig.',
    privacy: 'Integritet',
    terms: 'Användarvillkor',
    support: 'Hjälp',
  },
};

function selectLanguage() {
  const preferences = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const preference of preferences) {
    const language = String(preference || '').trim().toLowerCase().split(/[-_]/)[0];
    if (Object.hasOwn(TRANSLATIONS, language)) return language;
  }

  return 'en';
}

const language = selectLanguage();
const messages = TRANSLATIONS[language];
document.documentElement.lang = language;
document.title = messages.title;

document.querySelectorAll('[data-i18n]').forEach((element) => {
  element.textContent = messages[element.dataset.i18n];
});
document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
  element.setAttribute('aria-label', messages[element.dataset.i18nAriaLabel]);
});
document.querySelectorAll('[data-i18n-content]').forEach((element) => {
  element.setAttribute('content', messages[element.dataset.i18nContent]);
});

const openButton = document.getElementById('open-yormio');
const statusPanel = document.getElementById('status-panel');
const statusMessage = document.getElementById('status-message');
const appStoreLink = document.getElementById('app-store-link');
const googlePlayLink = document.getElementById('google-play-link');
const storeNote = document.getElementById('store-note');

const rawHash = window.location.hash.startsWith('#')
  ? window.location.hash.slice(1)
  : '';
const token = TOKEN_PATTERN.test(rawHash) ? rawHash : null;

function isConfiguredHttpsUrl(value) {
  if (!value || value === '...') return false;

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function disableStoreLink(link) {
  link.removeAttribute('href');
  link.removeAttribute('target');
  link.setAttribute('aria-disabled', 'true');
  link.setAttribute('tabindex', '-1');
}

function enableStoreLink(link, url) {
  link.href = url;
  link.target = '_blank';
  link.rel = 'noreferrer noopener';
  link.setAttribute('aria-disabled', 'false');
  link.removeAttribute('tabindex');
}

function showUnavailableState() {
  openButton.disabled = true;
  statusMessage.textContent = messages.invalidLink;
  statusPanel.hidden = false;
  disableStoreLink(appStoreLink);
  disableStoreLink(googlePlayLink);
  storeNote.textContent = messages.invalidDownloads;
}

function configureValidState() {
  openButton.disabled = false;
  statusPanel.hidden = true;

  openButton.addEventListener('click', () => {
    window.location.href = `yormio://share/${token}`;
  });

  const appStoreReady = isConfiguredHttpsUrl(APP_STORE_URL);
  const googlePlayReady = isConfiguredHttpsUrl(GOOGLE_PLAY_URL);

  if (appStoreReady) enableStoreLink(appStoreLink, APP_STORE_URL);
  else disableStoreLink(appStoreLink);

  if (googlePlayReady) enableStoreLink(googlePlayLink, GOOGLE_PLAY_URL);
  else disableStoreLink(googlePlayLink);

  if (appStoreReady || googlePlayReady) {
    storeNote.textContent = messages.installedNote;
  }
}

if (token) configureValidState();
else showUnavailableState();
