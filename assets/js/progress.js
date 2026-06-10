function renderPerfilReal() {
    const panel = document.getElementById('sidebar-user-badge');
    if (!panel) return;
    try {
        const progresso = JSON.parse(localStorage.getItem('clubingue_progress') || '{}');

        if (progresso.user && progresso.user.name) {
            const nomeCompleto = progresso.user.name;
            const primeiroNome = nomeCompleto.split(' ')[0];
            const iniciais = nomeCompleto.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            const xpTotal = progresso.xp || 0;
            const xpPorNivel = 100;
            const nivelAtual = Math.floor(xpTotal / xpPorNivel) + 1;
            const xpNoNivelAtual = xpTotal % xpPorNivel;
            const progressoPorcentagem = (xpNoNivelAtual / xpPorNivel) * 100;

            panel.innerHTML = `
                <div class="user-profile-top">
                    <div class="user-avatar">${iniciais}</div>
                    <div class="user-meta">
                        <div class="user-name">Olá, ${primeiroNome}!</div>
                        <div class="user-level">Nível ${nivelAtual} ✨</div>
                    </div>
                </div>
                <div class="user-xp-wrapper">
                    <div class="xp-text-container">
                        <span>${xpNoNivelAtual} / ${xpPorNivel} XP</span>
                        <span>Total: ${xpTotal} XP</span>
                    </div>
                    <div class="user-xp-bar">
                        <div class="user-xp-progress" style="width: ${progressoPorcentagem}%"></div>
                    </div>
                </div>
                <a href="#" class="sidebar-login-btn" id="sidebar-logout-btn">
                    <i class="fa-solid fa-right-from-bracket"></i> Sair
                </a>
            `;

            document.getElementById('sidebar-logout-btn')?.addEventListener('click', e => {
                e.preventDefault();
                if (confirm('Sair da conta?')) {
                    localStorage.removeItem('clubingue_progress');
                    window.location.href = '../../login.html?logout';
                }
            });
        } else {
            panel.innerHTML = `
                <a href="../../login.html" class="sidebar-login-btn">
                    <i class="fa-solid fa-right-to-bracket"></i> Entrar no Clubingue
                </a>
            `;
        }
    } catch (e) {
        console.error("Erro ao renderizar painel de perfil:", e);
    }
}

// roda imediatamente — o loader injeta após o DOM estar pronto
(function syncAuth() {
    try {
        const d = JSON.parse(localStorage.getItem('clubingue_progress') || '{}');

        // Sidebar das páginas de matéria
        renderPerfilReal();

        if (!d.user) return;

        const primeiroNome = d.user.name.split(' ')[0];

        // Botão de login no header (index)
        const loginBtn = document.getElementById('nav-auth-btn');
        if (loginBtn) {
            loginBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${primeiroNome}`;
            loginBtn.href = '#';
            loginBtn.onclick = e => {
                e.preventDefault();
                if (confirm('Sair da conta?')) {
                    localStorage.removeItem('clubingue_progress');
                    window.location.href = (window.location.pathname.includes('/pages/') ? '../' : '') + 'login.html?logout';
                }
            };
        }

        // Widget XP na index (se existir)
        const widget = document.getElementById('xp-widget');
        if (widget) {
            const xpTotal = d.xp || 0;
            const xpPorNivel = 100;
            const nivel = Math.floor(xpTotal / xpPorNivel) + 1;
            const xpNivel = xpTotal % xpPorNivel;
            const pct = (xpNivel / xpPorNivel) * 100;

            widget.classList.add('active');
            const el = id => document.getElementById(id);
            if (el('xp-name'))        el('xp-name').textContent = primeiroNome;
            if (el('xp-level-label')) el('xp-level-label').textContent = 'Nível ' + nivel;
            if (el('xp-val'))         el('xp-val').textContent = xpNivel + ' / ' + xpPorNivel + ' XP (Total: ' + xpTotal + ')';
            if (el('xp-bar'))         el('xp-bar').style.width = pct + '%';
            if (el('xp-logout')) {
                el('xp-logout').addEventListener('click', e => {
                    e.preventDefault();
                    localStorage.removeItem('clubingue_progress');
                    window.location.href = 'login.html?logout';
                });
            }
        }
    } catch(e) { console.error(e); }
})();
