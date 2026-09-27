'use strict';

const APP_STORE_URL = '...';
const GOOGLE_PLAY_URL = '...';
const TOKEN_PATTERN = /^[0-9a-f]{64}$/i;

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
  statusMessage.textContent = 'This checklist link is unavailable. Ask the sender to create a new link.';
  statusPanel.hidden = false;
  disableStoreLink(appStoreLink);
  disableStoreLink(googlePlayLink);
  storeNote.textContent = 'Downloads are disabled because this shared checklist link is unavailable.';
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
    storeNote.textContent = 'After installing Yormio, open this shared link again to continue.';
  }
}

if (token) configureValidState();
else showUnavailableState();
