# Yormio

**Say it. Yormio remembers.**

Yormio is an AI-powered reminder and list app designed for fast capture. Speak naturally, paste text, or create items manually and Yormio turns everyday thoughts into structured reminders, checklists, and calendar-ready plans.

This repository contains the official **Yormio landing page**, built as a lightweight static website for Netlify.

## What Yormio does

- **Voice to reminder** — speak naturally and turn a thought into a structured reminder.
- **Multiple actions from one capture** — extract more than one reminder or task from a single input.
- **AI-powered lists** — turn shopping, packing, and to-do ideas into organized checklists.
- **Paste text with AI** — paste text and let Yormio identify useful reminders and list items.
- **Reminder details** — keep date, time, alert, description, and supported repeat rules together.
- **Built-in calendar** — see scheduled reminders and lists in a simple calendar view.
- **Local-first experience** — manual reminders and lists remain useful even without AI or a network connection.
- **Light and dark themes** — designed for both warm light mode and deep teal dark mode.
- **Multilingual** — Yormio supports English, Swedish, Turkish, and German.

## Designed for quick capture

Yormio is built around one simple idea: capturing something should take less effort than trying to remember it.

Open the app, speak or type what is on your mind, review what Yormio understood, and save it. The app keeps reminders, lists, notifications, and calendar views connected without turning capture into a long form.

## Screenshots

The landing page uses the following Yormio screenshots from `assets/`:

- `01-empty-microphone.png`
- `02-multi-reminder-extraction.png`
- `03-listening-capture.png`
- `04-shopping-list-extraction.png`
- `05-shopping-list-details.png`
- `06-reminder-details.png`
- `07-calender-reminders.png`
- `08-widgets-overview.png`
- `09-calender-reminders-dark.png`
- `10-microphone-dark.png`

> `calender` is intentionally kept in filenames 07 and 09 because those are the current asset filenames.

The main brand artwork is stored as:

```text
assets/yormio-branding.png
```

Official Yormio logo assets live under:

```text
assets/logos/
```

## Store availability

App Store and Google Play buttons are controlled from `config.js`.

When the public store listings are ready, set:

```js
appStoreUrl: "https://...",
googlePlayUrl: "https://...",
```

Until then, the landing page keeps the store buttons inactive instead of linking to placeholder pages.

## Privacy, Terms and Support

Yormio's public support and legal pages are available here:

- **Privacy Policy:** https://yormio-privacy-terms-page.netlify.app/privacy/
- **Terms of Use:** https://yormio-privacy-terms-page.netlify.app/terms/
- **Support:** https://yormio-privacy-terms-page.netlify.app/support/
- **Account Deletion:** https://yormio-privacy-terms-page.netlify.app/account-deletion/

These links are also wired into the landing page.

## Landing page

The website is intentionally simple and dependency-free:

- semantic HTML
- responsive CSS
- lightweight JavaScript interactions
- scroll/reveal animations
- light/dark Yormio visual language
- Netlify-ready configuration

No framework or build step is required.

### Local preview

From the project root:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Netlify deployment

The project can be deployed by connecting the GitHub repository to Netlify or by uploading the project folder directly.

`netlify.toml` publishes the project root and includes the current security-header configuration.

## Project structure

```text
yormio-landing-page/
├── assets/
│   ├── logos/
│   ├── yormio-branding.png
│   └── 01...10 screenshot files
├── config.js
├── index.html
├── netlify.toml
├── README.md
├── script.js
└── styles.css
```

---

**Yormio** — capture the thought, keep the plan.
