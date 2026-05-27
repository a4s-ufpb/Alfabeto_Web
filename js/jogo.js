const TECLADO_ESCOLHIDO = localStorage.getItem('tecladoEscolhido');
let QUANTIDADE_DESAFIOS = 0;
let palavraSecreta;
let palavraAtual;
let quantidadeDesafiosJogados = 0;
let palavrasSorteadas = [];
let contadorDeErros = 0;
let quantidadeDeTentativas = 0;
const CONTEXTO_SELECIONADO = localStorage.getItem('contextoSelecionado');
let CHALLENGES = [];
const EDUCAPI_CHALLENGE_IMAGE_URL = "http://localhost:8080/v1/api/challenges";


if (!CONTEXTO_SELECIONADO) {
    alert("Nenhum contexto foi selecionado");
    window.location.href = 'contextos.html';
} else {
    iniciarDesafio();
}


function escolhaDoTeclado() {
    console.log('Função chamada:', 'escolhaDoTeclado');
    if (TECLADO_ESCOLHIDO === 'vogais') {
        document.getElementById('vogais').style.display = 'block';
        document.getElementById('consoantes').style.display = 'none';
        document.getElementById('alfabeto').style.display = 'none';
    } else if (TECLADO_ESCOLHIDO === 'consoantes') {
        document.getElementById('vogais').style.display = 'none';
        document.getElementById('consoantes').style.display = 'block';
        document.getElementById('alfabeto').style.display = 'none';
    } else {
        document.getElementById('vogais').style.display = 'none';
        document.getElementById('consoantes').style.display = 'none';
        document.getElementById('alfabeto').style.display = 'block';
    }
}

function getChallengeImageUrl(challenge) {
    if (!challenge) {
        return "";
    }

    if (challenge.id !== undefined && challenge.id !== null && challenge.id !== "") {
        return `${EDUCAPI_CHALLENGE_IMAGE_URL}/${challenge.id}/image`;
    }

    if (challenge.imageUrl && challenge.imageUrl !== "null") {
        return challenge.imageUrl;
    }

    return "";
}

async function carregarChallenges() {

    const CONTEXTO_ID = localStorage.getItem("contextoSelecionado");

    // 
    const resposta = await fetch(
        "http://localhost:8080/v1/api/contexts/" + CONTEXTO_ID
    );

    const dados = await resposta.json();

    CHALLENGES = dados.challenges || [];
    QUANTIDADE_DESAFIOS = CHALLENGES.length;

    criarCirculos();

    document.getElementById('tema').innerHTML = dados.name.toUpperCase();

    console.log("Challenges carregados:", CHALLENGES);
}

async function iniciarDesafio() {

    window.focus();
    escolhaDoTeclado();

    if (CHALLENGES.length === 0) {
        await carregarChallenges();
    }

    if (CHALLENGES.length === 0) {
        alert("Este tema ainda não possui desafios")
        window.location.href = "contextos.html";
        return
    }

    atualizarRodadas();

    let palavraSorteada;

    do {

        palavraSorteada = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];

        palavraSecreta = palavraSorteada.word;

    } while (palavrasSorteadas.includes(palavraSecreta));

    if (!palavrasSorteadas.includes(palavraSecreta)) {
        palavrasSorteadas.push(palavraSecreta);
    }

    palavraAtual = Array(palavraSecreta.length).fill("_");

    console.log("Palavra secreta sorteada:", palavraSecreta);

    const img = document.getElementById('imagem-jogo');
    const imageUrl = getChallengeImageUrl(palavraSorteada);

    if (imageUrl) {
        img.src = imageUrl;
    } else {
        img.src = "img/error.png";
    }


    exibirPalavra();
}

function exibirPalavra() {
    const PALAVRA_CONTAINER = document.getElementById('palavra');

    if (TECLADO_ESCOLHIDO === 'vogais') {
        for (let i = 0; i < palavraSecreta.length; i++) {
            if (isConsoante(palavraSecreta[i].toUpperCase())) {
                palavraAtual[i] = palavraSecreta[i];
            }
        }
    } else if (TECLADO_ESCOLHIDO === 'consoantes') {
        for (let i = 0; i < palavraSecreta.length; i++) {
            if (isVogal(palavraSecreta[i].toUpperCase())) {
                palavraAtual[i] = palavraSecreta[i];
            }
        }
    }

    PALAVRA_CONTAINER.textContent = palavraAtual.join(" ").toUpperCase();
}

function isVogal(letra) {
    const LETRA_NORMALIZADA = letra.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
    return ["A", "E", "I", "O", "U"].includes(LETRA_NORMALIZADA);
}

function isConsoante(letra) {
    return !isVogal(letra);
}

function letraClicada(letra) {
    let acertou = false;

    for (let i = 0; i < palavraSecreta.length; i++) {
        const letraNormalizadaPalavra = palavraSecreta[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const letraNormalizadaClicada = letra.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        if (letraNormalizadaPalavra === letraNormalizadaClicada) {
            palavraAtual[i] = palavraSecreta[i];
            acertou = true;
        }
    }

    quantidadeDeTentativas++;

    if (!acertou) {
        contadorDeErros++;
    }

    exibirPalavra();

    const BOTOES = document.querySelectorAll(`button[onclick="letraClicada('${letra}')"]`);
    BOTOES.forEach(botao => {
        if (acertou) {
            botao.style.backgroundColor = 'green';
            botao.style.color = 'white';
        } else {
            botao.style.backgroundColor = 'red';
            botao.style.color = 'white';
        }
        botao.disabled = true;
    });

    if (!palavraAtual.includes("_")) {
        proximaRodada();
    }

}

function desabilitarBotoes() {
    const BOTOES = document.querySelectorAll('button[onclick^="letraClicada"]');
    BOTOES.forEach(botao => {
        botao.disabled = true;
    })
}

function proximaRodada() {
    desabilitarBotoes();
    quantidadeDesafiosJogados++;

    atualizarRodadas();

    mostrarFeedback("Parabéns!");

    console.log("Rodada atual:", quantidadeDesafiosJogados);

    if (quantidadeDesafiosJogados < QUANTIDADE_DESAFIOS) {
        setTimeout(() => {
            resetarBotoes();
            iniciarDesafio();
        }, 1000);
    } else {
        setTimeout(() => {
            palavrasSorteadas = [];
            finalizarPartida();
        }, 1000);
    }
}

function resetarBotoes() {
    const BOTOES = document.querySelectorAll('button[onclick^="letraClicada"]');
    BOTOES.forEach(botao => {
        botao.disabled = false;
        botao.style.color = '';
        botao.style.backgroundColor = '';
    });
}

function finalizarPartida() {
    desabilitarBotoes();
    exibirPontuacao();
    const PONTUACAO = parseInt(localStorage.getItem('pontuacao'), 10);

    document.getElementById('pontuacao-jogador').innerHTML = "Sua pontuação: " + PONTUACAO;

    const NOME_FORM = document.querySelector('.recuperar-nome');
    NOME_FORM.style.display = 'block';

    const FORM = document.querySelector('.recuperar-nome form');
    FORM.addEventListener('submit', function (event) {
        event.preventDefault();

        const NOME_JOGADOR = document.getElementById('nomeJogador').value;
        localStorage.setItem('nome-jogador', NOME_JOGADOR);

        if (NOME_JOGADOR) {
            let ranking = JSON.parse(localStorage.getItem("ranking")) || [];

            ranking.push({ nome: NOME_JOGADOR, pontuacao: PONTUACAO });
            ranking.sort((a, b) => b.pontuacao - a.pontuacao);

            ranking = ranking.slice(0, 5);

            localStorage.setItem("ranking", JSON.stringify(ranking));

            NOME_FORM.style.display = 'none';

            setTimeout(() => {
                window.location.href = 'pontuacao.html';
            }, 1000);
        } else {
            alert("Por favor, insira um nome antes de confirmar.");
        }
    });
}


function mostrarFeedback(mensagem) {


    const toast = document.getElementById("toast");
    const texto = document.getElementById("toast-text");


    if (!toast || !texto) {
        console.warn("Toast não encontrado no HTML");
        return;
    }

    texto.innerText = mensagem;

    toast.classList.remove("erro");
    toast.classList.add("sucesso");

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}


function exibirPontuacao() {
    const QUATIDADE_ACERTOS = quantidadeDeTentativas - contadorDeErros;
    let pontuacao = (QUATIDADE_ACERTOS / quantidadeDeTentativas) * 100;
    parseFloat(pontuacao.toFixed(2));

    localStorage.setItem('pontuacao', pontuacao);
}

function exibirOcultarBotoes() {
    const BOTOES = document.querySelectorAll('.hamburguer-botoes');

    BOTOES.forEach(botao => {
        if (botao.style.display == "block") {
            botao.style.display = "none";
        } else {
            botao.style.display = "block";
        }
    });
}

let urlDestino;

function confirmarSaida(texto) {
    const divConfirmacao = document.querySelector('.confirmar-acao');
    const paragrafo = document.getElementById('confirmar-saida');
    if (divConfirmacao.style.display === "none") {
        divConfirmacao.style.display = "block";
        paragrafo.innerHTML = texto;
    }
}

function mostrarConfirmacaoSairTela(texto, url) {
    const CONFIRMAR = document.querySelector('.confirmacao-sair-tela');
    CONFIRMAR.style.display = "block";

    const PARAGRAFO = document.getElementById('texto-confirmacao');
    PARAGRAFO.innerHTML = texto;

    urlDestino = url;
}

function esconderConfirmacaoSairTela() {
    const CONFIRMAR = document.querySelector('.confirmacao-sair-tela');
    CONFIRMAR.style.display = "none";
}

function redirecionar() {
    if (urlDestino) {
        window.location.href = urlDestino;
    }
}

function atualizarRodadas() {

    const circulos = document.querySelectorAll(".circulo");

    console.log("circulos encontrados:", circulos.length)

    circulos.forEach((circulo, index) => {
        circulo.classList.remove("atual", "concluido")

        if (index < quantidadeDesafiosJogados) {
            circulo.classList.add("concluido");
        } else if (index === quantidadeDesafiosJogados) {
            circulo.classList.add("atual");
        }
    });

    const texto = document.getElementById("rodada-texto");

    if (texto) {
        texto.innerHTML = "Rodada " + Math.min(quantidadeDesafiosJogados + 1, QUANTIDADE_DESAFIOS) + " de " + QUANTIDADE_DESAFIOS;
    }
}

function criarCirculos() {

    const container = document.querySelector(".circulos");

    container.innerHTML = "";

    for (let i = 0; i < QUANTIDADE_DESAFIOS; i++) {

        const circulo = document.createElement("div");

        circulo.classList.add("circulo");

        container.appendChild(circulo);
    }

}


// teclado real

document.addEventListener("keydown", function (event) {
    const tecla = event.key.toUpperCase();

    if (!tecla.match(/^[A-Z]$/)) return;

    const botao = document.querySelector(`button[onclick = "letraClicada('${tecla}')"]`);

    if (botao && !botao.disabled) {
        letraClicada(tecla);
    }
});
