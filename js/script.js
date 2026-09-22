const langBtn = document.getElementById('lang-btn');
const langSpans = langBtn.querySelectorAll('[data-lang]');

function updateLangBtn(lang) {
    langSpans.forEach((span) => {
        span.classList.toggle('toggle-active', span.dataset.lang === lang);
    });
}

function updateDocumentTitle(lang) {
    const heading = document.querySelector('h1.cajita');
    let text = '';
    if (heading) {
        const span = heading.querySelector('.' + lang);
        text = (span ? span.textContent : heading.textContent).trim();
    }
    document.title = text ? text + ' — piruetas' : 'piruetas';
}

// exposed so render.js can refresh the title once it fills in
// content that was empty (and thus title-less) at page load
window.refreshDocumentTitle = function () {
    updateDocumentTitle(document.documentElement.getAttribute('lang'));
};

function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('language', lang);
    updateLangBtn(lang);
    updateDocumentTitle(lang);
    if (window.refreshGaleriaAlt) window.refreshGaleriaAlt();
}

applyLang(localStorage.getItem('language') || 'en');

langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const next = document.documentElement.getAttribute('lang') === 'en' ? 'es' : 'en';
    applyLang(next);
});