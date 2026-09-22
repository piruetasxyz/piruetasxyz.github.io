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

// exposed so render.js (or a generator script's baked page) can
// refresh the title once content that was empty (and thus
// title-less) at page load gets filled in
window.refreshDocumentTitle = function () {
    updateDocumentTitle(document.documentElement.getAttribute('lang'));
};

// swaps each gallery photo's alt text between the data-alt-es/en
// baked onto its <img> by the generator (or, on pages not yet
// migrated, by render.js) when the language toggles
window.refreshGaleriaAlt = function () {
    const lang = document.documentElement.getAttribute('lang') || 'en';
    const key = 'alt' + (lang === 'es' ? 'Es' : 'En');
    document.querySelectorAll('.galeria-item img').forEach((img) => {
        img.alt = img.dataset[key] || '';
    });
};

function applyLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    localStorage.setItem('language', lang);
    updateLangBtn(lang);
    updateDocumentTitle(lang);
    window.refreshGaleriaAlt();
}

applyLang(localStorage.getItem('language') || 'en');

langBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const next = document.documentElement.getAttribute('lang') === 'en' ? 'es' : 'en';
    applyLang(next);
});