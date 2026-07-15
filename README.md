# Stephanie Mhay de Leon | Web Portfolio

A responsive, JSON-driven personal portfolio built for **Web Development 1**. All repeatable content — skills, projects, work experience, and education — is stored in `data/data.json` and rendered dynamically with vanilla JavaScript, so adding a new entry never requires touching the HTML.

**Live site:** _add your GitHub Pages link here after deploying, e.g. `https://stepanotchie.github.io/portfolio/`_

## Features

- Fully responsive layout (mobile, tablet, desktop breakpoints)
- Content (skills, projects, experience, education) loaded from `data/data.json` via `fetch()`
- Mobile hamburger navigation with active-section highlighting on scroll
- Scroll-reveal animations and an animated skill-bar section
- Working contact form (relayed via FormSubmit — no backend needed)
- Downloadable CV and direct social/contact links

## Built With

- HTML5 (semantic markup)
- CSS3 (Flexbox, Grid, `clamp()`, media queries — mobile-first)
- Vanilla JavaScript (`fetch`, `IntersectionObserver`)
- [Google Fonts](https://fonts.google.com/): Playfair Display (headings) & Montserrat (body)
- [FormSubmit](https://formsubmit.co/) for contact form delivery

## Folder Structure

```
portfolio/
├── index.html
├── README.md
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── data/
│   └── data.json
├── assets_images/
│   └── (photos, CV PDF, project preview media)
└── assets_icons/
    └── (SVG icons)
```

## Running Locally

Because the site loads `data/data.json` with `fetch()`, opening `index.html` directly from the file system (`file://`) will not work — browsers block local `fetch` requests for security reasons. Serve the folder through a local server instead:

**Option 1 — VS Code Live Server**
1. Install the "Live Server" extension.
2. Right-click `index.html` → **Open with Live Server**.

**Option 2 — Python**
```bash
python -m http.server 5500
```
Then open `http://localhost:5500` in your browser.

## Deployment (GitHub Pages)

1. Push this project folder to a GitHub repository (make sure `index.html` sits at the repo root, or in the folder you set as the Pages source).
2. In the repository, go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then click **Save**.
5. Wait a minute for GitHub to build the site, then refresh the Pages settings tab — your live URL will appear at the top (usually `https://<username>.github.io/<repo-name>/`).
6. Paste that link into the **Live site** line at the top of this README and in your project submission.

## Author

**Stephanie Mhay de Leon**
- GitHub: [@stepanotchie](https://github.com/stepanotchie)
- LinkedIn: [Stephanie Mhay de Leon](https://www.linkedin.com/in/stephanie-mhay-de-leon-003987303/)
- Email: stephaniedeleon019@gmail.com

## Credits

Designed & programmed by Stephanie Mhay de Leon as the final project for Web Development 1.