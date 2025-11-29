const BASE_URL = 'http://localhost:3000';
let dados = { cards: [] };
let atracoesTemp = []; 

function verificarSessao() {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    
    const menuCadastro = document.getElementById('menu-cadastro');
    const menuFavoritos = document.getElementById('menu-favoritos');
    const menuLoginLink = document.getElementById('menu-login');
    const msgUsuario = document.getElementById('msg-usuario');
    const path = window.location.pathname;
    
    if (usuarioLogado) {
        if(menuCadastro) menuCadastro.classList.remove('d-none');
        if(menuFavoritos) menuFavoritos.classList.remove('d-none');
        if(menuLoginLink) {
            menuLoginLink.innerText = "Logout";
            menuLoginLink.href = "#"; 
        }
        if(msgUsuario) {
            msgUsuario.innerText = `Olá, ${usuarioLogado.nome}`;
            msgUsuario.classList.remove('d-none');
        }
    } else {
        if(menuCadastro) menuCadastro.classList.add('d-none');
        if(menuFavoritos) menuFavoritos.classList.add('d-none');
        if(menuLoginLink) {
            menuLoginLink.innerText = "Login";
            menuLoginLink.href = "login.html";
        }
        if(msgUsuario) msgUsuario.classList.add('d-none');

        if (path.includes("cadastro_itens.html") || path.includes("favoritos.html")) {
            alert("Você precisa estar logado para acessar esta página.");
            window.location.href = "login.html";
        }
    }
}

function gerenciarLoginLogout() {
    const usuarioLogado = sessionStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        if(confirm("Deseja realmente sair?")) {
            sessionStorage.removeItem('usuarioLogado');
            verificarSessao();
            window.location.href = "index.html"; 
        }
    } else {
        window.location.href = "login.html";
    }
}

function getChaveFavoritos() {
    const usuarioLogado = JSON.parse(sessionStorage.getItem('usuarioLogado'));
    if (usuarioLogado && usuarioLogado.id) {
        return `favoritos_user_${usuarioLogado.id}`;
    }
    return 'favoritos_visitante';
}

function getFavoritos() {
    const chave = getChaveFavoritos();
    return JSON.parse(localStorage.getItem(chave)) || [];
}

function salvarFavoritos(listaIds) {
    const chave = getChaveFavoritos();
    localStorage.setItem(chave, JSON.stringify(listaIds));
}

function toggleFavorito(id) {
    const usuarioLogado = sessionStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        alert("Você precisa fazer login para adicionar aos favoritos!");
        window.location.href = "login.html";
        return;
    }

    let favoritos = getFavoritos();
    const index = favoritos.indexOf(id);
    
    if (index !== -1) {
        favoritos.splice(index, 1); 
    } else {
        favoritos.push(id); 
    }
    
    salvarFavoritos(favoritos);
    atualizarBotoesFavorito();
    
    if(window.location.pathname.includes("favoritos.html")) {
        gerarFavoritos();
    }
}

function verificarFavorito(id) {
    const favoritos = getFavoritos();
    return favoritos.includes(id);
}

async function carregarDados() {
    try {
        const response = await fetch(`${BASE_URL}/cards`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Erro ao conectar com o servidor');
        
        const cardsData = await response.json();
        dados.cards = cardsData;

        inicializarPagina();
    } catch (error) {
        console.error("Erro ao buscar dados:", error);
    }
}

function gerarCards(lista = dados.cards) {
    const container = document.getElementById('cards-container');
    if (container === null) return; 
    container.innerHTML = '';

    if (lista.length === 0) {
        container.innerHTML = '<div class="col-12 text-center"><p class="text-muted">Nenhum item encontrado.</p></div>';
        return;
    }

    lista.forEach(card => {
        const isFav = verificarFavorito(card.id);
        const btnClass = isFav ? 'btn-danger' : 'btn-outline-danger';
        const btnText = isFav ? 'Remover Favorito' : 'Favoritar';

        const col = document.createElement('div');
        col.className = 'col';
        
        col.innerHTML = `
            <div class="card h-100">
                <img src="${card.imagem_principal}" class="card-img-top" alt="${card.nome}" 
                     onerror="this.onerror=null; this.src='https://placehold.co/600x400/160d24/FFF?text=Erro+Imagem';">
                <div class="card-body">
                    <h5 class="card-title">${card.nome}</h5>
                    <p class="card-text">${card.descricao}</p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <a href="detalhes.html?id=${card.id}" class="btn btn-primary">Ver detalhes</a>
                        <button class="btn ${btnClass} btn-sm btn-fav" data-id="${card.id}" onclick="acaoFavoritar(${card.id})">${btnText}</button>
                    </div>
                </div>
            </div>`;
        container.appendChild(col);
    });
}

function gerarFavoritos() {
    const container = document.getElementById('favoritos-container');
    if (container === null) return;
    container.innerHTML = '';

    const idsFavoritos = getFavoritos();
    const cardsFiltrados = dados.cards.filter(card => idsFavoritos.includes(card.id));

    if (cardsFiltrados.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="alert alert-info">Você ainda não tem favoritos.</p></div>';
        return;
    }

    cardsFiltrados.forEach(card => {
        const col = document.createElement('div');
        col.className = 'col';
        col.innerHTML = `
            <div class="card h-100 border-danger">
                <img src="${card.imagem_principal}" class="card-img-top" alt="${card.nome}" 
                     onerror="this.onerror=null; this.src='https://placehold.co/600x400/160d24/FFF?text=Erro+Imagem';">
                <div class="card-body">
                    <h5 class="card-title">${card.nome}</h5>
                    <p class="card-text">${card.descricao}</p>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <a href="detalhes.html?id=${card.id}" class="btn btn-primary">Ver detalhes</a>
                        <button class="btn btn-danger btn-sm" onclick="acaoFavoritar(${card.id}, true)">Remover</button>
                    </div>
                </div>
            </div>`;
        container.appendChild(col);
    });
}

function mostrarDetalhe() {
    const container = document.getElementById('detalhe-card');
    if (container === null) return; 

    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const card = dados.cards.find(c => c.id === id);

    if (card) {
        const isFav = verificarFavorito(card.id);
        const btnFavTexto = isFav ? "Remover dos Favoritos" : "Adicionar aos Favoritos";
        const btnFavClass = isFav ? "btn-danger" : "btn-outline-danger";

        container.innerHTML = `
            <div class="detalhe-container">
                <div class="imagem">
                    <img src="${card.imagem_principal}" alt="${card.nome}" 
                         onerror="this.onerror=null; this.src='https://placehold.co/600x400/160d24/FFF?text=Erro+Imagem';">
                </div>
                <div class="conteudo">
                    <h2>${card.nome}</h2>
                    <span class="badge bg-secondary mb-3">${card.categoria || 'Geral'}</span>
                    <br>
                    <button class="btn ${btnFavClass} mb-3" onclick="acaoFavoritar(${card.id})">${btnFavTexto}</button>
                    <p class="descricao">${card.descricao}</p>
                    <p class="conteudo-texto">${card.conteudo ? card.conteudo.replace(/\n/g, "<br>") : ''}</p>
                    ${card.botaoLink && card.botaoTexto ? `<div class="botao-centro"><a href="${card.botaoLink}" target="_blank" class="btn-detalhe">${card.botaoTexto}</a></div>` : ""}
                </div>
            </div>`;
        
        const fotosContainer = document.getElementById("fotos-associadas");
        if (fotosContainer) {
            if (card.atracoes && card.atracoes.length > 0) {
                fotosContainer.innerHTML = "";
                card.atracoes.forEach(item => {
                    const col = document.createElement("div");
                    col.className = "col";
                    col.innerHTML = `
                        <div class="card h-100 shadow-sm">
                            <img src="${item.imagem}" class="card-img-top" alt="Imagem associada" 
                                 onerror="this.onerror=null; this.src='https://placehold.co/600x400/160d24/FFF?text=Erro+Imagem';">
                            <div class="card-body"><p class="card-text text-center small text-muted">${item.descricao}</p></div>
                        </div>`;
                    fotosContainer.appendChild(col);
                });
            } else {
                fotosContainer.innerHTML = `<p class="text-muted">Nenhuma foto relacionada disponível.</p>`;
            }
        }
    } else {
        container.innerHTML = "<p>Item não encontrado.</p>";
    }
}

function atualizarPreviewImagem() {
    const input = document.getElementById('item-imagem');
    const preview = document.getElementById('preview-img-principal');
    if (input && preview) {
        preview.src = input.value; 
        if (input.value) {
            preview.style.opacity = '1';
        } else {
            preview.style.opacity = '0';
        }
        preview.onerror = function() {
            this.style.opacity = '0';
        }
    
        preview.onload = function() {
            if (input.value) {
                this.style.opacity = '1';
            }
        }
    }
}

function adicionarAtracaoTemp() {
    const urlInput = document.getElementById('atracao-url');
    const descInput = document.getElementById('atracao-desc');
    const url = urlInput.value;
    const desc = descInput.value;

    if (!url || !desc) {
        alert("Preencha a URL e a Descrição para adicionar a foto.");
        return;
    }
    atracoesTemp.push({ imagem: url, descricao: desc });
    renderizarAtracoesTemp();
    urlInput.value = '';
    descInput.value = '';
}

function removerAtracaoTemp(index) {
    atracoesTemp.splice(index, 1);
    renderizarAtracoesTemp();
}

function renderizarAtracoesTemp() {
    const lista = document.getElementById('lista-atracoes-temp');
    if (!lista) return;

    lista.innerHTML = '';
    atracoesTemp.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.style.backgroundColor = '#160d24'; 
        li.style.color = '#fff';
        li.style.border = '1px solid #3d2b54';

        li.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${item.imagem}" alt="img" style="width: 40px; height: 40px; object-fit: cover; margin-right: 10px; border-radius: 4px;" 
                     onerror="this.onerror=null;this.src='https://placehold.co/40?text=X';">
                <span>${item.descricao}</span>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="removerAtracaoTemp(${index})">X</button>
        `;
        lista.appendChild(li);
    });
}

function gerarTabelaGerenciamento() {
    const tbody = document.getElementById('tabela-itens-body');
    if (!tbody) return;

    tbody.innerHTML = ''; 

    dados.cards.forEach(card => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${card.id}</td>
            <td>${card.nome}</td>
            <td>${card.categoria || '-'}</td>
            <td><img src="${card.imagem_principal}" alt="img" style="height: 40px;" 
                     onerror="this.onerror=null;this.src='https://placehold.co/40?text=Err';"></td>
            <td>
                <button class="btn btn-warning btn-sm me-2" onclick="prepararEdicao(${card.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="excluirItem(${card.id})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function salvarItem(event) {
    event.preventDefault(); 
    
    const idManual = document.getElementById('item-id').value; 
    const isEditingId = document.getElementById('is-editing').value; 

    const nome = document.getElementById('item-nome').value;
    const categoria = document.getElementById('item-categoria').value; 
    const descricao = document.getElementById('item-descricao').value;
    const imagem = document.getElementById('item-imagem').value;
    const conteudo = document.getElementById('item-conteudo').value;

    const novoItem = {
        id: parseInt(idManual), 
        nome: nome,
        categoria: categoria, 
        descricao: descricao,
        imagem_principal: imagem,
        conteudo: conteudo,
        atracoes: atracoesTemp 
    };

    try {
        let response;
        if (isEditingId) {
            response = await fetch(`${BASE_URL}/cards/${isEditingId}`, {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoItem) 
            });
        } else {
            const check = await fetch(`${BASE_URL}/cards/${idManual}`, { cache: 'no-store' });
            if (check.ok) {
                alert("Erro: Já existe um item com este ID. Escolha outro.");
                return;
            }
            response = await fetch(`${BASE_URL}/cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoItem)
            });
        }

        if (response.ok) {
            alert('Item salvo com sucesso!');
            limparFormulario();
            await carregarDados(); 
            if (document.getElementById('tabela-itens-body')) {
                gerarTabelaGerenciamento();
            }
        } else {
            alert('Erro ao salvar item.');
        }
    } catch (error) {
        console.error("Erro na requisição:", error);
    }
}

function prepararEdicao(id) {
    const card = dados.cards.find(c => c.id === id);
    if (!card) return;

    document.getElementById('item-id').value = card.id;
    document.getElementById('item-nome').value = card.nome;
    document.getElementById('item-categoria').value = card.categoria || ""; 
    document.getElementById('item-descricao').value = card.descricao;
    document.getElementById('item-imagem').value = card.imagem_principal;
    document.getElementById('item-conteudo').value = card.conteudo || "";
    
    atualizarPreviewImagem();

    document.getElementById('is-editing').value = card.id;
    document.getElementById('item-id').setAttribute('readonly', true); 
    
    atracoesTemp = card.atracoes || [];
    renderizarAtracoesTemp();

    document.getElementById('btn-salvar').innerText = "Atualizar Item";
    document.getElementById('btn-salvar').classList.remove('btn-success');
    document.getElementById('btn-salvar').classList.add('btn-warning');
    document.getElementById('form-titulo').innerText = `Editando ID: ${card.id}`;
    
    window.scrollTo(0, 0);
}

function limparFormulario() {
    document.getElementById('form-cadastro').reset();
    
    document.getElementById('item-id').value = ''; 
    document.getElementById('item-categoria').value = '';
    document.getElementById('is-editing').value = '';
    document.getElementById('item-id').removeAttribute('readonly'); 
    
    const preview = document.getElementById('preview-img-principal');
    if(preview) {
        preview.style.opacity = '0';
        preview.src = '';
    }

    atracoesTemp = [];
    renderizarAtracoesTemp();

    document.getElementById('btn-salvar').innerText = "Cadastrar Item";
    document.getElementById('btn-salvar').classList.remove('btn-warning');
    document.getElementById('btn-salvar').classList.add('btn-success');
    document.getElementById('form-titulo').innerText = "Novo Cadastro";
}

async function excluirItem(id) {
    if (confirm("Tem certeza que deseja excluir este item?")) {
        try {
            const response = await fetch(`${BASE_URL}/cards/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Item excluído!');
                await carregarDados(); 
                if (document.getElementById('tabela-itens-body')) {
                    gerarTabelaGerenciamento();
                }
            } else {
                alert('Erro ao excluir.');
            }
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    }
}

function acaoFavoritar(id, isPageFavoritos = false) {
    toggleFavorito(id);
}

function atualizarBotoesFavorito() {
    const botoes = document.querySelectorAll('.btn-fav');
    botoes.forEach(btn => {
        const id = parseInt(btn.getAttribute('data-id'));
        const isFav = verificarFavorito(id);
        
        if (isFav) {
            btn.classList.remove('btn-outline-danger');
            btn.classList.add('btn-danger');
            btn.innerText = 'Remover Favorito';
        } else {
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-outline-danger');
            btn.innerText = 'Favoritar';
        }
    });
}

function configurarPesquisa() {
    const form = document.getElementById('form-pesquisa');
    const input = document.getElementById('input-pesquisa');
    if (!form || !input) return;
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        realizarBusca(input.value);
    });
    input.addEventListener('input', function() {
        realizarBusca(input.value);
    });
}

function realizarBusca(termo) {
    const termoBaixo = termo.toLowerCase();
    const filtrados = dados.cards.filter(card => {
        const nome = card.nome.toLowerCase();
        const desc = card.descricao.toLowerCase();
        return nome.includes(termoBaixo) || desc.includes(termoBaixo);
    });
    gerarCards(filtrados);
}

function gerarGraficoDashboard() {
    const ctx = document.getElementById('grafico-itens');
    if (!ctx) return; 

    const contagemCategorias = {};

    dados.cards.forEach(card => {
        const categoria = card.categoria || 'Outros';
        if (contagemCategorias[categoria]) {
            contagemCategorias[categoria]++;
        } else {
            contagemCategorias[categoria] = 1;
        }
    });

    const labels = Object.keys(contagemCategorias); 
    const dataValues = Object.values(contagemCategorias); 

    const existingChart = Chart.getChart(ctx);
    if (existingChart) existingChart.destroy();

    new Chart(ctx, {
        type: 'doughnut', 
        data: {
            labels: labels,
            datasets: [{
                label: 'Itens',
                data: dataValues,
                backgroundColor: [
                    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
                    '#9966FF', '#FF9F40', '#C9CBCF'  
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 20, padding: 15 } },
                title: { display: true, text: 'Acervo por Categoria' }
            }
        }
    });
}

function inicializarPagina() {
    verificarSessao();
    const path = window.location.pathname;

    if (path.includes("index.html") || path === "/" || path.endsWith("/")) {
        gerarCards();
        configurarPesquisa(); 
        gerarGraficoDashboard(); 
    } else if (path.includes("detalhes.html")) {
        mostrarDetalhe();
    } else if (path.includes("favoritos.html")) {
        gerarFavoritos();
    } else if (path.includes("cadastro_itens.html")) {
        gerarTabelaGerenciamento();
        const form = document.getElementById('form-cadastro');
        if(form) {
            const newForm = form.cloneNode(true);
            form.parentNode.replaceChild(newForm, form);
            newForm.addEventListener('submit', salvarItem);
            document.getElementById('btn-cancelar').addEventListener('click', limparFormulario);
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    carregarDados();
});