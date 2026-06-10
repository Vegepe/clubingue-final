// login.js — carregado diretamente no login.html

async function hashSenha(senha) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(senha));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function loginShowError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function loginHideError(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

window.fazerLogin = async function () {
    const email = document.getElementById('login-email')?.value.trim();
    const senha = document.getElementById('login-senha')?.value.trim();

    if (!email || !senha) { loginShowError('login-error', 'Preencha todos os campos!'); return; }
    loginHideError('login-error');

    const contas = JSON.parse(localStorage.getItem('clubingue_contas') || '{}');
    const conta  = contas[email];

    if (!conta) { loginShowError('login-error', 'Email não cadastrado. Crie uma conta primeiro!'); return; }

    const senhaHash = await hashSenha(senha);
    if (conta.senha !== senhaHash) { loginShowError('login-error', 'Senha incorreta!'); return; }

    const progresso = conta.progresso || { user: { name: conta.name, email }, read: [], xp: 0, level: 1 };
    progresso.user  = { name: conta.name, email };
    localStorage.setItem('clubingue_progress', JSON.stringify(progresso));
    window.location.href = 'index.html';
};

window.fazerRegistro = async function () {
    const name  = document.getElementById('reg-name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const senha = document.getElementById('reg-senha')?.value.trim();

    if (!name || !email || !senha) { loginShowError('reg-error', 'Preencha todos os campos!'); return; }
    if (senha.length < 4)          { loginShowError('reg-error', 'Senha muito curta (mínimo 4 caracteres)'); return; }
    loginHideError('reg-error');

    const contas = JSON.parse(localStorage.getItem('clubingue_contas') || '{}');
    if (contas[email]) { loginShowError('reg-error', 'Email já cadastrado!'); return; }

    const senhaHash = await hashSenha(senha);
    const progresso = { user: { name, email }, read: [], xp: 0, level: 1 };
    contas[email]   = { name, email, senha: senhaHash, progresso };
    localStorage.setItem('clubingue_contas', JSON.stringify(contas));
    localStorage.setItem('clubingue_progress', JSON.stringify(progresso));
    window.location.href = 'index.html';
};

window.fazerLogout = function () {
    localStorage.removeItem('clubingue_progress');
};

// Tabs
document.addEventListener('DOMContentLoaded', () => {
    // Se vier com ?logout, limpa sessão e fica na página
    const params = new URLSearchParams(window.location.search);
    if (params.has('logout')) {
        localStorage.removeItem('clubingue_progress');
    }

    // Tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.auth-tab, .auth-panel').forEach(el => el.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + '-panel')?.classList.add('active');
        });
    });
});
