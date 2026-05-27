function mostrarToast(mensagem, tipo = "sucesso"){


    const toast = document.createElement("div");
    toast.classList.add("toast", tipo);
    toast.innerText = mensagem;


    document.body.appendChild(toast);


    setTimeout(() => toast.classList.add("show"), 100);


    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
