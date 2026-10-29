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