function initGlobalSearch() {
    const input = document.getElementById('search-global');
    const drop  = document.getElementById('search-results');
    if (!input || !drop) return;

    const TOPICOS = [
        { title: '1ª Guerra Mundial',                materia: 'História',   icon: 'fa-landmark',        href: 'pages/historia/1wgm.html',                    tags: 'guerra europa conflito aliados potencias trincheiras' },
        { title: 'Ditadura Militar',                 materia: 'História',   icon: 'fa-landmark',        href: 'pages/historia/index.html',                   tags: 'ditadura militar brasil golpe regime' },
        { title: 'Guerra Fria',                      materia: 'História',   icon: 'fa-landmark',        href: 'pages/historia/index.html',                   tags: 'eua urss capitalismo comunismo' },
        { title: 'Modernismo Brasileiro',            materia: 'Literatura', icon: 'fa-feather-pointed', href: 'pages/literatura/modernismo.html',             tags: 'semana arte moderna mario oswald bandeira' },
        { title: 'Romantismo',                       materia: 'Literatura', icon: 'fa-feather-pointed', href: 'pages/literatura/index.html',                 tags: 'jose alencar aluisio azevedo' },
        { title: 'Barroco',                          materia: 'Literatura', icon: 'fa-feather-pointed', href: 'pages/literatura/index.html',                 tags: 'gregório matos vieira' },
        { title: 'Interpretação de Texto',           materia: 'Português',  icon: 'fa-book-open',       href: 'pages/portugues/interpretacao.html',          tags: 'leitura inferência enunciado enem' },
        { title: 'Coesão e Coerência',               materia: 'Português',  icon: 'fa-book-open',       href: 'pages/portugues/index.html',                  tags: 'conectivos parágrafos texto' },
        { title: 'Figuras de Linguagem',             materia: 'Português',  icon: 'fa-book-open',       href: 'pages/portugues/index.html',                  tags: 'metáfora metonímia hipérbole ironia' },
        { title: 'O que são as Estrelas?',           materia: 'Física',     icon: 'fa-bolt',            href: 'pages/fisica/estrelas.html',                  tags: 'estrela astro universo nebulosa fusão nuclear anã branca vermelha azul nêutron' },
        { title: 'Funções Orgânicas',                materia: 'Química',    icon: 'fa-atom',            href: 'pages/quimica/funcoes-organicas.html',        tags: 'alcano álcool fenol éter aldeído cetona éster amina amida nitro halogênio carbonila carboxila orgânica' },
        { title: 'Música Brasileira e a Sociedade',  materia: 'Sociologia', icon: 'fa-people-group',    href: 'pages/sociologia/musica-brasileira.html',     tags: 'samba funk rap mpb tropicalismo ditadura resistência identidade racial miscigenação gênero' },
    ];

    let debounce;
    input.addEventListener('input', () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
            const q = input.value.trim().toLowerCase();
            if (!q) { drop.style.display = 'none'; return; }

            const porTitulo = TOPICOS.filter(t => t.title.toLowerCase().includes(q));
            const porTags   = TOPICOS.filter(t => !t.title.toLowerCase().includes(q) && t.tags.toLowerCase().includes(q));
            const results   = [...porTitulo, ...porTags].slice(0, 6);

            drop.innerHTML = results.length
                ? results.map(r => `
                    <a class="search-result-item" href="${r.href}">
                        <div class="search-result-icon"><i class="fa-solid ${r.icon}"></i></div>
                        <div>${r.title}<div class="search-result-meta">${r.materia}</div></div>
                    </a>`).join('')
                : '<div class="search-no-result">🦆 Nenhum resultado encontrado</div>';

            drop.style.display = 'block';
        }, 180);
    });

    document.addEventListener('click', e => {
        if (!input.contains(e.target) && !drop.contains(e.target)) drop.style.display = 'none';
    });
}

// Gatilho inteligente anti-assincronismo do loader.js
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalSearch);
} else {
    initGlobalSearch();
}
