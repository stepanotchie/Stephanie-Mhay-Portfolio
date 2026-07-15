/*
   - Loads repeatable content (skills, projects, education)
     from data.json and renders it into the page.
   - Handles the mobile nav toggle.
   - Handles the contact form (front-end only for now).
 */

document.addEventListener('DOMContentLoaded', init);

async function init() {
    setupNavToggle();
    setupContactForm();
    setupEmailButton();
    setupActiveNavLink();
    setupScrollProgress();
    setupPageFadeIn();
    await loadSiteData();
    setupScrollReveal();
    setupSkillBarAnimation();
}

/* Page-load fade-in — waits a beat for fonts/layout to settle, then
   eases the whole page in from transparent instead of popping in. */
function setupPageFadeIn() {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.add('page-loaded');
        });
    });
}

/* Stitch rail — tracks scroll position as a 0-100 value on --scroll-progress
   so the CSS mask + needle marker in styles.css can "sew" down the page. */
function setupScrollProgress() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const root = document.documentElement;
    let ticking = false;

    const update = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
        root.style.setProperty('--scroll-progress', progress.toFixed(2));
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    update();
}

/* Skill bars — each fill grows from 0 to its target percentage as it
   scrolls into view, and resets to 0 if scrolled back out, so it
   replays on every visit rather than only animating once. Runs
   independently of setupScrollReveal since it targets width, not
   opacity/transform. */
function setupSkillBarAnimation() {
    const fills = document.querySelectorAll('.soft-skill-fill');
    if (!fills.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        fills.forEach((fill) => {
            fill.style.width = `${fill.dataset.level}%`;
        });
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const fill = entry.target;
            fill.style.width = entry.isIntersecting ? `${fill.dataset.level}%` : '0%';
        });
    }, {
        threshold: 0.4
    });

    fills.forEach((fill) => observer.observe(fill));
}

/* Active-section indicator — watches each section that has a matching nav
   link and marks that link .active as its section crosses the middle of
   the viewport, so the nav always shows where you are on the page. */
function setupActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    if (!navLinks.length) return;

    const sections = Array.from(navLinks)
        .map((link) => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);
    if (!sections.length) return;

    const setActive = (id) => {
        navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
    };

    const clearActive = () => {
        navLinks.forEach((link) => link.classList.remove('active'));
    };

    // How far the user needs to scroll before any nav link is allowed to
    // light up. Without this, IntersectionObserver's initial callback (which
    // fires the moment observe() is called, before any scrolling) can find
    // that the first section's edge already sits inside the shrunk
    // "-45% / -50%" detection band at scrollY 0 — especially if the hero +
    // intro sections are short — and mark it active on page load.
    const activationThreshold = () => window.innerHeight * 0.3;

    const observer = new IntersectionObserver((entries) => {
        if (window.scrollY < activationThreshold()) {
            clearActive();
            return;
        }
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                setActive(entry.target.id);
            }
        });
    }, {
        rootMargin: '-45% 0px -50% 0px',
        threshold: 0
    });

    sections.forEach((section) => observer.observe(section));

    // Belt-and-suspenders: also clear on ordinary scroll events near the
    // top, in case the observer's own callback doesn't fire again right away.
    window.addEventListener('scroll', () => {
        if (window.scrollY < activationThreshold()) clearActive();
    }, { passive: true });
}

/* Scroll reveal — fades elements in as they enter the viewport and back
   out if the user scrolls away from them, using an IntersectionObserver
   so it stays smooth and doesn't run on every scroll event. Runs after
   loadSiteData() so it also picks up the dynamically-rendered cards. */
function setupScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    // Respect users who've asked for reduced motion — just show everything.
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        revealEls.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.target.classList.toggle('is-visible', entry.isIntersecting);
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -60px 0px'
    });

    revealEls.forEach((el) => observer.observe(el));
}

/* Data loading*/
async function loadSiteData() {
    try {
        const response = await fetch('data/data.json');
        if (!response.ok) {
            throw new Error(`Could not load data.json (status ${response.status})`);
        }
        const data = await response.json();

        renderTechnicalSkills(data.skills.technical);
        renderSoftSkills(data.skills.soft);
        renderProjects(data.projects);
        renderExperience(data.experience);
        renderEducation(data.education);
    } catch (error) {
        // If data.json fails to load (e.g. opening the file directly
        // from disk instead of through a local server), let the user know
        // instead of leaving the page silently empty.
        console.error(error);
        showDataLoadError();
    }
}

function showDataLoadError() {
    const containers = ['technicalSkills', 'projectsContainer', 'experienceContainer'];
    containers.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<p class="loading-text">Content could not be loaded. If you are viewing this file directly, run it through a local server (e.g. Live Server) so the browser can fetch data.json.</p>';
        }
    });
}

/* Renderers — each one turns a slice of data.json into HTML */

function renderTechnicalSkills(skills = []) {
    const container = document.getElementById('technicalSkills');
    if (!container) return;

    container.innerHTML = skills.map((skill, i) => `
        <div class="skill-card reveal" style="--reveal-delay: ${i * 0.06}s">
            <div class="card-inner">
                <img src="${skill.icon}" alt="${skill.name}" width="123" height="123">
                <span>${skill.name}</span>
            </div>
        </div>
    `).join('');
}

function renderSoftSkills(skills = []) {
    const container = document.getElementById('softSkills');
    if (!container) return;

    container.innerHTML = skills.map((skill, i) => `
        <div class="soft-skill reveal" style="--reveal-delay: ${i * 0.06}s">
            <div class="soft-skill-header">
                <span class="soft-skill-name">${skill.name}</span>
                <span class="soft-skill-percent">${skill.level}%</span>
            </div>
            <div class="soft-skill-track">
                <div class="soft-skill-fill" data-level="${skill.level}" style="width: 0%;"></div>
            </div>
        </div>
    `).join('');
}

function renderProjects(projects = []) {
    const container = document.getElementById('projectsContainer');
    if (!container) return;

    container.innerHTML = projects.map((project, i) => `
        <article class="project-container reveal" style="--reveal-delay: ${i * 0.1}s">
            <div class="project-image-wrapper">
                ${project.type === 'video'
            ? `<video autoplay muted loop playsinline>
                            <source src="${project.image}" type="video/mp4">
                       </video>`
            : `<img src="${project.image}" alt="${project.title} preview" class="project-img">`
        }
            </div>
            <div class="project-info">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tools">
                    ${(project.tools || []).map((tool) => `<span class="tool-pill">${tool}</span>`).join('')}
                </div>
                <a href="${project.link}" target="_blank" rel="noopener noreferrer">${project.linkText}</a>
            </div>
        </article>
    `).join('');
}

function renderExperience(experience = []) {
    const container = document.getElementById('experienceContainer');
    if (!container) return;

    container.innerHTML = experience.map((job, i) => `
        <article class="experience-card reveal" style="--reveal-delay: ${i * 0.08}s">
            <div class="experience-header">
                <div>
                    <h3 class="experience-role">${job.role}</h3>
                    <p class="experience-company">${job.company}</p>
                </div>
                <span class="experience-period">${job.period}</span>
            </div>
            <ul class="experience-bullets">
                ${job.bullets.map((point) => `<li>${point}</li>`).join('')}
            </ul>
        </article>
    `).join('');
}

function renderEducation(education = []) {
    const container = document.getElementById('educationTimeline');
    if (!container) return;

    container.innerHTML = education.map((entry, i) => `
        <div class="timeline-item reveal" style="--reveal-delay: ${i * 0.1}s">
            <span class="timeline-marker" aria-hidden="true"></span>
            <div class="timeline-content">
                <h3 class="timeline-degree">${entry.degree}</h3>
                <p class="timeline-institution">${entry.institution}</p>
                <p class="timeline-years">${entry.years}</p>
            </div>
        </div>
    `).join('');
}

/* Mobile navigation toggle*/
function setupNavToggle() {
    const toggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        toggle.classList.toggle('active', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close the menu automatically once a link is tapped (mobile UX).
    navLinks.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            toggle.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// Email button - opens a Gmail compose window directly (works for every
// visitor, not just ones with a local mail app configured), and also
// copies the address to the clipboard as a convenience.
function setupEmailButton() {
    const emailBtn = document.getElementById('emailBtn');
    if (!emailBtn) return;

    const emailSpan = emailBtn.querySelector('span');
    const email = 'stephaniedeleon019@gmail.com';
    const originalText = emailSpan ? emailSpan.textContent : email;

    emailBtn.addEventListener('click', () => {
        if (navigator.clipboard && emailSpan) {
            navigator.clipboard.writeText(email)
                .then(() => {
                    emailSpan.textContent = 'Copied! Opening Gmail…';
                    setTimeout(() => {
                        emailSpan.textContent = originalText;
                    }, 2500);
                })
                .catch(() => {
                    // Clipboard access can be blocked (e.g. insecure context);
                    // the Gmail compose tab still opens regardless.
                });
        }
    });
}

// Contact form — actually delivers messages to Stephanie's inbox using
// FormSubmit (https://formsubmit.co), a free form-relay service that
// needs no backend or API key: it just forwards whatever is POSTed to
// the email address in the endpoint URL below.
//
// One-time setup Stephanie needs to do: the *first* message sent through
// the form triggers a confirmation email from FormSubmit to
// stephaniedeleon019@gmail.com — she has to click "Activate Form" in
// that email once before real messages start arriving. Every submission
// after that just works.
const CONTACT_ENDPOINT = 'https://formsubmit.co/ajax/stephaniedeleon019@gmail.com';

function setupContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const submitBtn = form ? form.querySelector('.contact-submit-btn') : null;
    if (!form || !status) return;

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Required fields (name, email, message) must be filled before
        // sending anything. checkValidity() also respects the email
        // field's built-in format check.
        if (!form.checkValidity()) {
            form.reportValidity();
            status.textContent = 'Please fill in all required fields before sending.';
            status.classList.remove('form-status--success');
            status.classList.add('form-status--error');
            return;
        }

        const firstName = form.name.value.trim().split(' ')[0] || 'there';
        const originalBtnText = submitBtn ? submitBtn.textContent : '';

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';
        }
        status.textContent = 'Sending your message…';
        status.classList.remove('form-status--success', 'form-status--error');

        try {
            const response = await fetch(CONTACT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    name: form.name.value.trim(),
                    email: form.email.value.trim(),
                    subject: form.subject.value.trim() || 'New portfolio contact form message',
                    message: form.message.value.trim(),
                    _subject: `Portfolio contact form: ${form.subject.value.trim() || 'New message'}`
                })
            });

            if (!response.ok) throw new Error(`FormSubmit responded with ${response.status}`);

            status.textContent = `Thanks, ${firstName}! Your message is on its way — I'll get back to you soon.`;
            status.classList.add('form-status--success');
            form.reset();
        } catch (error) {
            console.error('Contact form send failed:', error);
            status.textContent = `Sorry ${firstName}, something went wrong sending that. Please try emailing me directly instead.`;
            status.classList.add('form-status--error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        }
    });
}