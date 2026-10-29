// ===== JAVASCRIPT PARA FUNCIONALIDADE DA PÁGINA DE MATRÍCULA =====

document.addEventListener("DOMContentLoaded", () => {
  // ===== VARIÁVEIS DE CONTROLE =====
  let currentTab = 0
  const tabs = ["aluno", "responsavel", "outros"]

  // ===== ELEMENTOS DO DOM =====
  const tabTriggers = document.querySelectorAll(".tab-trigger")
  const tabContents = document.querySelectorAll(".tab-content")
  const btnAnterior = document.getElementById("btn-anterior")
  const btnProximo = document.getElementById("btn-proximo")
  const btnEnviar = document.getElementById("btn-enviar")
  const form = document.getElementById("matricula-form")

  // ===== CORRIGIR ATRIBUTOS NAME DOS CAMPOS =====
  function corrigirAtributosName() {
    // Adicionar atributo name para todos os inputs que não têm
    const inputs = form.querySelectorAll("input, select, textarea")
    inputs.forEach((input) => {
      if (!input.name && input.id) {
        input.name = input.id
        console.log(`Adicionado name="${input.id}" para campo ${input.id}`)
      }
    })
  }

  // ===== INICIALIZAÇÃO =====
  corrigirAtributosName()
  updateTabDisplay()

  // ===== EVENT LISTENERS PARA AS ABAS =====
  tabTriggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      currentTab = index
      updateTabDisplay()
    })
  })

  // ===== BOTÃO ANTERIOR =====
  if (btnAnterior) {
    btnAnterior.addEventListener("click", () => {
      if (currentTab > 0) {
        currentTab--
        updateTabDisplay()
      }
    })
  }

  // ===== BOTÃO PRÓXIMO =====
  if (btnProximo) {
    btnProximo.addEventListener("click", () => {
      if (validateCurrentTab()) {
        if (currentTab < tabs.length - 1) {
          currentTab++
          updateTabDisplay()
        }
      }
    })
  }

  // ===== ENVIO DO FORMULÁRIO =====
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      console.log("🚀 Iniciando envio da matrícula...")

      if (validateForm()) {
        // Mostrar loading
        if (btnEnviar) {
          btnEnviar.disabled = true
          btnEnviar.textContent = "Enviando..."
        }

        // Coletar todos os dados do formulário
        const formData = new FormData(form)
        const dados = {}

        // Converter FormData para objeto
        for (const [key, value] of formData.entries()) {
          dados[key] = value
        }

        // Adicionar dados dos checkboxes
        dados.autorizacaoImagem = document.getElementById("autorizacaoImagem")?.checked || false
        dados.termoAceite = document.getElementById("termoAceite")?.checked || false

        console.log("📝 Dados coletados:", dados)

        try {
          const response = await fetch("/api/matricula/enviar", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dados),
          })

          const result = await response.json()
          console.log("📨 Resposta do servidor:", result)

          if (result.success) {
            // Mostrar modal de sucesso com dados de acesso
            showSuccessModal(result.dadosAcesso)
          } else {
            showMessage(result.message || "Erro ao enviar matrícula", "error")
          }
        } catch (error) {
          console.error("❌ Erro:", error)
          showMessage("Erro de conexão. Tente novamente.", "error")
        } finally {
          // Resetar botão
          if (btnEnviar) {
            btnEnviar.disabled = false
            btnEnviar.textContent = "Enviar Matrícula"
          }
        }
      }
    })
  }

  // ===== FUNÇÃO PARA ATUALIZAR DISPLAY DAS ABAS =====
  function updateTabDisplay() {
    tabTriggers.forEach((trigger, index) => {
      trigger.classList.toggle("active", index === currentTab)
    })

    tabContents.forEach((content, index) => {
      content.classList.toggle("active", index === currentTab)
    })

    if (btnAnterior) {
      btnAnterior.disabled = currentTab === 0
    }

    if (currentTab === tabs.length - 1) {
      if (btnProximo) btnProximo.classList.add("hidden")
      if (btnEnviar) btnEnviar.classList.remove("hidden")
    } else {
      if (btnProximo) btnProximo.classList.remove("hidden")
      if (btnEnviar) btnEnviar.classList.add("hidden")
    }
  }

  // ===== VALIDAÇÃO DA ABA ATUAL =====
  function validateCurrentTab() {
    const currentTabContent = document.getElementById(`tab-${tabs[currentTab]}`)
    if (!currentTabContent) return true

    const requiredFields = currentTabContent.querySelectorAll("[required]")
    let isValid = true

    requiredFields.forEach((field) => {
      // Só validar campos visíveis
      if (field.offsetParent !== null) {
        if (!field.value.trim()) {
          field.classList.add("error")
          isValid = false
          console.log(`Campo obrigatório vazio: ${field.name || field.id}`)
        } else {
          field.classList.remove("error")
        }
      }
    })

    if (!isValid) {
      showMessage("Por favor, preencha todos os campos obrigatórios.", "error")
    }

    return isValid
  }

  // ===== VALIDAÇÃO COMPLETA DO FORMULÁRIO =====
  function validateForm() {
    const requiredFields = form.querySelectorAll("[required]")
    let isValid = true

    requiredFields.forEach((field) => {
      // Só validar campos visíveis
      if (field.offsetParent !== null) {
        if (!field.value.trim()) {
          field.classList.add("error")
          isValid = false
          console.log(`Campo obrigatório vazio: ${field.name || field.id}`)
        } else {
          field.classList.remove("error")
        }
      }
    })

    const termoAceite = document.getElementById("termoAceite")
    if (termoAceite && !termoAceite.checked) {
      showMessage("Você deve aceitar os termos e condições.", "error")
      isValid = false
    }

    if (!isValid) {
      showMessage("Por favor, preencha todos os campos obrigatórios.", "error")
    }

    return isValid
  }

  // ===== MOSTRAR MODAL DE SUCESSO COM DADOS DE ACESSO =====
  function showSuccessModal(dadosAcesso) {
    const modal = document.getElementById("success-modal")
    if (modal && dadosAcesso) {
      // Atualizar conteúdo do modal com dados de acesso
      const modalBody = modal.querySelector(".modal-body")
      if (modalBody) {
        modalBody.innerHTML = `
          <div class="proximos-passos">
            <h3>✅ Matrícula enviada com sucesso!</h3>
            <p>Seus dados de acesso foram criados:</p>
            <div style="background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p><strong>📧 Email:</strong> ${dadosAcesso.email}</p>
              <p><strong>🔑 Senha:</strong> ${dadosAcesso.senha}</p>
              <p><strong>📋 ID da Matrícula:</strong> ${dadosAcesso.matriculaId}</p>
            </div>
            <p><strong>⚠️ Importante:</strong> Anote esses dados! Use-os para fazer login no portal do aluno.</p>
            <h4>Próximos passos:</h4>
            <ul>
              <li>• Análise da documentação (1-2 dias úteis)</li>
              <li>• Contato para agendamento de entrevista</li>
              <li>• Finalização da matrícula</li>
            </ul>
          </div>
        `
      }

      modal.classList.remove("hidden")
      document.body.style.overflow = "hidden"
    }
  }

  // ===== MÁSCARAS DE INPUT =====
  const cpfInputs = document.querySelectorAll("#cpfAluno, #cpfResponsavel")
  cpfInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      value = value.replace(/(\d{3})(\d)/, "$1.$2")
      value = value.replace(/(\d{3})(\d)/, "$1.$2")
      value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2")
      e.target.value = value
    })
  })

  const telefoneInput = document.getElementById("telefone")
  if (telefoneInput) {
    telefoneInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      value = value.replace(/(\d{2})(\d)/, "($1) $2")
      value = value.replace(/(\d{5})(\d)/, "$1-$2")
      e.target.value = value
    })
  }

  const cepInput = document.getElementById("cep")
  if (cepInput) {
    cepInput.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      value = value.replace(/(\d{5})(\d)/, "$1-$2")
      e.target.value = value
    })
  }
})

// ===== FUNÇÃO PARA FECHAR MODAL =====
function closeModal() {
  const modal = document.getElementById("success-modal")
  if (modal) {
    modal.classList.add("hidden")
    document.body.style.overflow = ""

    setTimeout(() => {
      window.location.href = "/"
    }, 300)
  }
}

// ===== FUNÇÃO PARA MOSTRAR MENSAGENS =====
function showMessage(message, type = "success") {
  const existingMessages = document.querySelectorAll(".message")
  existingMessages.forEach((msg) => {
    if (document.body.contains(msg)) {
      document.body.removeChild(msg)
    }
  })

  const messageDiv = document.createElement("div")
  messageDiv.className = `message message-${type}`
  messageDiv.textContent = message

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

  document.body.appendChild(messageDiv)

  setTimeout(() => {
    messageDiv.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      if (document.body.contains(messageDiv)) {
        document.body.removeChild(messageDiv)
      }
    }, 300)
  }, 3000)
}
