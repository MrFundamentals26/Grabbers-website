/* ============================================================
   ACCORDION — About page
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

    const accordionHeaders = document.querySelectorAll(".accordianHeader");
    const accordionContents = document.querySelectorAll(".accordianContent");

    if (accordionHeaders.length === 0) return;

    accordionHeaders.forEach((header) => {
        header.setAttribute("role", "button");
        header.setAttribute("tabindex", "0");
        header.setAttribute("aria-expanded", "false");
    });

    function closeAll() {
        accordionContents.forEach((content) => {
            content.classList.remove("active");
            content.style.maxHeight = "0px";
        });
        accordionHeaders.forEach((header) => {
            header.setAttribute("aria-expanded", "false");
            header.classList.remove("active");
        });
    }

    function openPanel(header) {
        const item = header.parentElement;
        const content = item.querySelector(".accordianContent");
        if (!content) return;

        header.classList.add("active");
        header.setAttribute("aria-expanded", "true");
        content.classList.add("active");

        requestAnimationFrame(() => {
            content.style.maxHeight = (content.scrollHeight + 2) + "px";
        });
    }

    accordionHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            const content = item.querySelector(".accordianContent");
            if (!content) return;

            const isOpen = content.classList.contains("active");
            closeAll();
            if (!isOpen) openPanel(header);
        });

        header.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                header.click();
            }
        });
    });

    window.addEventListener("resize", () => {
        accordionContents.forEach((content) => {
            if (content.classList.contains("active")) {
                content.style.maxHeight = (content.scrollHeight + 2) + "px";
            }
        });
    });
});


/* ============================================================
   LIGHTBOX — click any service image to view it full-size
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

    const galleryImages = document.querySelectorAll(
        ".marquee-img, .nsI img, #serv, #serv2"
    );

    if (galleryImages.length === 0) return;

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Image preview");
    lightbox.innerHTML = `
        <button class="lightboxClose" aria-label="Close preview">&times;</button>
        <button class="lightboxNav lightboxPrev" aria-label="Previous image">&#10094;</button>
        <button class="lightboxNav lightboxNext" aria-label="Next image">&#10095;</button>
        <img class="lightboxImg" alt="">
        <p class="lightboxCaption"></p>
    `;
    document.body.appendChild(lightbox);

    const lbImg     = lightbox.querySelector(".lightboxImg");
    const lbCaption = lightbox.querySelector(".lightboxCaption");
    const btnClose  = lightbox.querySelector(".lightboxClose");
    const btnPrev   = lightbox.querySelector(".lightboxPrev");
    const btnNext   = lightbox.querySelector(".lightboxNext");

    let currentIndex = 0;

    const items = Array.from(galleryImages).map((el) => {
        let src, caption = "";

        if (el.tagName === "IMG") {
            src = el.getAttribute("src");
            const card = el.closest(".nsI");
            if (card) {
                const p = card.querySelector("p");
                if (p) caption = p.innerHTML.replace(/<br\s*\/?>/gi, " · ").trim();
            }
        } else {
            const bg = getComputedStyle(el).backgroundImage;
            const match = bg.match(/url\(["']?(.*?)["']?\)/);
            src = match ? match[1] : "";
            const p = el.querySelector("p");
            if (p) caption = p.innerText.trim();
        }
        return { src, caption };
    }).filter((item) => item.src);

    function show(index) {
        currentIndex = (index + items.length) % items.length;
        const item = items[currentIndex];
        lbImg.src = item.src;
        lbImg.alt = item.caption || "Preview";
        lbCaption.textContent = item.caption;

        lbImg.style.animation = "none";
        void lbImg.offsetWidth;
        lbImg.style.animation = "";
    }

    function openLightbox(index) {
        show(index);
        lightbox.classList.add("open");
        document.body.classList.add("lightboxLocked");
        btnClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove("open");
        document.body.classList.remove("lightboxLocked");
    }

    galleryImages.forEach((el) => {
        el.style.cursor = "zoom-in";
        el.addEventListener("click", () => {
            const src = el.tagName === "IMG"
                ? el.getAttribute("src")
                : (getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/) || [])[1];
            const idx = items.findIndex((i) => i.src === src);
            openLightbox(idx === -1 ? 0 : idx);
        });

        if (el.tagName === "IMG") {
            el.setAttribute("tabindex", "0");
            el.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    el.click();
                }
            });
        }
    });

    btnClose.addEventListener("click", closeLightbox);
    btnPrev.addEventListener("click", () => show(currentIndex - 1));
    btnNext.addEventListener("click", () => show(currentIndex + 1));

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape")     closeLightbox();
        if (e.key === "ArrowLeft")  show(currentIndex - 1);
        if (e.key === "ArrowRight") show(currentIndex + 1);
    });

    let touchStartX = 0;
    lightbox.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) {
            if (dx < 0) show(currentIndex + 1);
            else        show(currentIndex - 1);
        }
    }, { passive: true });
});


/* ============================================================
   CONTACT FORM — Netlify Forms submission with validation
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById('contactForm');
    if (!form) return;

    const status    = document.getElementById('formStatus');
    const message   = document.getElementById('message');
    const charCount = document.getElementById('charCount');

    // Optional mailto fallback if Netlify is unreachable
    const RECIPIENT = 'nhlamulogana26@gmail.com';

    message.addEventListener('input', function () {
        charCount.textContent = message.value.length + ' / 500';
    });

    function setError(name, text) {
        const errorBox = document.getElementById(name + 'Error');
        if (!errorBox) return true;
        errorBox.textContent = text;
        const field = document.getElementById(name);
        if (field) field.classList.toggle('invalid', text !== '');
        return text === '';
    }

    function clearError(e) {
        if (e.target.name) setError(e.target.name, '');
    }
    form.addEventListener('input', clearError);
    form.addEventListener('change', clearError);

    function validateForm() {
        const name  = form.elements.fullName.value.trim();
        const email = form.elements.email.value.trim();
        const phone = form.elements.phone.value.replace(/[\s-]/g, '');
        const text  = form.elements.message.value.trim();

        const results = [
            setError('fullName',
                name.length < 2 ? 'Please enter your full name.' :
                !/^[A-Za-z\u00C0-\u024F' -]+$/.test(name) ? 'Names can only contain letters, spaces, hyphens and apostrophes.' : ''),

            setError('email',
                email === '' ? 'Please enter your email address.' :
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email, like name@example.com.' : ''),

            setError('phone',
                phone === '' ? 'Please enter your phone number.' :
                !/^(\+27|0)[1-9][0-9]{8}$/.test(phone) ? 'Enter a valid South African number, like 079 523 6411.' : ''),

            setError('messageType',
                form.elements.messageType.value === '' ? 'Please choose a message type.' : ''),

            setError('replyMethod',
                !form.querySelector('input[name="replyMethod"]:checked') ? 'Please choose how we should reply.' : ''),

            setError('message',
                text.length < 10 ? 'Your message must be at least 10 characters.' :
                text.length > 500 ? 'Your message must be 500 characters or fewer.' : ''),

            setError('consent',
                form.elements.consent.checked ? '' : 'Please tick the box to agree.')
        ];

        return results.every(Boolean);
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        status.className = '';
        status.textContent = '';

        if (!validateForm()) {
            status.textContent = 'Please fix the errors above and try again.';
            status.className = 'failure';
            const firstInvalid = form.querySelector('.invalid');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const checkedReply = form.querySelector('input[name="replyMethod"]:checked');
        const mailto = 'mailto:' + RECIPIENT
            + '?subject=' + encodeURIComponent(form.elements.messageType.value + ' from ' + form.elements.fullName.value.trim())
            + '&body=' + encodeURIComponent(
                'Name: '  + form.elements.fullName.value.trim() +
                '\nEmail: ' + form.elements.email.value.trim() +
                '\nPhone: ' + form.elements.phone.value.trim() +
                '\nPreferred reply: ' + (checkedReply ? checkedReply.value : '') +
                '\n\n'    + form.elements.message.value.trim());

        status.textContent = 'Sending...';

        try {
            const formData = new FormData(form);
            const body = new URLSearchParams();
            for (const [key, value] of formData.entries()) body.append(key, value);

            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: body.toString()
            });

            let result = {};
            try { result = await response.json(); } catch { /* non-JSON */ }

            const succeeded = response.ok && result.success !== false;

            if (succeeded) {
                status.textContent = 'Thank you! Your message has been sent. ';
                status.className = 'success';

                const link = document.createElement('a');
                link.href = mailto;
                link.textContent = 'Prefer email? Send this as an email instead.';
                status.appendChild(link);

                form.reset();
                charCount.textContent = '0 / 500';
            } else {
                status.textContent = 'Something went wrong. Please try again or email us directly.';
                status.className = 'failure';

                const link = document.createElement('a');
                link.href = mailto;
                link.textContent = ' Send as email instead.';
                status.appendChild(link);
            }
        } catch (error) {
            status.textContent = 'Network error. Please check your connection and try again.';
            status.className = 'failure';

            const link = document.createElement('a');
            link.href = mailto;
            link.textContent = ' Or send as email instead.';
            status.appendChild(link);
        }
    });
});

/* ============================================================
   LEAFLET MAP — only runs on the contact page
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {

    const mapEl = document.getElementById('map');
    if (!mapEl) return;                              // not on contact page
    if (typeof L === 'undefined') {                  // Leaflet failed to load
        console.warn('Leaflet is not loaded — check the <script> tag in contact.html.');
        mapEl.innerHTML = '<p style="padding:20px;color:#ff8fa3;">Map failed to load. Please check your connection.</p>';
        return;
    }

    const salonLocation = [-26.19518, 28.03518];

    const map = L.map(mapEl, {
        scrollWheelZoom: false,      // stops the page from jumping when the cursor scrolls over the map
        zoomControl: true
    }).setView(salonLocation, 15);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const marker = L.marker(salonLocation).addTo(map);
    marker.bindPopup("<b>Grabbers</b><br>Find us here").openPopup();

    const locateBtn = document.getElementById('locateBtn');
    if (locateBtn) {
        locateBtn.addEventListener('click', function () {
            map.locate({ setView: true, maxZoom: 16 });
        });
    }

    map.on('locationfound', function (e) {
        L.circleMarker(e.latlng, { radius: 8 })
            .addTo(map)
            .bindPopup('You are here')
            .openPopup();
    });

    map.on('locationerror', function () {
        alert('Sorry, we could not find your location.');
    });

    // Make sure Leaflet lays out correctly if the page loads
    // while the card is still animating into view.
    setTimeout(() => map.invalidateSize(), 300);
});

/*
   ENQUIRY FORM — Dynamic Content, AJAX Simulation & Validation
  */
document.addEventListener("DOMContentLoaded", () => {
    const enqForm = document.getElementById("enquiryForm");
    if (!enqForm) return;

    const modal = document.getElementById("responseModal");
    const modalText = document.getElementById("modalResponseText");
    const closeModalBtn = document.querySelector(".closeModalBtn");
    const submitBtn = document.getElementById("submitBtn");
    const statusMsg = document.getElementById("enquiryStatus");

    // --- Helper: Set & Clear Errors ---
    function setError(id, msg) {
        const errorSpan = document.getElementById(id + "Error");
        const field = document.getElementById(id);
        if (errorSpan) errorSpan.textContent = msg;
        if (field) field.classList.toggle("invalid", msg !== "");
        return msg === "";
    }

    // Clear errors as the user types/fixes
    enqForm.addEventListener("input", (e) => {
        if (e.target.id) setError(e.target.id, "");
    });

    // --- Validation Logic ---
    function validateEnquiry() {
        const name = document.getElementById("enqName").value.trim();
        const email = document.getElementById("enqEmail").value.trim();
        const phone = document.getElementById("enqPhone").value.replace(/[\s-]/g, '');
        const service = document.getElementById("enqService").value;
        const message = document.getElementById("enqMessage").value.trim();

        const results = [
            setError("enqName", name.length < 2 ? "Please enter your full name." : ""),
            setError("enqEmail", 
                email === "" ? "Please enter your email." : 
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email address." : ""),
            setError("enqPhone", 
                phone === "" ? "Please enter your phone number." : 
                !/^(\+27|0)[1-9][0-9]{8}$/.test(phone) ? "Enter a valid SA number (e.g., 079 523 6411)." : ""),
            setError("enqService", service === "" ? "Please select a topic." : ""),
            setError("enqMessage", message.length < 10 ? "Message must be at least 10 characters." : "")
        ];

        return results.every(Boolean);
    }

    // --- Mock "Database" for Dynamic Content ---
    function getDynamicResponse(service) {
        const responses = {
            "gel-nails": "Our <b>Gel Nails</b> start at <b>R390</b>. We have slots available this Thursday and Friday afternoon.",
            "acrylics": "Our <b>Acrylic Extensions</b> start at <b>R460</b>. Please note we require a R100 deposit for acrylic bookings.",
            "french-tips": "A classic <b>French Tip</b> set is <b>R450</b>. We currently have wide availability next week Monday.",
            "pedicure": "Our spa <b>Pedicure</b> is <b>R260</b>. Unfortunately, we are fully booked this weekend, but we have space on Tuesday.",
            "job": "Thank you for your interest in joining Grabbers! We are currently looking for a part-time nail tech. Our manager will review your message and contact you soon.",
            "other": "Thank you for your message. A member of our customer service team will review your query and get back to you within 24 hours."
        };
        return responses[service] || responses["other"];
    }

    // --- Submit & AJAX Simulation ---
    enqForm.addEventListener("submit", (e) => {
        e.preventDefault();
        statusMsg.textContent = "";

        if (!validateEnquiry()) {
            statusMsg.textContent = "Please fix the errors above.";
            statusMsg.style.color = "#ff9aa2";
            return;
        }

        // Simulate AJAX loading state
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
        statusMsg.style.color = "var(--gold)";
        statusMsg.textContent = "Sending enquiry via secure server...";

        // Simulate network delay (1.2 seconds)
        setTimeout(() => {
            const service = document.getElementById("enqService").value;
            const name = document.getElementById("enqName").value.trim().split(" ")[0]; // Get first name

            // Inject dynamic content into the modal
            modalText.innerHTML = `<p>Hi <b>${name}</b>,</p><p>${getDynamicResponse(service)}</p>`;

            // Show Modal
            modal.classList.add("active");

            // Reset Form & Button
            enqForm.reset();
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Enquiry";
            statusMsg.textContent = "";

        }, 1200);
    });

    // --- Modal Controls ---
    function closeModal() {
        modal.classList.remove("active");
    }

    closeModalBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();
    });
});