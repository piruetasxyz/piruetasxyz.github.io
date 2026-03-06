const lang = localStorage.getItem('language') || 'en';
document.documentElement.setAttribute('lang', lang);

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('english').addEventListener('click', (e) => {
        e.preventDefault();
        document.documentElement.setAttribute('lang', 'en');
        localStorage.setItem('language', 'en');
    });

    document.getElementById('espanol').addEventListener('click', (e) => {
        e.preventDefault();
        document.documentElement.setAttribute('lang', 'es');
        localStorage.setItem('language', 'es');
    });

    document.querySelector('.right').addEventListener('click', () => {
        const menu = document.getElementById('divLeftMenu');
        const btn = document.getElementById('menu-btn');
        if (menu.classList.contains('active')) {
            menu.classList.remove('active');
            btn.innerText = 'menú';
        }
    });
});