document.addEventListener('DOMContentLoaded', () => {
    // sync do botão de login no header
    try {
        const d = JSON.parse(localStorage.getItem('clubingue_progress'));
        if (d && d.user) {
            const loginBtn = document.getElementById('nav-auth-btn');
            if (loginBtn) {
                loginBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${d.user.name.split(' ')[0]}`;
                loginBtn.href = "#";
            }
        }
    } catch(e) { console.error(e); }

    // accordion do FAQ
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
            if (!wasOpen) item.classList.add('open');
        });
    });

    const form      = document.getElementById('support-form');
    const container = document.getElementById('rpg-dialogue-container');
    if (!form || !container) return;

    function playsfx(name) {
        try {
            const a = new Audio('assets/sfx/' + name);
            a.volume = 0.5;
            a.play().catch(() => {});
        } catch {}
    }

    function typewrite(el, text, speed, cb) {
        el.textContent = '';
        let i = 0;
        const iv = setInterval(() => {
            if (i < text.length) { el.textContent += text[i++]; }
            else { clearInterval(iv); if (cb) cb(); }
        }, speed || 28);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const nome      = document.getElementById('form-nome').value.trim().split(' ')[0];
        const btnSubmit = document.getElementById('btn-submit-form');
        btnSubmit.style.display = 'none';

        container.innerHTML = `
            <div class="rpg-box animate-pop" id="rpg-box">
                <div class="rpg-speaker-tag">PATO SÁVIO DIZ:</div>
                <div class="rpg-scene">
                    <div class="rpg-img-wrap">
                        <img id="rpg-mail" class="rpg-form-img rpg-mail-img" src="assets/images/form/mail_opened.png" alt="carta">
                        <img id="rpg-bin"  class="rpg-form-img rpg-bin-img"  src="assets/images/form/bin_empty.png"  alt="lixeira" style="opacity:0;">
                    </div>
                    <div class="rpg-avatar-side">🦆</div>
                </div>
                <div class="rpg-text"    id="rpg-text"></div>
                <div class="rpg-actions" id="rpg-actions"></div>
            </div>
        `;

        const textEl    = document.getElementById('rpg-text');
        const actionsEl = document.getElementById('rpg-actions');
        const mailImg   = document.getElementById('rpg-mail');
        const binImg    = document.getElementById('rpg-bin');

        function clearActions() { actionsEl.innerHTML = ''; }

        function addNextBtn(cb) {
            clearActions();
            const btn = document.createElement('button');
            btn.className = 'rpg-btn';
            btn.innerHTML = 'Próximo <i class="fa-solid fa-chevron-right"></i>';
            btn.onclick = () => { clearActions(); cb(); };
            actionsEl.appendChild(btn);
        }

        // cena 1 — carta aberta, pato empolgado
        function cena1() {
            mailImg.src       = 'assets/images/form/mail_opened.png';
            mailImg.className = 'rpg-form-img rpg-mail-img';
            binImg.style.opacity = '0';
            typewrite(textEl,
                `Quac! Mensagem de ${nome} recebida com sucesso! Cara, que oportunidade — finalmente vou poder ler uma opinião com minha própria ala e entregar pessoalmente.`,
                26, () => addNextBtn(cena2)
            );
        }

        // cena 2 — pato lê, carta fecha com um pulo
        function cena2() {
            typewrite(textEl,
                `Deixa eu ver aqui... sim, sim... anotei tudo com cuidado. Agora vou entregar essa opinião super relevante direto pro time!`,
                26,
                () => setTimeout(() => {
                    mailImg.src = 'assets/images/form/mail_closed.png';
                    mailImg.classList.add('rpg-mail-bounce');
                    setTimeout(() => mailImg.classList.remove('rpg-mail-bounce'), 600);
                    addNextBtn(cena3);
                }, 500)
            );
        }

        // cena 3 — silêncio constrangedor
        function cena3() {
            typewrite(textEl, `...`, 80, () =>
                setTimeout(() =>
                    typewrite(textEl,
                        `Hm. Sim. Muito interessante. Com certeza. *silêncio de pato desconfortável*`,
                        30, () => addNextBtn(cena4)
                    ),
                400)
            );
        }

        // cena 4 — carta voa direto pra lixeira
        function cena4() {
            textEl.textContent = '';
            clearActions();
            binImg.style.opacity   = '1';
            binImg.style.transition = 'opacity 0.25s';

            setTimeout(() => {
                const mR = mailImg.getBoundingClientRect();
                const bR = binImg.getBoundingClientRect();
                mailImg.style.setProperty('--throw-x', ((bR.left + bR.width * 0.5) - (mR.left + mR.width * 0.5)) + 'px');
                mailImg.style.setProperty('--throw-y', ((bR.top  + bR.height * 0.8) - (mR.top  + mR.height * 0.5)) + 'px');

                playsfx('throw.mp3');
                mailImg.classList.add('rpg-mail-throw');
                mailImg.addEventListener('animationend', () => {
                    mailImg.style.opacity = '0';
                    binImg.src = 'assets/images/form/bin_full.png';
                    setTimeout(cena5, 300);
                }, { once: true });
            }, 500);
        }

        // cena 5 — lixeira cheia, desvio de assunto
        function cena5() {
            const msgs = [
                `Então... sobre a mensagem. Com certeza alguém vai ler. Provavelmente. Talvez. Sabe como é, a equipe tá ocupadíssima destrinchando uma função orgânica numa planilha de XP. Muito importante. Muito mesmo.`,
                `Hm. Sim. Recebido. Arquivado. *som de gaveta fechando* Pode deixar que a gente cuida disso. A gente cuida de tudo por aqui. Exceto de dormir no horário.`,
            ];
            typewrite(textEl, msgs[Math.floor(Math.random() * msgs.length)], 26, () => {
                clearActions();
                const btnFim = document.createElement('button');
                btnFim.className = 'rpg-btn rpg-btn-success';
                btnFim.innerHTML = '...tá bom 🦆';
                btnFim.onclick = () => {
                    container.innerHTML = '';
                    form.reset();
                    btnSubmit.style.display = 'inline-flex';
                };
                actionsEl.appendChild(btnFim);
            });
        }

        cena1();
    });
});
