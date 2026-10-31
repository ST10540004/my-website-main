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
    if (!field) return;
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
            li.textContent = msg; // textContent keeps user input safe from HTML injection
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
        if (panel) panel.style.maxHeight = open ? panel.scrollHeight + 'px' : null;
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
   5. GALLERY LIGHTBOX (gallery.html)
   ======================================================== */

function initLightbox() {
    const thumbs = Array.from(document.querySelectorAll('.gallery-item'));
    if (!thumbs.length) return;

    // Dynamically build lightbox modal in DOM
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
        current = (index + thumbs.length) % thumbs.length;
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
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(i);
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
   6. EVENTS: dynamic content + search + sort (events.html)
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
   8. ENQUIRY FORM (enquiry.html)
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

    // Character counter for textarea
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

        // Clear previous error states
        form.querySelectorAll('.form-group').forEach((g) => g.classList.remove('has-error'));
        if (box) {
            box.className = 'form-response';
            box.style.display = 'none';
        }

        let hasError = false;

        if (!isValidName(name)) {
            document.getElementById('group-enquiry-name')?.classList.add('has-error');
            hasError = true;
        }
        if (!isValidEmail(email)) {
            document.getElementById('group-enquiry-email')?.classList.add('has-error');
            hasError = true;
        }
        if (type === '') {
            document.getElementById('group-enquiry-type')?.classList.add('has-error');
            hasError = true;
        }
        if (message.length < 10 || message.length > 1000) {
            document.getElementById('group-enquiry-message')?.classList.add('has-error');
            hasError = true;
        }

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
   9. CONTACT FORM (contact.html)
   ======================================================== */

const CONTACT_RECIPIENT = 'YouthQuake@mandelac.za';

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const box = document.getElementById('contact-response');
    const messageEl = document.getElementById('contact-message');
    const charCountEl = document.getElementById('char-count');

    // Live character counter for the message textarea
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

        const errors = [];
        check(nameEl, isValidName(name), 'Name must be 2 to 60 letters (spaces, hyphens and apostrophes are allowed).', errors);
        check(emailEl, isValidEmail(email), 'Enter a valid email address, e.g. name@example.com.', errors);
        check(typeEl, type !== '', 'Choose who you are / message type.', errors);
        
        if (subjectEl) {
            check(subjectEl, subjectText.length >= 2, 'Subject must be at least 2 characters long.', errors);
        }
        
        check(messageEl, message.length >= 10 && message.length <= 3000, `Message must be 10 to 3000 characters (currently ${message.length}).`, errors);

        if (errors.length) {
            showResponse(box, errors, true);
            return;
        }

        // Compile input into email mailto action
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

        showResponse(box, `Thanks, ${name}! Your message has been validated. Your email app should open so you can send it to ${CONTACT_RECIPIENT}.`, false);

        const fallback = document.createElement('a');
        fallback.href = mailto;
        fallback.textContent = 'Email app did not open? Click here to send the message.';
        box.appendChild(fallback);

        window.location.href = mailto;
        form.reset();
        if (charCountEl) charCountEl.textContent = '0 / 3000';
    });

    /* ========================================================
   CONTACT FORM VALIDATION & SUBMISSION (contact.html)
   ======================================================== */

const CONTACT_RECIPIENT = 'YouthQuake@mandelac.za';

function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const box = document.getElementById('contact-response');
    const messageEl = document.getElementById('contact-message');
    const charCountEl = document.getElementById('char-count');

    // Live character count listener for the message textarea
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

        // Reset previous error classes on all form groups
        form.querySelectorAll('.form-group').forEach((group) => {
            group.classList.remove('has-error');
        });
        if (box) {
            box.className = 'form-response';
            box.style.display = 'none';
        }

        let hasError = false;

        // Field-by-field validation checks
        if (!isValidName(name)) {
            document.getElementById('group-name')?.classList.add('has-error');
            hasError = true;
        }
        if (!isValidEmail(email)) {
            document.getElementById('group-email')?.classList.add('has-error');
            hasError = true;
        }
        if (type === '') {
            document.getElementById('group-type')?.classList.add('has-error');
            hasError = true;
        }
        if (subjectEl && subjectText.length < 2) {
            document.getElementById('group-subject')?.classList.add('has-error');
            hasError = true;
        }
        if (message.length < 10 || message.length > 3000) {
            document.getElementById('group-message')?.classList.add('has-error');
            hasError = true;
        }

        // If errors exist, stop and display feedback box
        if (hasError) {
            if (box) {
                box.textContent = 'Please fix the highlighted fields above before submitting.';
                box.classList.add('error');
                box.style.display = 'block';
                box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            return;
        }

        // Compile input into email mailto action
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

        // Trigger mail client fallback
        window.location.href = mailto;
        form.reset();
        if (charCountEl) charCountEl.textContent = '0 / 3000';
    });
}
}