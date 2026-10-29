// ===== JAVASCRIPT PARA ADMINISTRAÇÃO COM PERSISTÊNCIA =====

console.log("🚀 Carregando JavaScript do admin...")

// ===== CONFIGURAÇÃO =====
const API_BASE = "" // Usar URL relativa para evitar problemas de CORS
const STORAGE_KEY = "admin_session"

// ===== ELEMENTOS DO DOM =====
let loginForm, adminPanel, loginSection

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ DOM carregado")

  // Encontrar elementos com os IDs corretos do HTML fornecido
  loginForm = document.getElementById("admin-login-form")
  adminPanel = document.getElementById("admin-panel")
  loginSection = document.getElementById("admin-login")

  console.log("📋 Elementos encontrados:", {
    loginForm: !!loginForm,
    adminPanel: !!adminPanel,
    loginSection: !!loginSection,
  })

  // Verificar se já está logado
  checkAuthStatus()

  // Configurar eventos
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  // Configurar navegação do painel
  setupNavigation()

  // Configurar logout
  const logoutBtn = document.getElementById("admin-logout")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout)
  }
})

// ===== GERENCIAMENTO DE SESSÃO =====
function saveSession(adminData) {
  const sessionData = {
    admin: adminData,
    timestamp: Date.now(),
    expiresIn: 8 * 60 * 60 * 1000, // 8 horas em millisegundos
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
  console.log("💾 Sessão salva:", adminData.nome)
}

function getSession() {
  try {
    const sessionData = localStorage.getItem(STORAGE_KEY)
    if (!sessionData) return null

    const session = JSON.parse(sessionData)
    const now = Date.now()

    // Verificar se a sessão expirou
    if (now - session.timestamp > session.expiresIn) {
      console.log("⏰ Sessão expirada")
      clearSession()
      return null
    }

    console.log("✅ Sessão válida encontrada:", session.admin.nome)
    return session
  } catch (error) {
    console.error("❌ Erro ao recuperar sessão:", error)
    clearSession()
    return null
  }
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY)
  console.log("🗑️ Sessão removida")
}

function isLoggedIn() {
  return getSession() !== null
}

// ===== VERIFICAR AUTENTICAÇÃO =====
async function checkAuthStatus() {
  try {
    console.log("🔍 Verificando autenticação...")

    const session = getSession()
    if (session) {
      console.log("✅ Usuário já logado:", session.admin.nome)
      showAdminPanel(session.admin)
    } else {
      console.log("❌ Usuário não logado")
      showLoginForm()
    }
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error)
    showLoginForm()
  }
}

// ===== MOSTRAR FORMULÁRIO DE LOGIN =====
function showLoginForm() {
  console.log("🔐 Mostrando formulário de login")

  if (loginSection) {
    loginSection.style.display = "block"
    loginSection.classList.remove("hidden")
    console.log("✅ Login section mostrada")
  } else {
    console.error("❌ Login section não encontrada")
  }

  if (adminPanel) {
    adminPanel.style.display = "none"
    adminPanel.classList.add("hidden")
    console.log("✅ Admin panel ocultado")
  } else {
    console.error("❌ Admin panel não encontrado")
  }
}

// ===== MOSTRAR PAINEL ADMIN =====
function showAdminPanel(adminData = null) {
  console.log("👤 Mostrando painel admin")

  if (loginSection) {
    loginSection.style.display = "none"
    loginSection.classList.add("hidden")
    console.log("✅ Login section ocultada")
  } else {
    console.error("❌ Login section não encontrada")
  }

  if (adminPanel) {
    adminPanel.style.display = "block"
    adminPanel.classList.remove("hidden")
    console.log("✅ Admin panel mostrado")
  } else {
    console.error("❌ Admin panel não encontrado")
  }

  // Atualizar informações do usuário
  if (adminData) {
    const userNameElement = document.getElementById("admin-user-name")
    if (userNameElement) {
      userNameElement.textContent = adminData.nome
    }
  }

  // Carregar dados do dashboard
  loadDashboardData()
}

// ===== HANDLE LOGIN =====
async function handleLogin(e) {
  e.preventDefault()
  console.log("📤 Tentando fazer login...")

  const email = document.getElementById("admin-email")?.value
  const password = document.getElementById("admin-password")?.value

  console.log("📋 Dados do login:", { email, password })

  if (!email || !password) {
    showMessage("Por favor, preencha email e senha!", "error")
    return
  }

  const submitBtn = loginForm.querySelector(".btn-admin-login")
  const btnText = submitBtn?.querySelector(".btn-text")
  const btnLoading = submitBtn?.querySelector(".btn-loading")

  console.log("🔍 Elementos do botão:", { submitBtn: !!submitBtn, btnText: !!btnText, btnLoading: !!btnLoading })

  if (submitBtn) {
    submitBtn.disabled = true
    if (btnText) btnText.classList.add("hidden")
    if (btnLoading) btnLoading.classList.remove("hidden")
  }

  try {
    console.log("🌐 Enviando credenciais para:", `${API_BASE}/api/auth/admin/login`)

    const response = await fetch(`${API_BASE}/api/auth/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    console.log("📡 Status da resposta:", response.status)

    const result = await response.json()
    console.log("📨 Resultado login:", result)

    if (result.success) {
      console.log("✅ Login realizado com sucesso!")

      // Salvar sessão
      saveSession(result.admin)

      showMessage("Login realizado com sucesso!", "success")

      // Mostrar painel admin
      showAdminPanel(result.admin)
    } else {
      console.error("❌ Erro no login:", result.message)
      showMessage(result.message || "Erro no login", "error")
    }
  } catch (error) {
    console.error("❌ Erro no login:", error)
    showMessage("Erro de conexão. Verifique se o servidor está rodando.", "error")
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false
      if (btnText) btnText.classList.remove("hidden")
      if (btnLoading) btnLoading.classList.add("hidden")
    }
  }
}

// ===== HANDLE LOGOUT =====
function handleLogout() {
  console.log("🚪 Fazendo logout...")

  // Limpar sessão
  clearSession()

  showMessage("Logout realizado com sucesso!", "success")

  // Mostrar formulário de login
  showLoginForm()

  // Limpar formulário
  if (loginForm) {
    loginForm.reset()
  }
}

// ===== CONFIGURAR NAVEGAÇÃO =====
function setupNavigation() {
  const navItems = document.querySelectorAll(".admin-nav-item")

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Verificar se ainda está logado
      if (!isLoggedIn()) {
        showMessage("Sessão expirada. Faça login novamente.", "error")
        showLoginForm()
        return
      }

      const section = item.getAttribute("data-section")
      console.log("📑 Navegando para seção:", section)

      // Remover classe active de todos os itens
      navItems.forEach((nav) => nav.classList.remove("active"))
      item.classList.add("active")

      // Mostrar seção correspondente
      showSection(section)
    })
  })
}

// ===== MOSTRAR SEÇÃO =====
function showSection(sectionName) {
  // Verificar se ainda está logado
  if (!isLoggedIn()) {
    showMessage("Sessão expirada. Faça login novamente.", "error")
    showLoginForm()
    return
  }

  // Ocultar todas as seções
  const sections = document.querySelectorAll(".admin-section")
  sections.forEach((section) => {
    section.classList.remove("active")
    section.classList.add("hidden")
  })

  // Mostrar seção específica
  const targetSection = document.getElementById(`${sectionName}-section`)
  if (targetSection) {
    targetSection.classList.add("active")
    targetSection.classList.remove("hidden")

    // Carregar dados da seção
    loadSectionData(sectionName)
  }
}

// ===== CARREGAR DADOS DA SEÇÃO =====
function loadSectionData(sectionName) {
  switch (sectionName) {
    case "dashboard":
      loadDashboardData()
      break
    case "contatos":
      carregarContatos()
      break
    case "visitas":
      carregarVisitas()
      break
    case "matriculas":
      carregarMatriculas()
      break
    case "alunos":
      carregarAlunos()
      break
  }
}

// ===== CARREGAR DADOS DO DASHBOARD =====
async function loadDashboardData() {
  try {
    console.log("📊 Carregando dados do dashboard...")

    // Verificar se ainda está logado
    if (!isLoggedIn()) {
      showLoginForm()
      return
    }

    // Carregar contatos
    const contatosResponse = await fetch(`${API_BASE}/api/admin/contatos`)
    const contatosData = await contatosResponse.json()
    const totalContatos = contatosData.success ? contatosData.contatos.length : 0

    // Carregar visitas
    const visitasResponse = await fetch(`${API_BASE}/api/admin/visitas`)
    const visitasData = await visitasResponse.json()
    const totalVisitas = visitasData.success ? visitasData.visitas.length : 0

    // Carregar matrículas
    const matriculasResponse = await fetch(`${API_BASE}/api/admin/matriculas`)
    const matriculasData = await matriculasResponse.json()
    const totalMatriculas = matriculasData.success ? matriculasData.matriculas.length : 0

    // Atualizar cards do dashboard
    const totalContatosEl = document.getElementById("total-contatos")
    const totalVisitasEl = document.getElementById("total-visitas")
    const totalMatriculasEl = document.getElementById("total-matriculas")
    const totalAlunosEl = document.getElementById("total-alunos")

    if (totalContatosEl) totalContatosEl.textContent = totalContatos
    if (totalVisitasEl) totalVisitasEl.textContent = totalVisitas
    if (totalMatriculasEl) totalMatriculasEl.textContent = totalMatriculas
    if (totalAlunosEl) totalAlunosEl.textContent = totalMatriculas // Por enquanto, usar matrículas como alunos

    console.log("✅ Dashboard atualizado:", { totalContatos, totalVisitas, totalMatriculas })
  } catch (error) {
    console.error("Erro ao carregar dashboard:", error)
    showMessage("Erro ao carregar dados do dashboard", "error")
  }
}

// ===== CARREGAR CONTATOS =====
async function carregarContatos() {
  try {
    console.log("📧 Carregando contatos...")

    // Verificar se ainda está logado
    if (!isLoggedIn()) {
      showLoginForm()
      return
    }

    const response = await fetch(`${API_BASE}/api/admin/contatos`)
    const data = await response.json()

    console.log("📨 Contatos recebidos:", data)

    const tbody = document.getElementById("contatos-tbody")
    if (!tbody) {
      console.warn("⚠️ Tabela de contatos não encontrada")
      return
    }

    tbody.innerHTML = ""

    if (data.success && data.contatos && data.contatos.length > 0) {
      data.contatos.forEach((contato) => {
        const row = tbody.insertRow()
        row.innerHTML = `
          <td>${contato.id}</td>
          <td>${contato.nome}</td>
          <td>${contato.email}</td>
          <td>${contato.assunto || "-"}</td>
          <td>${contato.mensagem ? contato.mensagem.substring(0, 50) + "..." : "-"}</td>
          <td>${contato.data_envio ? new Date(contato.data_envio).toLocaleString("pt-BR") : "-"}</td>
          <td><span class="status ${contato.status || "pendente"}">${contato.status || "pendente"}</span></td>
        `
      })
    } else {
      tbody.innerHTML = '<tr><td colspan="7">Nenhum contato encontrado</td></tr>'
    }
  } catch (error) {
    console.error("Erro ao carregar contatos:", error)
    const tbody = document.getElementById("contatos-tbody")
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar contatos</td></tr>'
    }
    showMessage("Erro ao carregar contatos", "error")
  }
}

// ===== CARREGAR VISITAS =====
async function carregarVisitas() {
  try {
    console.log("📅 Carregando visitas...")

    // Verificar se ainda está logado
    if (!isLoggedIn()) {
      showLoginForm()
      return
    }

    const response = await fetch(`${API_BASE}/api/admin/visitas`)
    const data = await response.json()

    console.log("📨 Visitas recebidas:", data)

    const tbody = document.getElementById("visitas-tbody")
    if (!tbody) {
      console.warn("⚠️ Tabela de visitas não encontrada")
      return
    }

    tbody.innerHTML = ""

    if (data.success && data.visitas && data.visitas.length > 0) {
      data.visitas.forEach((visita) => {
        const row = tbody.insertRow()
        row.innerHTML = `
          <td>${visita.id}</td>
          <td>${visita.nome}</td>
          <td>${visita.telefone}</td>
          <td>${visita.email}</td>
          <td>${visita.data_preferida ? new Date(visita.data_preferida).toLocaleDateString("pt-BR") : "-"}</td>
          <td>${visita.observacoes || "-"}</td>
          <td><span class="status ${visita.status || "pendente"}">${visita.status || "pendente"}</span></td>
        `
      })
    } else {
      tbody.innerHTML = '<tr><td colspan="7">Nenhuma visita encontrada</td></tr>'
    }
  } catch (error) {
    console.error("Erro ao carregar visitas:", error)
    const tbody = document.getElementById("visitas-tbody")
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7">Erro ao carregar visitas</td></tr>'
    }
    showMessage("Erro ao carregar visitas", "error")
  }
}

// ===== CARREGAR MATRÍCULAS =====
async function carregarMatriculas() {
  try {
    console.log("📝 Carregando matrículas...")

    // Verificar se ainda está logado
    if (!isLoggedIn()) {
      showLoginForm()
      return
    }

    const response = await fetch(`${API_BASE}/api/admin/matriculas`)
    const data = await response.json()

    console.log("📨 Matrículas recebidas:", data)

    const tbody = document.getElementById("matriculas-tbody")
    if (!tbody) {
      console.warn("⚠️ Tabela de matrículas não encontrada")
      return
    }

    tbody.innerHTML = ""

    if (data.success && data.matriculas && data.matriculas.length > 0) {
      data.matriculas.forEach((matricula) => {
        const row = tbody.insertRow()
        row.innerHTML = `
          <td>${matricula.id}</td>
          <td>${matricula.nome_aluno || "-"}</td>
          <td>${matricula.serie || "-"}</td>
          <td>${matricula.nome_responsavel || "-"}</td>
          <td>${matricula.telefone || "-"}</td>
          <td>${matricula.email || "-"}</td>
          <td>${matricula.data_solicitacao ? new Date(matricula.data_solicitacao).toLocaleString("pt-BR") : "-"}</td>
          <td><span class="status ${matricula.status || "pendente"}">${matricula.status || "pendente"}</span></td>
        `
      })
    } else {
      tbody.innerHTML = '<tr><td colspan="8">Nenhuma matrícula encontrada</td></tr>'
    }
  } catch (error) {
    console.error("Erro ao carregar matrículas:", error)
    const tbody = document.getElementById("matriculas-tbody")
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="8">Erro ao carregar matrículas</td></tr>'
    }
    showMessage("Erro ao carregar matrículas", "error")
  }
}

// ===== CARREGAR ALUNOS =====
async function carregarAlunos() {
  try {
    console.log("👥 Carregando alunos...")

    // Verificar se ainda está logado
    if (!isLoggedIn()) {
      showLoginForm()
      return
    }

    const response = await fetch(`${API_BASE}/api/admin/alunos`)
    const data = await response.json()

    console.log("📨 Alunos recebidos:", data)

    const tbody = document.getElementById("alunos-tbody")
    if (!tbody) {
      console.warn("⚠️ Tabela de alunos não encontrada")
      return
    }

    tbody.innerHTML = ""

    if (data.success && data.alunos && data.alunos.length > 0) {
      data.alunos.forEach((aluno) => {
        const row = tbody.insertRow()
        row.innerHTML = `
          <td>${aluno.id}</td>
          <td>${aluno.nome_completo || "-"}</td>
          <td>${aluno.email || "-"}</td>
          <td>${aluno.serie || "-"}</td>
          <td><span class="status ${aluno.status || "pendente"}">${aluno.status || "pendente"}</span></td>
          <td>${aluno.data_matricula ? new Date(aluno.data_matricula).toLocaleString("pt-BR") : "-"}</td>
        `
      })
    } else {
      tbody.innerHTML = '<tr><td colspan="6">Nenhum aluno encontrado</td></tr>'
    }
  } catch (error) {
    console.error("Erro ao carregar alunos:", error)
    const tbody = document.getElementById("alunos-tbody")
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="6">Erro ao carregar alunos</td></tr>'
    }
    showMessage("Erro ao carregar alunos", "error")
  }
}

// ===== SISTEMA DE MENSAGENS =====
function showMessage(message, type = "success") {
  // Remover mensagens existentes
  const existingMessages = document.querySelectorAll(".admin-message")
  existingMessages.forEach((msg) => {
    if (document.body.contains(msg)) {
      document.body.removeChild(msg)
    }
  })

  // Criar nova mensagem
  const messageDiv = document.createElement("div")
  messageDiv.className = `admin-message admin-message-${type}`
  messageDiv.textContent = message

  messageDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    background-color: ${type === "success" ? "#10b981" : "#ef4444"};
  `

  document.body.appendChild(messageDiv)

  // Remover após 4 segundos
  setTimeout(() => {
    if (document.body.contains(messageDiv)) {
      messageDiv.style.animation = "slideOutRight 0.3s ease"
      setTimeout(() => {
        if (document.body.contains(messageDiv)) {
          document.body.removeChild(messageDiv)
        }
      }, 300)
    }
  }, 4000)
}

// ===== VERIFICAÇÃO PERIÓDICA DE SESSÃO =====
setInterval(() => {
  if (isLoggedIn()) {
    const session = getSession()
    if (!session) {
      console.log("⏰ Sessão expirou durante uso")
      showMessage("Sua sessão expirou. Faça login novamente.", "error")
      showLoginForm()
    }
  }
}, 60000) // Verificar a cada minuto

// ===== FUNÇÕES GLOBAIS =====
window.carregarContatos = carregarContatos
window.carregarVisitas = carregarVisitas
window.carregarMatriculas = carregarMatriculas
window.carregarAlunos = carregarAlunos

console.log("✅ JavaScript do admin configurado com persistência!")
