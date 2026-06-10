// Quiz Engine — Clubingue v2

const SFX = {
    correct:  '../../assets/sfx/snd-board-shine-get.mp3',
    wrong:    '../../assets/sfx/snd-buzzerwrong.mp3',
    type:     '../../assets/sfx/snd-board-text-main.mp3',
    unlock:   '../../assets/sfx/snd-link-sfx-itemget.mp3',
    complete: '../../assets/sfx/snd-board-text-main-end.mp3',
    click:    '../../assets/sfx/snd-barrel-jump.mp3',
};

function playsfx(key) {
    try {
        const a = new Audio(SFX[key]);
        a.volume = 0.5;
        a.play().catch(() => {});
    } catch {}
}

// fallback para páginas sem GAME_DATA
const DEFAULT_GAME = {
    eyebrow: 'EM DESENVOLVIMENTO',
    title: 'BlingoBoy',
    titleSub: '3000',
    description: 'Um jogo de plataforma 2D onde você controla o Pato pelo mundo do Clubingue, coletando conhecimento e enfrentando desafios de cada matéria. Quanto mais você estuda, mais fases você desbloqueia.',
    features: [
        { icon: 'fa-map',    text: 'Fases temáticas por matéria' },
        { icon: 'fa-trophy', text: 'Sistema de XP e conquistas' },
        { icon: 'fa-brain',  text: 'Perguntas integradas ao gameplay' },
        { icon: 'fa-users',  text: 'Ranking entre amigos' },
    ],
    slides: [
        { src: '../../assets/images/game/blingo.png',        label: 'Console BlingoBoy 3000' },
        { src: '../../assets/images/logos/patomenino.png',   label: 'Personagem: Pato Menino' },
        { src: '../../assets/images/logos/pato.png',         label: 'Mascote do Clubingue' },
    ],
    available: false,
    wipNote: 'Em desenvolvimento — em breve disponível',
};

document.addEventListener('DOMContentLoaded', () => {
    const data = window.QUIZ_DATA;
    const container = document.getElementById('quiz-container');
    if (!data || !container) return;

    let current = 0;
    let score   = 0;
    const total = data.length;

    function render() {
        if (current >= total) { showResult(); return; }
        const q = data[current];
        container.innerHTML = '';

        // Header com barra de progresso e contagem de acertos
        const pct = total > 0 ? (current / total) * 100 : 0;
        const header = document.createElement('div');
        header.className = 'quiz-header';
        header.innerHTML = `
            <div class="quiz-header-top">
                <span class="quiz-progress-label">QUESTÃO ${current + 1} DE ${total}</span>
                <span class="quiz-score-live"><i class="fa-solid fa-star"></i> ${score} acerto${score !== 1 ? 's' : ''}</span>
            </div>
            <div class="quiz-progress-bar"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
        `;
        container.appendChild(header);

        const enunciado = document.createElement('p');
        enunciado.className = 'quiz-question';
        enunciado.textContent = q.question;
        container.appendChild(enunciado);

        if (q.type === 'choice') renderChoice(q);
        else if (q.type === 'type') renderType(q);
    }

    function renderChoice(q) {
        const grid = document.createElement('div');
        grid.className = 'quiz-choices';

        q.options.forEach((opt, i) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-choice-btn';
            btn.innerHTML = `<span class="quiz-choice-letter">${String.fromCharCode(65+i)}</span>${opt}`;
            btn.addEventListener('click', () => {
                if (container.querySelector('.answered')) return;
                playsfx('click');
                grid.querySelectorAll('.quiz-choice-btn').forEach(b => b.classList.add('answered'));
                const correct = opt === q.answer;
                btn.classList.add(correct ? 'correct' : 'wrong');
                if (correct) {
                    score++;
                    playsfx('correct');
                    grid.querySelectorAll('.quiz-choice-btn').forEach(b => {
                        if (b.textContent.includes(q.answer)) b.classList.add('correct');
                    });
                } else {
                    playsfx('wrong');
                    grid.querySelectorAll('.quiz-choice-btn').forEach(b => {
                        if (b.textContent.includes(q.answer)) b.classList.add('correct');
                    });
                }
                showFeedback(correct, q.explanation);
            });
            grid.appendChild(btn);
        });
        container.appendChild(grid);
    }

    function renderType(q) {
        const wrap = document.createElement('div');
        wrap.className = 'quiz-type-wrap';
        wrap.innerHTML = `
            <input class="quiz-type-input" type="text" placeholder="Digite sua resposta...">
            <button class="quiz-type-submit"><i class="fa-solid fa-paper-plane"></i> Responder</button>
        `;
        container.appendChild(wrap);
        const input = wrap.querySelector('.quiz-type-input');
        const btn   = wrap.querySelector('.quiz-type-submit');
        let typeTimer;
        input.addEventListener('input', () => {
            clearTimeout(typeTimer);
            typeTimer = setTimeout(() => playsfx('type'), 80);
        });
        function submit() {
            if (!input.value.trim()) return;
            btn.disabled = true; input.disabled = true;
            const userAns = input.value.trim().toLowerCase();
            const correct = q.answers.some(a => userAns.includes(a.toLowerCase()));
            if (correct) { score++; playsfx('correct'); }
            else { playsfx('wrong'); }
            input.classList.add(correct ? 'correct' : 'wrong');
            showFeedback(correct, q.explanation);
        }
        btn.addEventListener('click', submit);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    }

    function showFeedback(correct, explanation) {
        const fb = document.createElement('div');
        fb.className = `quiz-feedback ${correct ? 'correct' : 'wrong'}`;
        fb.innerHTML = `
            <div class="quiz-feedback-icon">${correct ? '✓' : '✗'}</div>
            <div>
                <strong>${correct ? 'Certo!' : 'Errado!'}</strong>
                ${explanation ? `<p>${explanation}</p>` : ''}
            </div>
        `;
        container.appendChild(fb);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'quiz-next-btn';
        nextBtn.innerHTML = current < total - 1
            ? '<i class="fa-solid fa-arrow-right"></i> Próxima'
            : '<i class="fa-solid fa-flag-checkered"></i> Ver resultado';
        nextBtn.addEventListener('click', () => { current++; render(); playsfx('click'); });
        container.appendChild(nextBtn);
    }

    function showResult() {
        playsfx('complete');
        const pct = Math.round((score / total) * 100);
        container.innerHTML = `
            <div class="quiz-result">
                <div class="quiz-result-score">${score}<span>/${total}</span></div>
                <div class="quiz-result-label">${
                    pct >= 80 ? '🌟 Excelente!' :
                    pct >= 60 ? '👍 Bom trabalho!' :
                    '📚 Continue estudando!'
                }</div>
                <div class="quiz-result-bar">
                    <div class="quiz-result-fill" style="width:${pct}%"></div>
                </div>
                <p class="quiz-result-pct">${pct}% de acerto</p>
                <button class="quiz-retry-btn" id="quiz-retry"><i class="fa-solid fa-rotate-left"></i> Tentar novamente</button>
            </div>
        `;
        document.getElementById('quiz-retry').addEventListener('click', () => {
            current = 0; score = 0; render(); playsfx('click');
        });
        setTimeout(() => unlockBlingo(score, total), 600);
    }

    function unlockBlingo(finalScore, finalTotal) {
        playsfx('unlock');

        const old = document.querySelector('.blingo-unlock-banner');
        if (old) old.remove();

        const pct = Math.round((finalScore / finalTotal) * 100);
        const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '🎮' : '🎲';

        const game = window.GAME_DATA || DEFAULT_GAME;
        const available = game.available === true;

        const unlock = document.createElement('div');
        unlock.className = 'blingo-unlock-banner';
        unlock.innerHTML = `
            <div class="blingo-unlock-inner">
                <img src="../../assets/images/game/blingo.png" alt="" class="blingo-unlock-img">
                <div class="blingo-unlock-info">
                    <div class="blingo-unlock-title">${emoji} ${available ? game.title : 'BlingoBoy'} desbloqueado!</div>
                    <div class="blingo-unlock-sub">Quiz concluído · ${finalScore}/${finalTotal} acertos</div>
                </div>
                <div class="blingo-unlock-actions">
                    <button class="blingo-unlock-btn" id="blingo-unlock-open">
                        <i class="fa-solid fa-gamepad"></i> Jogar
                    </button>
                    <button class="blingo-gameinfo-btn" id="blingo-gameinfo-open">
                        <i class="fa-solid fa-circle-info"></i> Ver jogo
                    </button>
                </div>
            </div>
        `;
        container.after(unlock);
        setTimeout(() => unlock.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);

        document.getElementById('blingo-unlock-open').addEventListener('click', () => {
            playsfx('click');
            const w = document.getElementById('blingo-widget');
            if (w) {
                w.style.display = 'flex';
                w.style.bottom  = '80px';
                w.style.right   = '24px';
                w.style.top     = w.style.left = 'auto';
            }
        });

        document.getElementById('blingo-gameinfo-open').addEventListener('click', () => {
            playsfx('click');
            showGameInfoOverlay();
        });
    }

    // ── Overlay "Ver jogo" ────────────────────────────────────────────
    function showGameInfoOverlay() {
        const old = document.getElementById('blingo-game-overlay');
        if (old) { old.remove(); return; }

        const game = window.GAME_DATA || DEFAULT_GAME;
        const available = game.available === true;

        // Gera slides HTML
        const slidesHTML = game.slides.map((s, i) => `
            <div class="blingo-gslide${i === 0 ? ' active' : ''}">
                <img src="${s.src}" alt="${s.label}">
                <span class="blingo-gslide-label">${s.label}</span>
            </div>
        `).join('');

        // Gera features HTML
        const featuresHTML = game.features.map(f => `
            <li><i class="fa-solid ${f.icon}"></i> ${f.text}</li>
        `).join('');

        const overlay = document.createElement('div');
        overlay.id = 'blingo-game-overlay';
        overlay.className = 'blingo-game-overlay';
        overlay.innerHTML = `
            <div class="blingo-game-modal">
                <button class="blingo-game-modal-close" id="blingo-gmo-close"><i class="fa-solid fa-xmark"></i></button>

                <div class="blingo-game-modal-left">
                    <div class="blingo-game-slideshow">
                        ${slidesHTML}
                    </div>
                    <div class="blingo-gslide-dots" id="blingo-gslide-dots"></div>
                    <div class="blingo-gslide-nav">
                        <button class="blingo-gslide-prev" id="blingo-gs-prev"><i class="fa-solid fa-chevron-left"></i></button>
                        <button class="blingo-gslide-next" id="blingo-gs-next"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                </div>

                <div class="blingo-game-modal-right">
                    <div class="blingo-game-eyebrow">${game.eyebrow}</div>
                    <h2 class="blingo-game-title">${game.title}${game.titleSub ? `<br><span>${game.titleSub}</span>` : ''}</h2>
                    <p class="blingo-game-desc">${game.description}</p>
                    <ul class="blingo-game-features">
                        ${featuresHTML}
                    </ul>
                    ${available
                        ? `<button class="blingo-game-play-btn" id="blingo-launch-btn">
                            <i class="fa-solid fa-play"></i> Jogar
                           </button>`
                        : `<button class="blingo-game-play-btn" disabled>
                            <i class="fa-solid fa-play"></i>
                            Jogar
                            <span class="blingo-game-wip">EM BREVE</span>
                           </button>
                           <p class="blingo-game-wip-note">
                               <i class="fa-solid fa-hammer"></i> ${game.wipNote || 'Em desenvolvimento — em breve disponível'}
                           </p>`
                    }
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));

        // Slideshow
        const slides = Array.from(overlay.querySelectorAll('.blingo-gslide'));
        const dotsEl = overlay.querySelector('#blingo-gslide-dots');
        let cur = 0, timer;

        slides.forEach((_, i) => {
            const d = document.createElement('button');
            d.className = 'blingo-gs-dot' + (i === 0 ? ' active' : '');
            d.addEventListener('click', () => { goTo(i); resetTimer(); });
            dotsEl.appendChild(d);
        });

        function goTo(n) {
            slides[cur].classList.remove('active');
            dotsEl.querySelectorAll('.blingo-gs-dot')[cur].classList.remove('active');
            cur = (n + slides.length) % slides.length;
            slides[cur].classList.add('active');
            dotsEl.querySelectorAll('.blingo-gs-dot')[cur].classList.add('active');
        }

        function resetTimer() {
            clearInterval(timer);
            timer = setInterval(() => goTo(cur + 1), 3000);
        }
        resetTimer();

        overlay.querySelector('#blingo-gs-prev').addEventListener('click', () => { goTo(cur - 1); resetTimer(); });
        overlay.querySelector('#blingo-gs-next').addEventListener('click', () => { goTo(cur + 1); resetTimer(); });

        // Fechar
        const closeOverlay = () => {
            clearInterval(timer);
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };
        overlay.querySelector('#blingo-gmo-close').addEventListener('click', closeOverlay);
        overlay.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });
    }

    // expõe pro blingo.js usar ao terminar sessão
    window.showGameInfoOverlay = showGameInfoOverlay;

    render();
});
