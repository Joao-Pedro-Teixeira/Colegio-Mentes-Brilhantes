// ===== JAVASCRIPT SIMPLIFICADO PARA CONTATO =====

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 JavaScript do contato carregado")

  // ===== FORMULÁRIO DE CONTATO =====
  const contatoForm = document.getElementById("contato-form")
  if (contatoForm) {
    console.log("✅ Formulário de contato encontrado")

    contatoForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("📤 Enviando mensagem de contato...")

      const formData = new FormData(contatoForm)
      const dados = {
        nome: formData.get("nome"),
        email: formData.get("email"),
        assunto: formData.get("assunto"),
        mensagem: formData.get("mensagem"),
      }

      console.log("📋 Dados do contato:", dados)

      // Validação básica
      if (!dados.nome || !dados.email || !dados.mensagem) {
        alert("Por favor, preencha nome, email e mensagem.")
        return
      }

      // Desabilitar botão
      const submitBtn = contatoForm.querySelector('button[type="submit"]')
      if (submitBtn) {
        submitBtn.disabled = true
        submitBtn.textContent = "Enviando..."
      }

      try {
        const response = await fetch("/api/contato/enviar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados),
        })

        const result = await response.json()
        console.log("📨 Resultado do contato:", result)

        if (result.success) {
          alert("✅ Mensagem enviada com sucesso! Retornaremos em breve.")
          contatoForm.reset()
        } else {
          alert(`❌ Erro: ${result.message}`)
        }
      } catch (error) {
        console.error("❌ Erro ao enviar contato:", error)
        alert("❌ Erro de conexão. Tente novamente.")
      } finally {
        // Reabilitar botão
        if (submitBtn) {
          submitBtn.disabled = false
          submitBtn.textContent = "Enviar Mensagem"
        }
      }
    })
  } else {
    console.log("⚠️ Formulário de contato não encontrado")
  }

  // ===== FORMULÁRIO DE AGENDAMENTO DE VISITA =====
  const visitaForm = document.getElementById("visita-form")
  if (visitaForm) {
    console.log("✅ Formulário de visita encontrado")

    visitaForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      console.log("📤 Agendando visita...")

      const formData = new FormData(visitaForm)
      const dados = {
        nome: formData.get("nome"),
        telefone: formData.get("telefone"),
        email: formData.get("email"),
        data: formData.get("data"),
        observacoes: formData.get("observacoes"),
      }

      console.log("📋 Dados da visita:", dados)

      // Validação básica
      if (!dados.nome || !dados.telefone || !dados.email) {
        alert("Por favor, preencha nome, telefone e email.")
        return
      }

      // Desabilitar botão
      const submitBtn = visitaForm.querySelector('button[type="submit"]')
      if (submitBtn) {
        submitBtn.disabled = true
        submitBtn.textContent = "Agendando..."
      }

      try {
        const response = await fetch("/api/contato/agendar-visita", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dados),
        })

        const result = await response.json()
        console.log("📨 Resultado da visita:", result)

        if (result.success) {
          alert("✅ Visita agendada com sucesso! Entraremos em contato para confirmar.")
          visitaForm.reset()

          // Fechar modal se existir
          const modal = document.getElementById("visita-modal")
          if (modal) {
            modal.classList.add("hidden")
            document.body.style.overflow = ""
          }
        } else {
          alert(`❌ Erro: ${result.message}`)
        }
      } catch (error) {
        console.error("❌ Erro ao agendar visita:", error)
        alert("❌ Erro de conexão. Tente novamente.")
      } finally {
        // Reabilitar botão
        if (submitBtn) {
          submitBtn.disabled = false
          submitBtn.textContent = "Agendar Visita"
        }
      }
    })
  } else {
    console.log("⚠️ Formulário de visita não encontrado")
  }

  // ===== MÁSCARA PARA TELEFONE =====
  const telefoneInputs = document.querySelectorAll('input[type="tel"], #telefone, #visita-telefone')
  telefoneInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "")
      if (value.length <= 11) {
        value = value.replace(/(\d{2})(\d)/, "($1) $2")
        value = value.replace(/(\d{5})(\d)/, "$1-$2")
        e.target.value = value
      }
    })
  })

  // ===== FUNÇÕES PARA MODAIS =====
  window.agendarVisita = () => {
    const modal = document.getElementById("visita-modal")
    if (modal) {
      modal.classList.remove("hidden")
      document.body.style.overflow = "hidden"
    }
  }

  window.closeVisitaModal = () => {
    const modal = document.getElementById("visita-modal")
    if (modal) {
      modal.classList.add("hidden")
      document.body.style.overflow = ""
    }
  }

  window.closeSuccessModal = () => {
    const modal = document.getElementById("success-modal")
    if (modal) {
      modal.classList.add("hidden")
      document.body.style.overflow = ""
    }
  }

  window.goHome = () => {
    window.location.href = "/"
  }

  // ===== FECHAR MODAIS CLICANDO FORA =====
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
      e.target.classList.add("hidden")
      document.body.style.overflow = ""
    }
  })

  console.log("✅ JavaScript do contato inicializado com sucesso!")
})
