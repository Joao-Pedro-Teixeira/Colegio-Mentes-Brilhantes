// ===== SCRIPT PRINCIPAL PARA FUNCIONALIDADES GERAIS =====

// Aguarda o carregamento completo do DOM antes de executar
document.addEventListener("DOMContentLoaded", () => {
  // ===== MENU MOBILE (HAMBÚRGUER) =====
  const hamburger = document.getElementById("hamburger")
  const navMenu = document.getElementById("nav-menu")

  // Verifica se os elementos existem na página
  if (hamburger && navMenu) {
    // Adiciona evento de clique no botão hambúrguer
    hamburger.addEventListener("click", () => {
      // Alterna a classe 'active' no hambúrguer (para animação)
      hamburger.classList.toggle("active")
      // Alterna a classe 'active' no menu (para mostrar/esconder)
      navMenu.classList.toggle("active")
    })

    // ===== FECHAR MENU AO CLICAR EM UM LINK =====
    const navLinks = document.querySelectorAll(".nav-link")
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        // Remove as classes 'active' para fechar o menu
        hamburger.classList.remove("active")
        navMenu.classList.remove("active")
      })
    })
  }

  // ===== SMOOTH SCROLL PARA LINKS INTERNOS =====
  // Seleciona todos os links que começam com '#' (âncoras)
  const internalLinks = document.querySelectorAll('a[href^="#"]')
  internalLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault() // Previne o comportamento padrão do link

      // Obtém o ID do elemento alvo (remove o '#')
      const targetId = this.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      // Se o elemento existe, faz scroll suave até ele
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth", // Scroll suave
        })
      }
    })
  })

  // ===== ANIMAÇÃO DE ENTRADA DOS ELEMENTOS =====
  // Configurações do Intersection Observer
  const observerOptions = {
    threshold: 0.1, // Elemento precisa estar 10% visível
    rootMargin: "0px 0px -50px 0px", // Margem inferior de 50px
  }

  // Cria o observer para detectar quando elementos entram na viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Se o elemento está visível
      if (entry.isIntersecting) {
        // Torna o elemento visível e remove a translação
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // ===== APLICAR ANIMAÇÃO AOS ELEMENTOS =====
  // Seleciona elementos que devem ter animação de entrada
  const animatedElements = document.querySelectorAll(".competencia-card, .sobre-item, .ciclo-card, .metodologia-card")

  animatedElements.forEach((el) => {
    // Define estado inicial (invisível e deslocado para baixo)
    el.style.opacity = "0"
    el.style.transform = "translateY(20px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"

    // Adiciona o elemento ao observer
    observer.observe(el)
  })
})

// ===== FUNÇÃO PARA VALIDAR FORMULÁRIOS =====
function validateForm(formId) {
  const form = document.getElementById(formId)
  if (!form) return false

  // Seleciona todos os campos obrigatórios
  const requiredFields = form.querySelectorAll("[required]")
  let isValid = true

  // Valida cada campo obrigatório
  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      // Adiciona classe de erro se campo estiver vazio
      field.classList.add("error")
      isValid = false
    } else {
      // Remove classe de erro se campo estiver preenchido
      field.classList.remove("error")
    }
  })

  return isValid
}

// ===== FUNÇÃO PARA MOSTRAR MENSAGENS DE SUCESSO/ERRO =====
function showMessage(message, type = "success") {
  // Cria elemento da mensagem
  const messageDiv = document.createElement("div")
  messageDiv.className = `message message-${type}`
  messageDiv.textContent = message

  // Aplica estilos inline para a mensagem
  messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        background-color: ${type === "success" ? "#10b981" : "#ef4444"};
    `

  // Adiciona a mensagem ao body
  document.body.appendChild(messageDiv)

  // Remove a mensagem após 3 segundos
  setTimeout(() => {
    messageDiv.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      // Verifica se o elemento ainda existe antes de remover
      if (document.body.contains(messageDiv)) {
        document.body.removeChild(messageDiv)
      }
    }, 300)
  }, 3000)
}

// ===== ADICIONAR ESTILOS PARA ANIMAÇÕES E ESTADOS DE ERRO =====
const style = document.createElement("style")
style.textContent = `
    /* Animações para as mensagens */
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    /* Estilos para campos com erro */
    .form-input.error,
    .form-select.error,
    .form-textarea.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
`
// Adiciona os estilos ao head do documento
document.head.appendChild(style)
