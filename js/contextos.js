let TODOS_CONTEXTOS = [];

document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {

    await carregarContexts();

    mostrarContextos();

}

async function carregarContexts() {

    //  https://educapi.a4s.dev.br/v1/api/contexts
    const resposta = await fetch("http://localhost:8080/v1/api/contexts");

    const dados = await resposta.json();

    TODOS_CONTEXTOS = dados.content || [];

}

function mostrarContextos(){


    const container = document.querySelector(".flex-container");


    const ids = JSON.parse(localStorage.getItem("contextosImportados")) || [];


    container.innerHTML = "";


    const contextosFiltrados = ids
        .map(id => TODOS_CONTEXTOS.find(c => c.id === id))
        .filter(contexto => contexto); // remove undefined


    if(contextosFiltrados.length === 0){
        container.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum tema importado
            </p>
        `;
        return;
    }


    contextosFiltrados.forEach(contexto => {


        const card = document.createElement("div");


        card.classList.add("box");


        card.innerHTML = `
            <button class="remover-contexto" onclick="removerContexto(event, ${contexto.id})">✖</button>
            <img src="${contexto.imageUrl || 'img/error.png'}">
            <h3>${contexto.name.toUpperCase()}</h3>
        `;


        card.onclick = () => {
            localStorage.setItem("contextoSelecionado", contexto.id);
            window.location.href = "niveis.html";
        };


        container.appendChild(card);


    });

}

function removerContexto(event, id) {

    event.stopPropagation();

    let ids = JSON.parse(localStorage.getItem("contextosImportados")) || [];

    ids = ids.filter(contextoId => contextoId !== id);

    localStorage.setItem("contextosImportados", JSON.stringify(ids));

    mostrarContextos();

}
