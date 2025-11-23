const BASE_URL = 'http://localhost:3000';

// --- LÓGICA DE LOGIN ---
const formLogin = document.getElementById('form-login');
if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        const loginInput = document.getElementById('login-usuario').value;
        const senhaInput = document.getElementById('login-senha').value;

        try {
            const response = await fetch(`${BASE_URL}/usuarios`);
            const usuarios = await response.json();

            const usuarioEncontrado = usuarios.find(u => u.login === loginInput && u.senha === senhaInput);

            if (usuarioEncontrado) {
                // MUDANÇA: Usando sessionStorage (Sessão morre ao fechar o navegador)
                sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado));
                
                alert(`Bem-vindo, ${usuarioEncontrado.nome}!`);
                window.location.href = 'index.html'; 
            } else {
                alert("Login ou senha incorretos!");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert("Erro de conexão.");
        }
    });
}

// --- LÓGICA DE CADASTRO ---
const formCadastro = document.getElementById('form-cadastro-usuario');
if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const login = document.getElementById('cad-login').value;
        const nome = document.getElementById('cad-nome').value;
        const email = document.getElementById('cad-email').value;
        const senha = document.getElementById('cad-senha').value;

        const novoUsuario = { login, senha, nome, email, admin: false };

        try {
            const checkResponse = await fetch(`${BASE_URL}/usuarios`);
            const usuarios = await checkResponse.json();
            if (usuarios.find(u => u.login === login)) {
                alert("Login já em uso.");
                return;
            }

            const saveResponse = await fetch(`${BASE_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoUsuario)
            });

            if (saveResponse.ok) {
                alert("Cadastrado com sucesso!");
                window.location.href = 'login.html';
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    });
}