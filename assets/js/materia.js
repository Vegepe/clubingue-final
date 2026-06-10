function initMateriaPage() {
    if (!document.getElementById('topics-grid')) return;

    const MATERIAS = {
        historia: {
            title: 'História',
            icon: 'fa-landmark',
            intro: 'Do início das civilizações ao mundo contemporâneo — entenda os eventos que moldaram a humanidade e caem sempre nas provas.',
            topicos: [
                { title: '1ª Guerra Mundial', tempo: '15 min', nivel: 'Médio', href: 'historia/1wgm.html', tags: 'guerra mundial europa conflito aliados potencias trincheiras' },
                { title: 'Ditadura Militar no Brasil', tempo: '12 min', nivel: 'Médio', href: '#', locked: true, tags: 'ditadura militar brasil golpe regime' },
                { title: 'Guerra Fria', tempo: '10 min', nivel: 'Básico', href: '#', locked: true, tags: 'guerra fria eua urss capitalismo comunismo' },
            ]
        },
        literatura: {
            title: 'Literatura',
            icon: 'fa-feather-pointed',
            intro: 'Dos clássicos ao modernismo — conheça os movimentos literários, autores e obras que você precisa dominar.',
            topicos: [
                { title: 'Modernismo Brasileiro', tempo: '12 min', nivel: 'Médio', href: 'literatura/modernismo.html', tags: 'modernismo semana arte moderna mário oswald bandeira' },
                { title: 'Romantismo', tempo: '10 min', nivel: 'Básico', href: '#', locked: true, tags: 'romantismo jose de alencar aluisio azevedo' },
                { title: 'Barroco', tempo: '8 min', nivel: 'Básico', href: '#', locked: true, tags: 'barroco gregório matos vieira' },
            ]
        },
        portugues: {
            title: 'Português',
            icon: 'fa-book-open',
            intro: 'Gramática, interpretação de texto e redação — o essencial pra mandar bem no ENEM e nos vestibulares.',
            topicos: [
                { title: 'Interpretação de Texto', tempo: '10 min', nivel: 'Básico', href: 'portugues/interpretacao.html', tags: 'interpretação leitura texto enunciado inferência' },
                { title: 'Coesão e Coerência', tempo: '8 min', nivel: 'Básico', href: '#', locked: true, tags: 'coesão coerência conectivos paragrafos' },
                { title: 'Figuras de Linguagem', tempo: '10 min', nivel: 'Médio', href: '#', locked: true, tags: 'figuras metáfora metonímia hipérbole ironia' },
            ]
        }
    };

    const NIVEL_COLOR = { 'Básico': '#c8e6c9', 'Médio': '#fff3b0', 'Difícil': '#ffccbc' };

    function getMateria() {
        return new URLSearchParams(window.location.search).get('m') || 'historia';
    }

    function renderPerfilReal() {
        try {
            const progresso = JSON.parse(localStorage.getItem('clubingue_progress') || '{}');
            const userNameEl = document.getElementById('user-name');
            const userAvatarEl = document.getElementById('user-avatar');
            const userLevelEl = document.getElementById('user-level');

            if (progresso.user && progresso.user.name) {
                const nome = progresso.user.name;
                if (userNameEl) userNameEl.textContent = `Olá, ${nome.split(' ')[0]}!`;
                
                const iniciais = nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                if (userAvatarEl) userAvatarEl.textContent = iniciais;
                
                const xpTotal = progresso.xp || 0;
                const nivelReal = Math.floor(xpTotal / 100) + 1;
                if (userLevelEl) userLevelEl.textContent = `Nível ${nivelReal} ⭐`;
            } else {
                if (userNameEl) userNameEl.textContent = "Olá, Blinguer!";
                if (userAvatarEl) userAvatarEl.textContent = "CB";
                if (userLevelEl) userLevelEl.textContent = "Sem Conta";
            }
        } catch (e) {
            console.error("Erro ao carregar dados do perfil real na sidebar:", e);
        }
    }

    function renderMateria(query = '') {
        const key = getMateria();
        const m = MATERIAS[key] || MATERIAS.historia;
        const q = query.toLowerCase().trim();

        document.title = m.title + ' | Clubingue';
        document.getElementById('hub-title').textContent = m.title;
        document.getElementById('hub-intro').textContent = m.intro;
        document.getElementById('badge-subject').innerHTML = `<i class="fa-solid ${m.icon}"></i> ${m.title}`;
        document.getElementById('badge-topicos').textContent = m.topicos.length;

        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        const navEl = document.getElementById('nav-' + key);
        if (navEl) navEl.classList.add('active');

        let visiveis = m.topicos;
        if (q) {
            const porTitulo = m.topicos.filter(t => t.title.toLowerCase().includes(q));
            const porTags   = m.topicos.filter(t => !t.title.toLowerCase().includes(q) && t.tags.toLowerCase().includes(q));
            visiveis = [...porTitulo, ...porTags];
        }

        const grid = document.getElementById('topics-grid');
        const noResults = document.getElementById('no-results');
        grid.innerHTML = '';

        if (!visiveis.length) {
            noResults.style.display = 'block';
            return;
        }
        noResults.style.display = 'none';

        visiveis.forEach(t => {
            const idx = m.topicos.indexOf(t) + 1;
            const card = document.createElement('a');
            card.className = 'topic-card' + (t.locked ? ' locked' : '');
            card.href = t.locked ? '#' : t.href;
            if (t.locked) card.setAttribute('aria-disabled', 'true');
            card.innerHTML = `
                <div class="topic-number">${idx}</div>
                <div class="topic-info">
                    <div class="topic-title">${t.title}${t.locked ? ' <i class="fa-solid fa-lock" style="font-size:0.6rem;color:#bbb"></i>' : ''}</div>
                    <div class="topic-meta">
                        <span><i class="fa-regular fa-clock"></i> ${t.tempo}</span>
                        <span style="background:${NIVEL_COLOR[t.nivel]||'#eee'}; padding:2px 8px; border-radius:4px; border:1px solid #ccc; color:#000; font-weight:700;">${t.nivel}</span>
                        ${t.locked ? '<span style="color:#bbb"><i class="fa-solid fa-lock"></i> Em breve</span>' : ''}
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right topic-arrow"></i>
            `;
            grid.appendChild(card);
        });
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', e => {
            clearTimeout(debounce);
            debounce = setTimeout(() => renderMateria(e.target.value), 200);
        });
    }

    renderMateria();
    renderPerfilReal();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMateriaPage);
} else {
    initMateriaPage();
}