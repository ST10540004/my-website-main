/* ========================================================
   YOUTH QUAKE — script.js
   ======================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initAccordion();
    initLightbox();
    initEvents();
    initScrollAnimations(); // after initEvents so rendered cards are included
    initMap();
    initEnquiryForm();
    initContactForm();
});

/* ========================================================
   1. HELPERS
   ======================================================== */

function isValidName(name) {
    return /^[A-Za-zÀ-ÖØ-öø-ÿ'’ -]{2,60}$/.test(name);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* South African numbers: 0786510460 or +27786510460 (spaces and dashes ignored) */
function isValidPhone(phone) {
    return /^(\+27|0)\d{9}$/.test(phone.replace(/[\s-]/g, ''));
}

/* Marks a field valid/invalid and collects the error message */
function check(field, isOk, message, errors) {
    field.classList.toggle('invalid', !isOk);
    field.setAttribute('aria-invalid', String(!isOk));
    if (!isOk) errors.push(message);
}

/* Shows a success or error message. `content` can be a string or an array of strings. */
function showResponse(box, content, isError) {
    if (!box) return;
    box.replaceChildren();
    box.className = 'form-response ' + (isError ? 'error' : 'success');
    box.setAttribute('role', isError ? 'alert' : 'status');

    if (Array.isArray(content)) {
        const intro = document.createElement('p');
        intro.textContent = 'Please fix the following before submitting:';
        const list = document.createElement('ul');
        content.forEach((msg) => {
            const li = document.createElement('li');
            li.textContent = msg; // textContent keeps user input from being run as HTML
            list.appendChild(li);
        });
        box.append(intro, list);
    } else {
        const p = document.createElement('p');
        p.textContent = content;
        box.appendChild(p);
    }

    box.style.display = 'block';
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ========================================================
   2. DARK / LIGHT THEME (header button #theme-toggle)
   ======================================================== */

function initThemeToggle() {
    let saved = null;
    try { saved = localStorage.getItem('yq-theme'); } catch (err) { /* storage unavailable */ }
    if (saved === 'dark') document.body.classList.add('dark');

    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    btn.setAttribute('aria-pressed', String(document.body.classList.contains('dark')));
    btn.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark');
        btn.setAttribute('aria-pressed', String(isDark));
        try { localStorage.setItem('yq-theme', isDark ? 'dark' : 'light'); } catch (err) { /* ignore */ }
    });
}

/* ========================================================
   3. SCROLL ANIMATIONS (cards fade/slide in as they appear)
   ======================================================== */

function initScrollAnimations() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    const targets = document.querySelectorAll(
        '.program-card, .team-card, .split-panel > div, .partners, .event-card'
    );
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
   4. ACCORDION (FAQ on programs.html)
   ======================================================== */

function initAccordion() {
    const headers = document.querySelectorAll('.accordion-header');
    if (!headers.length) return;

    function setPanel(header, open) {
        const panel = header.nextElementSibling;
        header.setAttribute('aria-expanded', String(open));
        panel.style.maxHeight = open ? panel.scrollHeight + 'px' : null;
    }

    headers.forEach((header) => {
        header.addEventListener('click', () => {
            const wasOpen = header.getAttribute('aria-expanded') === 'true';
            headers.forEach((h) => setPanel(h, false)); // only one panel open at a time
            if (!wasOpen) setPanel(header, true);
        });
    });
}

/* ========================================================
   5. GALLERY LIGHTBOX (click an image to view it larger)
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

    function show(index) {
        current = (index + thumbs.length) % thumbs.length; // wraps around
        imgEl.src = thumbs[current].currentSrc || thumbs[current].src;
        imgEl.alt = thumbs[current].alt;
        capEl.textContent = thumbs[current].alt;
    }

    function open(index) {
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

    thumbs.forEach((thumb, i) => {
        thumb.tabIndex = 0;
        thumb.setAttribute('role', 'button');
        thumb.addEventListener('click', () => open(i));
        thumb.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
        });
    });

    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
    overlay.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    document.addEventListener('keydown', (e) => {
        if (overlay.hidden) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(current - 1);
        if (e.key === 'ArrowRight') show(current + 1);
    });
}

/* ========================================================
   6. EVENTS: dynamic content + search + sort (events.html)
   Cards are built from this array with the DOM, not hard-coded in HTML.
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
   7. INTERACTIVE MAP (Leaflet + OpenStreetMap, contact.html)
   NOTE: lng comes from the old Google embed (!2d value). The lat below is
   approximate. Replace it with the number after !3d in your old embed link.
   ======================================================== */

const YQ_OFFICE = { lat: -33.0, lng: 27.7825986 };

function initMap() {
    const el = document.getElementById('map');
    if (!el) return;

    if (typeof L === 'undefined') { // Leaflet failed to load (offline etc.)
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
   8. ENQUIRY FORM (enquiry.html)
   Validate -> send with AJAX (fetch) -> show a response about cost/availability
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameEl = document.getElementById('name');
        const emailEl = document.getElementById('email');
        const typeEl = document.getElementById('enquiry_type');
        const messageEl = document.getElementById('message');

        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const type = typeEl.value;
        const message = messageEl.value.trim();

        const errors = [];
        check(nameEl, isValidName(name), 'Name must be 2 to 60 letters (spaces, hyphens and apostrophes are allowed).', errors);
        check(emailEl, isValidEmail(email), 'Enter a valid email address, e.g. name@example.com.', errors);
        check(typeEl, type !== '', 'Choose how we can help you.', errors);
        check(messageEl, message.length >= 10 && message.length <= 1000, `Message must be 10 to 1000 characters (currently ${message.length}).`, errors);

        if (errors.length) {
            showResponse(box, errors, true);
            return;
        }

        // AJAX: send the data without reloading the page.
        // jsonplaceholder is a free testing API that echoes the data back.
        // For a live site, swap the URL for a form service such as Formspree.
        const originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=UTF-8' },
                body: JSON.stringify({ name, email, enquiryType: type, message })
            });
            if (!response.ok) throw new Error('Request failed with status ' + response.status);

            const reply = (ENQUIRY_REPLIES[type] || ENQUIRY_REPLIES.general)(name);
            showResponse(box, reply, false);
            form.reset();
        } catch (err) {
            showResponse(box, 'Sorry, we could not send your enquiry right now. Please check your connection and try again, or use our Contact page.', true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
        }
    });
}

/* ========================================================
   9. CONTACT FORM (contact.html)
   Validate -> compile into an email -> user sends it to the recipient below
   ======================================================== */

const CONTACT_RECIPIENT = 'YouthQuake@mandelac.za'; // same address shown on the Contact page

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const box = document.getElementById('contact-response');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameEl = document.getElementById('contact-name');
        const emailEl = document.getElementById('contact-email');
        const phoneEl = document.getElementById('contact-phone'); // optional field
        const typeEl = document.getElementById('message_type');
        const messageEl = document.getElementById('contact-message');

        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const phone = phoneEl ? phoneEl.value.trim() : '';
        const type = typeEl.value;
        const message = messageEl.value.trim();

        const errors = [];
        check(nameEl, isValidName(name), 'Name must be 2 to 60 letters (spaces, hyphens and apostrophes are allowed).', errors);
        check(emailEl, isValidEmail(email), 'Enter a valid email address, e.g. name@example.com.', errors);
        if (phoneEl) {
            check(phoneEl, phone === '' || isValidPhone(phone), 'Phone number must look like 078 651 0460 or +27 78 651 0460.', errors);
        }
        check(typeEl, type !== '', 'Choose the type of message.', errors);
        check(messageEl, message.length >= 10 && message.length <= 1000, `Message must be 10 to 1000 characters (currently ${message.length}).`, errors);

        if (errors.length) {
            showResponse(box, errors, true);
            return;
        }

        // Compile the validated input into an email
        const subject = `[${type}] Message from ${name}`;
        const body = [
            `Name: ${name}`,
            `Email: ${email}`,
            phone ? `Phone: ${phone}` : null,
            `Message type: ${type}`,
            '',
            'Message:',
            message
        ].filter((line) => line !== null).join('\n');

        const mailto = `mailto:${CONTACT_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        showResponse(box, `Thanks, ${name}! Your message has been compiled. Your email app should open so you can send it to ${CONTACT_RECIPIENT}.`, false);

        const fallback = document.createElement('a');
        fallback.href = mailto;
        fallback.textContent = 'Email app did not open? Click here to send the message.';
        box.appendChild(fallback);

        window.location.href = mailto;
        form.reset();
    });
}
