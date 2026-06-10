// BlingoBoy 3000 — v3

const BLINGO_FALLBACK = [
    { type:'choice', question:'Qual é a capital do Brasil?', options:['Brasília','São Paulo','Rio de Janeiro','Salvador'], answer:'Brasília', explanation:'Brasília é a capital federal desde 1960.' },
    { type:'choice', question:'Quanto é 7 × 8?', options:['56','54','48','64'], answer:'56', explanation:'7 × 8 = 56.' },
    { type:'choice', question:'Maior planeta do sistema solar?', options:['Júpiter','Saturno','Netuno','Urano'], answer:'Júpiter', explanation:'Júpiter é o maior planeta do sistema solar.' },
];

function blingoInit() {
    const btn      = document.getElementById('blingo-btn');
    const widget   = document.getElementById('blingo-widget');
    const handle   = document.getElementById('blingo-drag-handle');
    const closeBtn = document.getElementById('blingo-close');
    if (!btn || !widget) return;

    const pool = (window.QUIZ_DATA && window.QUIZ_DATA.length) ? window.QUIZ_DATA : BLINGO_FALLBACK;

    const pageQuiz = document.getElementById('quiz-container');
    if (pageQuiz) pageQuiz.style.display = 'none';

    const loaderTag = Array.from(document.querySelectorAll('script[src]')).find(s => s.src.includes('loader.js'));
    const jsBase  = loaderTag ? loaderTag.src.replace('loader.js', '') : '';
    const imgBase = jsBase.replace('assets/js/', 'assets/images/game/');
    const sfxBase = jsBase.replace('assets/js/', 'assets/sfx/');

    // ── SFX ──────────────────────────────────────────────────────────
    function playsfx(name) {
        try {
            const a = new Audio(sfxBase + name);
            a.volume = 0.5;
            a.play().catch(() => {});
            return a;
        } catch { return null; }
    }

    // Toca load-loop 2x e depois chama onEnd
    let loadLoopAudio = null;
    function playLoadLoop(onEnd) {
        if (loadLoopAudio) { try { loadLoopAudio.pause(); } catch {} }
        let plays = 0;
        const LOOP_COUNT = 2;
        function startPlay() {
            const a = new Audio(sfxBase + 'load-loop.mp3');
            a.volume = 0.5;
            loadLoopAudio = a;
            a.addEventListener('ended', () => {
                plays++;
                if (plays < LOOP_COUNT) {
                    startPlay();
                } else {
                    loadLoopAudio = null;
                    onEnd();
                }
            }, { once: true });
            a.play().catch(() => { loadLoopAudio = null; onEnd(); });
        }
        startPlay();
    }

    function stopLoadLoop() {
        if (loadLoopAudio) {
            try { loadLoopAudio.pause(); } catch {}
            loadLoopAudio = null;
        }
    }

    // ── Deck ─────────────────────────────────────────────────────────
    const BLINGO_PCT = window.BLINGO_PCT || 0.8;
    let deck = [];
    let total = 0;
    let score = 0, answered = 0;
    let streak = 0; // streak de acertos consecutivos

    function buildDeck() {
        const all = pool.map((_, i) => i);
        for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all[i], all[j]] = [all[j], all[i]];
        }
        const count = Math.max(1, Math.ceil(all.length * BLINGO_PCT));
        deck = all.slice(0, count);
        total = deck.length;
    }

    function pickQ() { return pool[deck.pop()]; }

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    // ── Score bar ────────────────────────────────────────────────────
    function updateScoreBar() {
        const bar = widget.querySelector('.blingo-score-bar-fill');
        const lbl = widget.querySelector('.blingo-score-label');
        if (!bar || !lbl) return;
        const pct = answered === 0 ? 0 : Math.round((score / answered) * 100);
        bar.style.width = pct + '%';
        bar.style.background = pct >= 70 ? '#1aff6a' : pct >= 40 ? '#FFD700' : '#ff3b3b';
        lbl.textContent = `${answered}/${total}`;
    }

    // ── Perguntas ────────────────────────────────────────────────────
    function renderQ() {
        if (deck.length === 0) {
            showLoadingScreen();
            return;
        }
        const q = pickQ();
        const screen = widget.querySelector('.blingo-widget-screen');
        const isType = q.type === 'type';

        const optsBtns = isType ? `
            <div class="blingo-type-wrap">
                <input class="blingo-type-input" type="text" placeholder="Digite a resposta...">
                <button class="blingo-type-submit"><i class="fa-solid fa-paper-plane"></i> Responder</button>
            </div>` :
            shuffle(q.options).map(o =>
                `<button class="blingo-opt" data-correct="${o === q.answer}" data-explanation="${(q.explanation||'').replace(/"/g,'&quot;')}">${o}</button>`
            ).join('');

        screen.innerHTML = `
            <div class="blingo-score-row">
                <div class="blingo-score-bar-bg"><div class="blingo-score-bar-fill"></div></div>
                <span class="blingo-score-label">${answered}/${total}</span>
            </div>
            <div class="blingo-console-wrap">
                <div class="blingo-visor"><p class="blingo-question">${q.question}</p></div>
                <img class="blingo-console-img" src="${imgBase}blingo.png" alt="">
            </div>
            <div class="blingo-opts">${optsBtns}</div>`;

        updateScoreBar();

        if (isType) {
            const input  = screen.querySelector('.blingo-type-input');
            const submit = screen.querySelector('.blingo-type-submit');

            // SFX ao digitar
            input.addEventListener('input', () => {
                if (input.value.length > 0) playsfx('type.mp3');
            });

            const check = () => {
                if (!input.value.trim()) return;
                input.disabled = true; submit.disabled = true;
                const ans = input.value.trim().toLowerCase();
                const ok  = q.answers.some(a => ans.includes(a.toLowerCase()));
                input.classList.add(ok ? 'blingo-input-correct' : 'blingo-input-wrong');
                registerAnswer(ok);
                playsfx('submit.mp3');
                showPopup(ok, q.explanation);
                setTimeout(renderQ, ok ? 900 : 1000);
            };
            submit.addEventListener('click', check);
            input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
        } else {
            screen.querySelectorAll('.blingo-opt').forEach(b => b.addEventListener('click', () => {
                const ok  = b.dataset.correct === 'true';
                const exp = b.dataset.explanation;
                screen.querySelectorAll('.blingo-opt').forEach(x => x.disabled = true);
                b.classList.add(ok ? 'blingo-opt-correct' : 'blingo-opt-wrong');
                registerAnswer(ok);
                showPopup(ok, exp);
                setTimeout(renderQ, ok ? 900 : 1000);
            }));
        }
    }

    // Registra acerto/erro, toca SFX, checa streak
    function registerAnswer(ok) {
        answered++;
        if (ok) {
            score++;
            streak++;
            playsfx('Qright.mp3');
            if (streak > 0 && streak % 5 === 0) playsfx('streak.mp3');
        } else {
            streak = 0;
            playsfx('Qwrong.mp3');
        }
        updateScoreBar();
    }

    // ── Tela de loading ──────────────────────────────────────────────
    function showLoadingScreen() {
        const screen = widget.querySelector('.blingo-widget-screen');
        screen.innerHTML = `
            <div class="blingo-score-row">
                <div class="blingo-score-bar-bg"><div class="blingo-score-bar-fill" style="width:100%;background:#1aff6a"></div></div>
                <span class="blingo-score-label">${total}/${total}</span>
            </div>
            <div class="blingo-console-wrap">
                <div class="blingo-visor blingo-visor-loading">
                    <img class="blingo-loading-gif" src="${imgBase}wait.gif" alt="Calculando...">
                </div>
                <img class="blingo-console-img" src="${imgBase}blingo.png" alt="">
            </div>
            <div class="blingo-opts">
                <p class="blingo-loading-label">Calculando resultado...</p>
            </div>`;

        playLoadLoop(() => {
            stopLoadLoop();
            showResultScreen();
        });
    }

    // ── Tela de resultado ────────────────────────────────────────────
    function showResultScreen() {
        const screen = widget.querySelector('.blingo-widget-screen');
        const pct    = total === 0 ? 0 : Math.round((score / total) * 100);
        const pass   = pct >= 60;
        const face   = pass ? 'happy.png' : 'bad.png';
        const barClr = pct >= 70 ? '#1aff6a' : pct >= 40 ? '#FFD700' : '#ff3b3b';
        const msg    = pass
            ? `${pct}% — Passou! 🎉`
            : `${pct}% — Tente de novo!`;

        screen.innerHTML = `
            <div class="blingo-score-row">
                <div class="blingo-score-bar-bg"><div class="blingo-score-bar-fill" style="width:${pct}%;background:${barClr}"></div></div>
                <span class="blingo-score-label">${score}/${total}</span>
            </div>
            <div class="blingo-console-wrap">
                <div class="blingo-visor">
                    <img class="blingo-result-face" src="${imgBase}${face}" alt="">
                    <p class="blingo-question blingo-result-msg">${msg}</p>
                </div>
                <img class="blingo-console-img" src="${imgBase}blingo.png" alt="">
            </div>
            <div class="blingo-opts">
                ${pass ? `<button class="blingo-opt" id="blingo-gameinfo-btn"><i class="fa-solid fa-gamepad"></i> Ver o jogo</button>` : ''}
                <button class="blingo-opt blingo-opt-restart" id="blingo-restart-btn">🔄 Jogar de novo</button>
            </div>`;

        playsfx(pass ? 'score-sufficient.mp3' : 'score-low.mp3');

        if (pass) {
            screen.querySelector('#blingo-gameinfo-btn').addEventListener('click', () => {
                if (typeof window.showGameInfoOverlay === 'function') window.showGameInfoOverlay();
            });
        }
        screen.querySelector('#blingo-restart-btn').addEventListener('click', () => {
            resetSession();
            renderQ();
        });
    }

    // ── Popup de feedback ────────────────────────────────────────────
    function showPopup(ok, explanation) {
        const old = document.getElementById('blingo-popup');
        if (old) old.remove();
        const el = document.createElement('div');
        el.id = 'blingo-popup';
        el.className = 'blingo-popup ' + (ok ? 'blingo-popup-win' : 'blingo-popup-lose');
        el.innerHTML = `<span class="blingo-popup-icon blingo-popup-icon-big">${ok ? '⭐' : '💀'}</span>`;
        document.body.appendChild(el);
        requestAnimationFrame(() => el.classList.add('blingo-popup-show'));
        setTimeout(() => { el.classList.remove('blingo-popup-show'); setTimeout(() => el.remove(), 400); }, ok ? 800 : 900);
    }

    // ── Sessão ───────────────────────────────────────────────────────
    function resetSession() { score = 0; answered = 0; streak = 0; buildDeck(); }

    // ── Abrir / fechar ───────────────────────────────────────────────
    btn.addEventListener('click', () => {
        const isOpen = widget.style.display !== 'none';
        widget.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
            playsfx('open.mp3');
            resetSession();
            renderQ();
        } else {
            stopLoadLoop();
            playsfx('close.mp3');
        }
    });

    closeBtn.addEventListener('click', () => {
        stopLoadLoop();
        playsfx('close.mp3');
        widget.style.display = 'none';
    });

    window.blingoOpen = () => {
        widget.style.display = 'flex';
        widget.style.bottom = '80px'; widget.style.right = '24px';
        widget.style.top = widget.style.left = 'auto';
        playsfx('open.mp3');
        resetSession();
        renderQ();
    };

    // ── Drag ─────────────────────────────────────────────────────────
    let drag = false, sx, sy, ox, oy;
    const startDrag = (cx, cy) => {
        drag = true;
        const r = widget.getBoundingClientRect();
        sx = cx; sy = cy; ox = r.left; oy = r.top;
        widget.style.left = r.left + 'px'; widget.style.top = r.top + 'px';
        widget.style.right = 'auto'; widget.style.bottom = 'auto';
    };
    const moveDrag = (cx, cy) => {
        if (!drag) return;
        widget.style.left = Math.max(0, Math.min(window.innerWidth  - widget.offsetWidth,  ox + cx - sx)) + 'px';
        widget.style.top  = Math.max(0, Math.min(window.innerHeight - widget.offsetHeight, oy + cy - sy)) + 'px';
    };
    handle.addEventListener('mousedown',  e => { startDrag(e.clientX, e.clientY); e.preventDefault(); });
    handle.addEventListener('touchstart', e => { startDrag(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    document.addEventListener('mousemove', e => moveDrag(e.clientX, e.clientY));
    document.addEventListener('touchmove', e => moveDrag(e.touches[0].clientX, e.touches[0].clientY), { passive: true });
    document.addEventListener('mouseup',   () => { drag = false; });
    document.addEventListener('touchend',  () => { drag = false; });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', blingoInit);
} else {
    blingoInit();
}
