// BlingoBoy widget no index
document.addEventListener('DOMContentLoaded', () => {
    const btn     = document.getElementById('blingo-saibamais');
    const overlay = document.getElementById('blingo-info-overlay');
    const close   = document.getElementById('blingo-info-close');
    if (!btn || !overlay) return;

    // ── Slideshow ─────────────────────────────────────────────────────
    const slides = Array.from(document.querySelectorAll('.blingo-slide'));
    const dotsEl = document.getElementById('blingo-dots');
    let current  = 0;
    let timer;

    // Criar dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'blingo-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(dot);
    });

    function goTo(n) {
        slides[current].classList.remove('active');
        document.querySelectorAll('.blingo-dot')[current].classList.remove('active');
        current = (n + slides.length) % slides.length;
        slides[current].classList.add('active');
        document.querySelectorAll('.blingo-dot')[current].classList.add('active');
    }

    function startTimer() {
        clearInterval(timer);
        timer = setInterval(() => goTo(current + 1), 2800);
    }

    // ── Abrir / fechar ────────────────────────────────────────────────
    btn.addEventListener('click', () => {
        overlay.style.display = 'flex';
        goTo(0);
        startTimer();
    });

    close.addEventListener('click', () => {
        overlay.style.display = 'none';
        clearInterval(timer);
    });

    overlay.addEventListener('click', e => {
        if (e.target === overlay) {
            overlay.style.display = 'none';
            clearInterval(timer);
        }
    });
});
