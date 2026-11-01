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

        // Wait one frame so the browser applies the new padding
        // from `.accordianContent.active` BEFORE we measure scrollHeight.
        requestAnimationFrame(() => {
            // +2px safety margin guards against sub-pixel rounding
            content.style.maxHeight = (content.scrollHeight + 2) + "px";
        });
    }

    accordionHeaders.forEach((header) => {
        header.addEventListener("click", () => {
            const item = header.parentElement;
            const content = item.querySelector(".accordianContent");
            if (!content) return;

            const isOpen = content.classList.contains("active");

            closeAll(); // single-open accordion

            if (!isOpen) openPanel(header);
        });

        header.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                header.click();
            }
        });
    });

    // If the viewport changes, text may reflow and the stored max-height
    // can become too small. Re-measure any open panel so nothing clips.
    window.addEventListener("resize", () => {
        accordionContents.forEach((content) => {
            if (content.classList.contains("active")) {
                content.style.maxHeight = (content.scrollHeight + 2) + "px";
            }
        });
    });
});

/* LIGHTBOX — click any service image to view it full-size */
document.addEventListener("DOMContentLoaded", () => {

    // Collect every image we want to make zoomable
    const galleryImages = document.querySelectorAll(
        ".marquee-img, .nsI img, #serv, #serv2"
    );

    if (galleryImages.length === 0) return;   // not on services page

    //  Build the lightbox DOM once 
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

    // Build a list of {src, caption} objects
    const items = Array.from(galleryImages).map((el) => {
        let src, caption = "";

        if (el.tagName === "IMG") {
            src = el.getAttribute("src");
            // If the img lives inside a .nsI card, pull the caption from the <p> below it
            const card = el.closest(".nsI");
            if (card) {
                const p = card.querySelector("p");
                if (p) caption = p.innerHTML.replace(/<br\s*\/?>/gi, " · ").trim();
            }
        } else {
            // #serv / #serv2 — use the CSS background image
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

    //  Wire up clicks 
    galleryImages.forEach((el) => {
        el.style.cursor = "zoom-in";
        el.addEventListener("click", (e) => {
            const src = el.tagName === "IMG"
                ? el.getAttribute("src")
                : (getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/) || [])[1];
            const idx = items.findIndex((i) => i.src === src);
            openLightbox(idx === -1 ? 0 : idx);
        });

        // Keyboard accessibility to make each thumbnail focusable
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

    //  Controls 
    btnClose.addEventListener("click", closeLightbox);
    btnPrev.addEventListener("click", () => show(currentIndex - 1));
    btnNext.addEventListener("click", () => show(currentIndex + 1));

    // Click the dark backdrop to close
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("open")) return;
        if (e.key === "Escape")     closeLightbox();
        if (e.key === "ArrowLeft")  show(currentIndex - 1);
        if (e.key === "ArrowRight") show(currentIndex + 1);
    });

    //  Swipe support for mobile
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