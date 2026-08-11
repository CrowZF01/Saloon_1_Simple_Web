/* ==========================================================================
   SCROLL REVEAL FADE-IN OBSERVER (LIGHTWEIGHT & 60FPS NATIVE PERFORMANCE)
   ========================================================================== */

let revealObserver = null;

export function observeRevealElements(container = document) {
    const revealElements = container.querySelectorAll ? container.querySelectorAll('.reveal:not(.revealed)') : [];

    if (!revealObserver && 'IntersectionObserver' in window) {
        revealObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });
    }

    if (revealObserver && revealElements.length > 0) {
        revealElements.forEach(el => revealObserver.observe(el));
    } else if (!('IntersectionObserver' in window)) {
        revealElements.forEach(el => el.classList.add('revealed'));
    }
}

// Global window exposure for non-module scripts or inline callbacks if needed
if (typeof window !== 'undefined') {
    window.observeRevealElements = observeRevealElements;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => observeRevealElements());
} else {
    observeRevealElements();
}
