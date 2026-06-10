function initCoolFX() {
    // texto ondulado (.wavy) — quebra em spans pra animação letra a letra
    document.querySelectorAll('.wavy').forEach(container => {
        const original = container.textContent.trim();
        container.innerHTML = original
            .split('')
            .map(l => l === ' ' ? `<span>&nbsp;</span>` : `<span>${l}</span>`)
            .join('');
    });

    function animateWavy(time) {
        document.querySelectorAll('.wavy span').forEach((letter, index) => {
            const dy  = Math.sin(time * 0.006 + index * 0.5) * 4.3;
            const hue = (time * 0.1 + index * 15) % 360;
            letter.style.display     = 'inline-block';
            letter.style.transform   = `translateY(${dy}px)`;
            letter.style.color       = `hsl(${hue}, 100%, 40%)`;
            letter.style.textShadow  = `-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 5px hsl(${hue}, 100%, 50%)`;
        });
        requestAnimationFrame(animateWavy);
    }

    if (document.querySelector('.wavy')) requestAnimationFrame(animateWavy);

    // mascote: pula aleatoriamente
    const mascotImg   = document.querySelector('.mascot-img-render');
    const mascotEmoji = document.getElementById('mascot-fallback');
    const mascot      = (mascotImg && mascotImg.style.display !== 'none') ? mascotImg : mascotEmoji;

    if (mascot) {
        setInterval(() => {
            mascot.style.transition = 'transform 0.15s ease-out';
            mascot.style.transform  = 'scale(1.15)';
            setTimeout(() => { mascot.style.transform = 'scale(1)'; }, 150);
        }, 3000 + Math.random() * 2000);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoolFX);
} else {
    initCoolFX();
}
