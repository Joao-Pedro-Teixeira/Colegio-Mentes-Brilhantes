// ===== JAVASCRIPT PARA FUNCIONALIDADE DA PÁGINA DE LOGIN =====

document.addEventListener("DOMContentLoaded", () => {
  // ===== ELEMENTOS DO DOM =====
  const loginForm = document.getElementById("login-form") // Formulário de login
  const passwordToggle = document.getElementById("password-toggle") // Botão mostrar/ocultar senha
  const passwordInput = document.getElementById("login-password") // Campo de senha
  const passwordIcon = document.getElementById("password-icon") // Ícone do botão de senha
  const loginBtn = document.getElementById("login-btn") // Botão de login
  const btnText = loginBtn.querySelector(".btn-text") // Texto do botão
  const btnLoading = loginBtn.querySelector(".btn-loading") // Estado de loading
  const forgotForm = document.getElementById("forgot-form") // Formulário esqueci senha

  // ===== TOGGLE MOSTRAR/OCULTAR SENHA =====
  if (passwordToggle && passwordInput && passwordIcon) {
    passwordToggle.addEventListener("click", () => {
      // Alterna entre 'password' e 'text'
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)

      // Atualiza o ícone baseado no tipo
      if (type === "text") {
        passwordIcon.classList.remove("fa-eye") // Remove ícone de olho
        passwordIcon.classList.add("fa-eye-slash") // Adiciona ícone de olho cortado
      } else {
        passwordIcon.classList.remove("fa-eye-slash") // Remove ícone de olho cortado
        passwordIcon.classList.add("fa-eye") // Adiciona ícone de olho
      }
    })
  }

  // ===== ENVIO DO FORMULÁRIO DE LOGIN =====
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault() // Previne envio padrão

      // Obtém valores dos campos
      const email = document.getElementById("login-email").value
      const password = document.getElementById("login-password").value

      // Validação básica
      if (!email || !password) {
        showMessage("Por favor, preencha todos os campos.", "error")
        return
      }

      // ===== MOSTRAR ESTADO DE LOADING =====
      if (btnText && btnLoading) {
        btnText.classList.add("hidden") // Esconde texto normal
        btnLoading.classList.remove("hidden") // Mostra loading
        loginBtn.disabled = true // Desabilita botão
      }

      // ===== SIMULAR PROCESSO DE LOGIN =====
      setTimeout(() => {
        // ===== RESETAR BOTÃO =====
        if (btnText && btnLoading) {
          btnText.classList.remove("hidden") // Mostra texto normal
          btnLoading.classList.add("hidden") // Esconde loading
          loginBtn.disabled = false // Habilita botão
        }

        // ===== SIMULAR SUCESSO DO LOGIN =====
        showMessage("Login realizado com sucesso!", "success")

        // Redirecionar após 2 segundos
        setTimeout(() => {
          window.location.href = "index.html"
        }, 2000)
      }, 1500) // Simula 1.5s de processamento
    })
  }

  // ===== FORMULÁRIO DE RECUPERAÇÃO DE SENHA =====
  if (forgotForm) {
    forgotForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const email = document.getElementById("forgot-email").value

      // Validação do e-mail
      if (!email) {
        showMessage("Por favor, digite seu e-mail.", "error")
        return
      }

      // Simular envio das instruções
      showMessage("Instruções enviadas para seu e-mail!", "success")
      closeForgotModal()

      // Limpar formulário
      forgotForm.reset()
    })
  }

  // ===== FECHAR MODAL CLICANDO FORA =====
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("forgot-modal")
    // Se clicou no fundo do modal (não no conteúdo)
    if (modal && e.target === modal) {
      closeForgotModal()
    }
  })
})

// ===== FUNÇÃO PARA MOSTRAR MODAL DE ESQUECI SENHA =====
function showForgotPassword() {
  const modal = document.getElementById("forgot-modal")
  if (modal) {
    modal.classList.remove("hidden") // Torna modal visível
    document.body.style.overflow = "hidden" // Impede scroll da página
  }
}

// ===== FUNÇÃO PARA FECHAR MODAL DE ESQUECI SENHA =====
function closeForgotModal() {
  const modal = document.getElementById("forgot-modal")
  if (modal) {
    modal.classList.add("hidden") // Esconde modal
    document.body.style.overflow = "" // Restaura scroll
  }
}

// ===== FUNÇÃO PARA MOSTRAR MENSAGENS =====
function showMessage(message, type = "success") {
  // Remove mensagens existentes
  const existingMessages = document.querySelectorAll(".message")
  existingMessages.forEach((msg) => {
    if (document.body.contains(msg)) {
      document.body.removeChild(msg)
    }
  })

  // Cria elemento da mensagem
  const messageDiv = document.createElement("div")
  messageDiv.className = `message message-${type}`
  messageDiv.textContent = message

  // Aplica estilos inline
  messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 600;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        background-color: ${type === "success" ? "#10b981" : "#ef4444"};
    `

  // Adiciona ao DOM
  document.body.appendChild(messageDiv)

  // Remove após 3 segundos
  setTimeout(() => {
    messageDiv.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      if (document.body.contains(messageDiv)) {
        document.body.removeChild(messageDiv)
      }
    }, 300)
  }, 3000)
}
