# Yormio Landing Page

Static landing page for Yormio, prepared for Netlify.

## 1. Add screenshots

Copy the 10 screenshots directly into `assets/` with these exact filenames:

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

`assets/yormio-branding.png` is already included.

> Note: `calender` is intentionally kept in filenames 07 and 09 because that is the supplied filename.

If a screenshot is missing, the page displays a labelled placeholder instead of a broken image.

## 2. Store links

Open `config.js` and set these when the listings become public:

```js
appStoreUrl: "https://...",
googlePlayUrl: "https://...",
```

Until then the two store buttons are automatically shown as inactive.

The production Privacy, Terms, Support and Account Deletion links are already configured in the same file.

## 3. Local preview

No build step is required. From this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## 4. Netlify

You can either drag this folder into Netlify or connect the repository. `netlify.toml` already publishes the project root and adds basic security headers.

## Structure

```text
yormio-landing-page/
├── assets/
│   ├── yormio-branding.png
│   └── 01...10 screenshot files
├── config.js
├── index.html
├── netlify.toml
├── README.md
├── script.js
└── styles.css
```
