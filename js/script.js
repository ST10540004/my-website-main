/* ========================================================
   YOUTH QUAKE NPO - CENTRALIZED JAVASCRIPT SUITE
   ======================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initSiteSearch();
    initAccordion();
    initLightbox();
    initEvents();
    initScrollAnimations();
    initMap();
    initEnquiryForm();
    initContactForm();
});

/* ========================================================
   1. HELPERS & VALIDATION
   ======================================================== */

function isValidName(name) {
    return /^[A-Za-zÀ-ÖØ-öø-ÿ'’ -]{2,60}$/.test(name);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^(\+27|0)\d{9}$/.test(phone.replace(/[\s-]/g, ''));
}

/* ========================================================
   2. DARK / LIGHT THEME TOGGLE
   ======================================================== */

function initThemeToggle() {
    let saved = null;
    try { saved = localStorage.getItem('yq-theme'); } catch (err) { /* ignore */ }
    if (saved === 'dark' || saved === 'dark-mode') document.body.classList.add('dark-mode');

    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.setAttribute('aria-pressed', String(document.body.classList.contains('dark-mode')));
    btn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        btn.setAttribute('aria-pressed', String(isDark));
        try { localStorage.setItem('yq-theme', isDark ? 'dark' : 'light'); } catch (err) { /* ignore */ }
    });
}

/* ========================================================
   3. UNIVERSAL LIVE SEARCH FUNCTIONALITY
   ======================================================== */

function initSiteSearch() {
    // Helper: Display "No results" message dynamically
    function toggleNoResultsMsg(container, show, query) {
        let msg = container.querySelector('.no-results-msg');
        if (show) {
            if (!msg) {
                msg = document.createElement('p');
                msg.className = 'no-results-msg';
                msg.style.cssText = 'text-align:center; padding: 2rem; color: var(--color-primary, #d9480f); font-weight: 600; font-size: 1.1rem;';
                container.appendChild(msg);
            }
            msg.textContent = `No results found matching "${query}".`;
            msg.style.display = 'block';
        } else if (msg) {
            msg.style.display = 'none';
        }
    }

    // 1. Index Page Search (#site-search)
    const indexSearch = document.getElementById('site-search');
    if (indexSearch) {
        indexSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const welcomeSec = document.querySelector('.welcome-section');
            if (!welcomeSec) return;

            const text = welcomeSec.textContent.toLowerCase();
            const matches = text.includes(query);
            
            toggleNoResultsMsg(welcomeSec, !matches && query !== '', query);
            
            const welcomeText = welcomeSec.querySelector('p:not(.no-results-msg)');
            const welcomeImg = welcomeSec.querySelector('img');
            if (welcomeText) welcomeText.style.display = (matches || query === '') ? 'block' : 'none';
            if (welcomeImg) welcomeImg.style.display = (matches || query === '') ? 'block' : 'none';
        });
    }

    // 2. About Page Search (#about-search)
    const aboutSearch = document.getElementById('about-search');
    if (aboutSearch) {
        aboutSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const main = document.querySelector('main');
            if (!main) return;

            let totalVisible = 0;
            const searchableSections = main.querySelectorAll('section.story, section.team, section.partners, section.footprint');
            
            searchableSections.forEach(section => {
                const sectionText = section.textContent.toLowerCase();
                if (query === '' || sectionText.includes(query)) {
                    section.style.display = 'block';
                    totalVisible++;

                    const teamCards = section.querySelectorAll('.team-card');
                    if (teamCards.length > 0) {
                        teamCards.forEach(card => {
                            const cardText = card.textContent.toLowerCase();
                            card.style.display = (query === '' || cardText.includes(query)) ? 'block' : 'none';
                        });
                    }
                } else {
                    section.style.display = 'none';
                }
            });

            toggleNoResultsMsg(main, totalVisible === 0 && query !== '', query);
        });
    }

    // 3. Programs Page Search (#programs-search)
    const programsSearch = document.getElementById('programs-search');
    if (programsSearch) {
        programsSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const grid = document.querySelector('.programs-grid');
            if (!grid) return;

            let matchCount = 0;
            grid.querySelectorAll('.program-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                const matches = query === '' || text.includes(query);
                card.style.display = matches ? 'block' : 'none';
                if (matches) matchCount++;
            });

            toggleNoResultsMsg(grid.parentElement, matchCount === 0 && query !== '', query);
        });
    }

    // 4. Gallery / Events Page Search (#gallery-search / #events-search)
    const gallerySearch = document.getElementById('gallery-search') || document.getElementById('events-search');
    if (gallerySearch) {
        gallerySearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const grid = document.querySelector('.gallery-grid');
            if (!grid) return;

            let matchCount = 0;
            grid.querySelectorAll('.gallery-item').forEach(item => {
                const altText = item.getAttribute('alt') ? item.getAttribute('alt').toLowerCase() : '';
                const matches = query === '' || altText.includes(query);
                item.style.display = matches ? 'block' : 'none';
                if (matches) matchCount++;
            });

            toggleNoResultsMsg(grid.parentElement, matchCount === 0 && query !== '', query);
        });
    }

    // 5. Contact Page Search (#contact-search)
    const contactSearch = document.getElementById('contact-search');
    if (contactSearch) {
        contactSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const boxes = document.querySelectorAll('.searchable-box');

            boxes.forEach(box => {
                const text = box.textContent.toLowerCase();
                box.style.display = (query === '' || text.includes(query)) ? 'block' : 'none';
            });
        });
    }

    // 6. Enquiry Page Search (#enquiry-page-search)
    const enquiryPageSearch = document.getElementById('enquiry-page-search');
    if (enquiryPageSearch) {
        enquiryPageSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const box = document.querySelector('.enquiry-form-section.searchable-box');
            if (box) {
                const text = box.textContent.toLowerCase();
                box.style.display = (query === '' || text.includes(query)) ? 'block' : 'none';
            }
        });
    }
}

/* ========================================================
   4. SCROLL ANIMATIONS
   ======================================================== */

function initScrollAnimations() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll('.program-card, .team-card, .split-panel > div, .partners, .event-card');
    if (!targets.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    targets.forEach((el) => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

/* ========================================================
   5. ACCORDION (FAQ on programs.html)
   ======================================================== */

function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    if (!headers.length) return;

    function setPanel(header, open) {
        const panel = header.nextElementSibling;
        header.setAttribute('aria-expanded', String(open));
        if (panel) panel.style.maxHeight = open ? panel.scrollHeight + 'px' : null;
    }

    headers.forEach((header) => {
        header.addEventListener('click', () => {
            const wasOpen = header.getAttribute('aria-expanded') === 'true';
            headers.forEach((h) => setPanel(h, false));
            if (!wasOpen) setPanel(header, true);
        });
    });
}

/* ========================================================
   6. GALLERY LIGHTBOX MODAL
   ======================================================== */

function initLightbox() {
    const thumbs = Array.from(document.querySelectorAll('.gallery-item'));
    if (!thumbs.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.innerHTML = `
        <button class="lightbox-close" aria-label="Close image viewer">&times;</button>
        <button class="lightbox-nav lightbox-prev" aria-label="Previous image">&#10094;</button>
        <figure class="lightbox-figure">
            <img class="lightbox-img" alt="">
            <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <button class="lightbox-nav lightbox-next" aria-label="Next image">&#10095;</button>`;
    document.body.appendChild(overlay);

    const imgEl = overlay.querySelector('.lightbox-img');
    const capEl = overlay.querySelector('.lightbox-caption');
    let current = 0;
    let lastFocused = null;

    function getVisibleThumbs() {
        return thumbs.filter(t => t.style.display !== 'none');
    }

    function show(index) {
        const visibleThumbs = getVisibleThumbs();
        if (!visibleThumbs.length) return;
        
        current = (index + visibleThumbs.length) % visibleThumbs.length;
        imgEl.src = visibleThumbs[current].currentSrc || visibleThumbs[current].src;
        imgEl.alt = visibleThumbs[current].alt;
        capEl.textContent = visibleThumbs[current].alt;
    }

    function open(thumb) {
        const visibleThumbs = getVisibleThumbs();
        const index = visibleThumbs.indexOf(thumb);
        if (index === -1) return;

        lastFocused = document.activeElement;
        show(index);
        overlay.hidden = false;
        document.body.classList.add('no-scroll');
        overlay.querySelector('.lightbox-close').focus();
    }

    function close() {
        overlay.hidden = true;
        document.body.classList.remove('no-scroll');
        imgEl.removeAttribute('src');
        if (lastFocused) lastFocused.focus();
    }

    thumbs.forEach((thumb) => {
        thumb.tabIndex = 0;
        thumb.setAttribute('role', 'button');
        thumb.addEventListener('click', () => open(thumb));
        thumb.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(thumb);
            }
        });
    });

    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
    overlay.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
    });

    document.addEventListener('keydown', (e) => {
        if (overlay.hidden) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
    });
}

/* ========================================================
   7. EVENTS DYNAMIC BUILDER
   ======================================================== */

const YQ_EVENTS = [
    {
        title: 'Teens Camp 2026',
        date: 'Date: TBC',
        location: 'Eastern Cape',
        description: 'A weekend camp focused on leadership, discipline, and personal growth for teenagers.'
    },
    {
        title: 'Adopt-a-School Career Day',
        date: 'Date: TBC',
        location: 'Partner High Schools',
        description: 'Career guidance, motivational talks, and post-matric opportunities for learners.'
    },
    {
        title: 'Youth Quake Tour',
        date: 'Date: TBC',
        location: 'Rural Communities',
        description: 'A career exposure tour offering bursary guidance and application support.'
    }
];

function buildEventCard(ev) {
    const card = document.createElement('article');
    card.className = 'event-card';

    const info = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = ev.title;

    const meta = document.createElement('p');
    meta.className = 'event-meta';
    meta.textContent = `${ev.date} \u2022 ${ev.location}`;

    const desc = document.createElement('p');
    desc.textContent = ev.description;

    info.append(title, meta, desc);

    const rsvp = document.createElement('a');
    rsvp.className = 'btn';
    rsvp.href = 'enquiry.html';
    rsvp.textContent = 'RSVP';
    rsvp.setAttribute('aria-label', `RSVP for ${ev.title}`);

    card.append(info, rsvp);
    return card;
}

function initEvents() {
    const list = document.getElementById('events-list');
    if (!list) return;

    const search = document.getElementById('event-search');
    const sort = document.getElementById('event-sort');
    const count = document.getElementById('event-count');

    function render() {
        const term = search ? search.value.trim().toLowerCase() : '';
        const direction = sort && sort.value === 'za' ? -1 : 1;

        const results = YQ_EVENTS
            .filter((ev) => [ev.title, ev.location, ev.description].join(' ').toLowerCase().includes(term))
            .sort((a, b) => a.title.localeCompare(b.title) * direction);

        list.replaceChildren(...results.map(buildEventCard));

        if (count) {
            count.textContent = results.length === 0
                ? 'No events match your search. Try a different word.'
                : `Showing ${results.length} of ${YQ_EVENTS.length} events`;
        }
    }

    if (search) search.addEventListener('input', render);
    if (sort) sort.addEventListener('change', render);
    render();
}

/* ========================================================
   8. INTERACTIVE MAP (Leaflet + OpenStreetMap)
   ======================================================== */

const YQ_OFFICE = { lat: -33.0580487, lng: 27.7825986 };

function initMap() {
    const el = document.getElementById('map');
    if (!el) return;

    if (typeof L === 'undefined') {
        el.textContent = 'Map unavailable. Our office: Bantry Farm, Cove Ridge, KuGompo City, 5200.';
        return;
    }

    const map = L.map(el, { scrollWheelZoom: false }).setView([YQ_OFFICE.lat, YQ_OFFICE.lng], 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([YQ_OFFICE.lat, YQ_OFFICE.lng])
        .addTo(map)
        .bindPopup('<strong>Youth Quake NPO</strong><br>Bantry Farm, Cove Ridge<br>KuGompo City, 5200')
        .openPopup();
}

/* ========================================================
   9. ENQUIRY FORM LOGIC
   ======================================================== */

const ENQUIRY_REPLIES = {
    volunteer: (n) => `Thanks, ${n}! Volunteering with Youth Quake is free to join. We're currently recruiting for our Teens Camp 2026 and Adopt-a-School programs. A team member will confirm availability and next steps within 2 business days.`,
    mentorship: (n) => `Thanks, ${n}! Joining the Lean-On-Me Mentorship Program is free. Spaces are limited to keep support one-on-one, so we'll confirm current availability within 2 business days.`,
    partnership: (n) => `Thanks, ${n}! Sponsorship packages start from R500/month depending on the program. Our partnerships team will send you a full cost breakdown within 3 business days.`,
    school: (n) => `Thanks, ${n}! Bringing Youth Quake to your school is free for partner schools under our Adopt-a-School program. We're currently booking for Term 4 2026. Tell us your preferred dates and we'll confirm availability.`,
    general: (n) => `Thanks, ${n}! We've received your enquiry and a team member will respond within 2 business days.`
};

function initEnquiryForm() {
    const form = document.getElementById('enquiry-form');
    if (!form) return;

    const box = document.getElementById('enquiry-response');
    const submitBtn = form.querySelector('button[type="submit"]');
    const messageEl = document.getElementById('message');
    const charCountEl = document.getElementById('enquiry-char-count');

    if (messageEl && charCountEl) {
        messageEl.addEventListener('input', () => {
            const len = messageEl.value.trim().length;
            charCountEl.textContent = `${len} / 1000`;
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameEl = document.getElementById('name');
        const emailEl = document.getElementById('email');
        const typeEl = document.getElementById('enquiry_type');

        const name = nameEl ? nameEl.value.trim() : '';
        const email = emailEl ? emailEl.value.trim() : '';
        const type = typeEl ? typeEl.value : '';
        const message = messageEl ? messageEl.value.trim() : '';

        form.querySelectorAll('.form-group').forEach((g) => g.classList.remove('has-error'));
        if (box) {
            box.className = 'form-response';
            box.style.display = 'none';
        }

        let hasError = false;
        if (!isValidName(name)) { document.getElementById('group-enquiry-name')?.classList.add('has-error'); hasError = true; }
        if (!isValidEmail(email)) { document.getElementById('group-enquiry-email')?.classList.add('has-error'); hasError = true; }
        if (type === '') { document.getElementById('group-enquiry-type')?.classList.add('has-error'); hasError = true; }
        if (message.length < 10 || message.length > 1000) { document.getElementById('group-enquiry-message')?.classList.add('has-error'); hasError = true; }

        if (hasError) {
            if (box) {
                box.textContent = 'Please fix the highlighted fields above before submitting.';
                box.classList.add('error');
                box.style.display = 'block';
                box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return;
        }

        const originalLabel = submitBtn ? submitBtn.textContent : 'Submit';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
        }

        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({ name, email, enquiryType: type, message })
            });
            if (!response.ok) throw new Error('Request failed with status ' + response.status);

            const reply = (ENQUIRY_REPLIES[type] || ENQUIRY_REPLIES.general)(name);
            if (box) {
                box.textContent = reply;
                box.classList.add('success');
                box.style.display = 'block';
            }
            form.reset();
            if (charCountEl) charCountEl.textContent = '0 / 1000';
        } catch (err) {
            if (box) {
                box.textContent = 'Sorry, we could not send your enquiry right now. Please check your connection and try again.';
                box.classList.add('error');
                box.style.display = 'block';
            }
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalLabel;
            }
        }
    });
}

/* ========================================================
   10. CONTACT FORM LOGIC
   ======================================================== */

const CONTACT_RECIPIENT = 'YouthQuake@mandelac.za';

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const box = document.getElementById('contact-response');
    const messageEl = document.getElementById('contact-message');
    const charCountEl = document.getElementById('char-count');

    if (messageEl && charCountEl) {
        messageEl.addEventListener('input', () => {
            const len = messageEl.value.trim().length;
            charCountEl.textContent = `${len} / 3000`;
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameEl = document.getElementById('contact-name');
        const emailEl = document.getElementById('contact-email');
        const typeEl = document.getElementById('message_type');
        const subjectEl = document.getElementById('contact-subject');

        const name = nameEl ? nameEl.value.trim() : '';
        const email = emailEl ? emailEl.value.trim() : '';
        const type = typeEl ? typeEl.value : '';
        const subjectText = subjectEl ? subjectEl.value.trim() : '';
        const message = messageEl ? messageEl.value.trim() : '';

        form.querySelectorAll('.form-group').forEach((group) => {
            group.classList.remove('has-error');
        });
        if (box) {
            box.className = 'form-response';
            box.style.display = 'none';
        }

        let hasError = false;
        if (!isValidName(name)) { document.getElementById('group-name')?.classList.add('has-error'); hasError = true; }
        if (!isValidEmail(email)) { document.getElementById('group-email')?.classList.add('has-error'); hasError = true; }
        if (type === '') { document.getElementById('group-type')?.classList.add('has-error'); hasError = true; }
        if (subjectEl && subjectText.length < 2) { document.getElementById('group-subject')?.classList.add('has-error'); hasError = true; }
        if (message.length < 10 || message.length > 3000) { document.getElementById('group-message')?.classList.add('has-error'); hasError = true; }

        if (hasError) {
            if (box) {
                box.textContent = 'Please fix the highlighted fields above before submitting.';
                box.classList.add('error');
                box.style.display = 'block';
                box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return;
        }

        const subject = `[${type}] ${subjectText || 'Message from ' + name}`;
        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            `Message type: ${type}`,
            `Subject: ${subjectText}`,
            '',
            'Message:',
            message
        ].join('\n');

        const mailto = `mailto:${CONTACT_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        if (box) {
            box.textContent = `Thanks, ${name}! Your message has been validated. Opening your email app to send to ${CONTACT_RECIPIENT}...`;
            box.classList.add('success');
            box.style.display = 'block';
        }

        window.location.href = mailto;
        form.reset();
        if (charCountEl) charCountEl.textContent = '0 / 3000';
    });
}