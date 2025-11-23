const BASE_URL = 'http://localhost:3000';
let dados = { cards: [] };

function getFavoritos() {
    return JSON.parse(localStorage.getItem('meusFavoritos')) || [];
}

function salvarFavoritos(listaIds) {
    localStorage.setItem('meusFavoritos', JSON.stringify(listaIds));
}

function toggleFavorito(id) {
    let favoritos = getFavoritos();
    const index = favoritos.indexOf(id);
    if (index !== -1) {
        favoritos.splice(index, 1);
    } else {
        favoritos.push(id);
    }
    salvarFavoritos(favoritos);
    atualizarBotoesFavorito();
}

function verificarFavorito(id) {
    const favoritos = getFavoritos();
    return favoritos.includes(id);
}

async function carregarDados() {
    try {
        const response = await fetch(`${BASE_URL}/cards`);
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
                <img src="${card.imagem_principal}" class="card-img-top" alt="${card.nome}">
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
                <img src="${card.imagem_principal}" class="card-img-top" alt="${card.nome}">
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
                <div class="imagem"><img src="${card.imagem_principal}" alt="${card.nome}"></div>
                <div class="conteudo">
                    <h2>${card.nome}</h2>
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
                            <img src="${item.imagem}" class="card-img-top" alt="Imagem associada">
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

function gerarTabelaGerenciamento() {
    const tbody = document.getElementById('tabela-itens-body');
    if (!tbody) return;

    tbody.innerHTML = ''; 

    dados.cards.forEach(card => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${card.id}</td>
            <td>${card.nome}</td>
            <td><img src="${card.imagem_principal}" alt="img" style="height: 40px;"></td>
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
    const id = document.getElementById('item-id').value;
    const nome = document.getElementById('item-nome').value;
    const descricao = document.getElementById('item-descricao').value;
    const imagem = document.getElementById('item-imagem').value;
    const conteudo = document.getElementById('item-conteudo').value;

    const novoItem = {
        nome: nome,
        descricao: descricao,
        imagem_principal: imagem,
        conteudo: conteudo,
        atracoes: [] 
    };

    try {
        let response;
        if (id) {
            response = await fetch(`${BASE_URL}/cards/${id}`, {
                method: 'PUT', // ou 'PATCH'
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...novoItem, id: parseInt(id) }) 
            });
        } else {
            response = await fetch(`${BASE_URL}/cards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoItem)
            });
        }

        if (response.ok) {
            alert('Item salvo com sucesso!');
            limparFormulario();
            carregarDados(); 
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
    document.getElementById('item-descricao').value = card.descricao;
    document.getElementById('item-imagem').value = card.imagem_principal;
    document.getElementById('item-conteudo').value = card.conteudo || "";
    document.getElementById('btn-salvar').innerText = "Atualizar Item";
    document.getElementById('form-titulo').innerText = "Editar Item";
    window.scrollTo(0, 0);
}

async function excluirItem(id) {
    if (confirm("Tem certeza que deseja excluir este item?")) {
        try {
            const response = await fetch(`${BASE_URL}/cards/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                let favoritos = getFavoritos();
                if(favoritos.includes(id)) {
                    toggleFavorito(id);
                }
                
                alert('Item excluído!');
                carregarDados();
            } else {
                alert('Erro ao excluir.');
            }
        } catch (error) {
            console.error("Erro ao excluir:", error);
        }
    }
}

function limparFormulario() {
    document.getElementById('form-cadastro').reset();
    document.getElementById('item-id').value = ''; 
    document.getElementById('btn-salvar').innerText = "Cadastrar Item";
    document.getElementById('form-titulo').innerText = "Novo Cadastro";
}

function acaoFavoritar(id, isPageFavoritos = false) {
    toggleFavorito(id);
    if (isPageFavoritos) {
        gerarFavoritos();
    } else {
        atualizarBotoesFavorito();
        if(window.location.pathname.includes("detalhes.html")) {
            mostrarDetalhe();
        }
    }
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
        const categoria = card.categoria || 'Sem Categoria';
        if (contagemCategorias[categoria]) {
            contagemCategorias[categoria]++;
        } else {
            contagemCategorias[categoria] = 1;
        }
    });

    const labels = Object.keys(contagemCategorias); 
    const dataValues = Object.values(contagemCategorias); 

    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }

    new Chart(ctx, {
        type: 'doughnut', 
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantidade de Itens',
                data: dataValues,
                backgroundColor: [
                    '#FF6384', 
                    '#36A2EB', 
                    '#FFCE56', 
                    '#4BC0C0', 
                    '#9966FF',
                    '#FF9F40', 
                    '#C9CBCF'  
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 20,
                        padding: 15
                    }
                },
            }
        }
    });
}

function inicializarPagina() {
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