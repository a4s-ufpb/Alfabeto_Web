let CONTEXTOS = [];

document.addEventListener("DOMContentLoaded", carregarContextos);

async function carregarContextos() {

    //  https://educapi.a4s.dev.br/v1/api/contexts

    const resposta = await fetch("http://localhost:8080/v1/api/contexts");

    const dados = await resposta.json();

    CONTEXTOS = dados.content || [];

    mostrarContextos(CONTEXTOS);

}

function mostrarContextos(lista = CONTEXTOS) {


    const container = document.getElementById("lista-contextos");


    const importados = JSON.parse(localStorage.getItem("contextosImportados")) || [];


    container.innerHTML = "";


    const disponiveis = lista.filter(contexto => !importados.includes(contexto.id));


    if (disponiveis.length === 0) {
        container.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum tema disponível para importar
            </p>
        `;
        return;
    }


    disponiveis.forEach(contexto => {


        const card = document.createElement("a");


        card.classList.add("box");


        card.innerHTML = `
            <img src="${contexto.imageUrl || 'img/error.png'}">
            <h3>${contexto.name.toUpperCase()}</h3>
        `;


        card.onclick = () => importarContexto(contexto.id);


        container.appendChild(card);


    });
}

function importarContexto(id) {

    let contextos = JSON.parse(localStorage.getItem("contextosImportados")) || [];

    if (!contextos.includes(id)) {
        contextos.push(id);
        localStorage.setItem("contextosImportados", JSON.stringify(contextos));
        alert("Tema importado!");
    } else {
        alert("Esse tema já foi importado!");
    }

    window.location.href = "contextos.html";

}

function filtrarContextos() {

    const texto = document.getElementById("buscarContexto").value.toLowerCase();

    const filtrados = CONTEXTOS.filter(contexto =>
        contexto.name.toLowerCase().includes(texto)
    );

    mostrarContextos(filtrados);

}
