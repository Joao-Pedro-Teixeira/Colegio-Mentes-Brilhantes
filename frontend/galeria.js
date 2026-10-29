// ===== DADOS DAS FOTOS DA GALERIA =====
const fotosGaleria = [
  {
    id: 1,
    src: "img/fachada.png",
    alt: "Fachada da escola",
    categoria: "estrutura",
    titulo: "Fachada Principal",
  },
  {
    id: 2,
    src: "img/biblioteca.png",
    alt: "Biblioteca",
    categoria: "estrutura",
    titulo: "Biblioteca",
  },
  {
    id: 3,
    src: "img/6.png",
    alt: "Quadra esportiva",
    categoria: "estrutura",
    titulo: "Quadra Poliesportiva",
  },
  {
    id: 4,
    src: "img/Laboratorio.png",
    alt: "Laboratório de ciências",
    categoria: "estrutura",
    titulo: "Laboratório de Ciências",
  },
  {
    id: 5,
    src: "img/3.png",
    alt: "Sala de aula infantil",
    categoria: "ensino",
    titulo: "Educação Infantil",
  },
  {
    id: 6,
    src: "img/auladematematica.jpg",
    alt: "Aula de matemática",
    categoria: "ensino",
    titulo: "Aula de Matemática",
  },
  {
    id: 7,
    src: "img/7.png",
    alt: "Atividade de arte",
    categoria: "atividades",
    titulo: "Oficina de Arte",
  },
  {
    id: 8,
    src: "img/11.png",
    alt: "Educação física",
    categoria: "atividades",
    titulo: "Educação Física",
  },
  {
    id: 9,
    src: "img/feiradeciencias.jpg",
    alt: "Feira de ciências",
    categoria: "eventos",
    titulo: "Feira de Ciências",
  },
  {
    id: 10,
    src: "img/festajunina.jpeg",
    alt: "Festa junina",
    categoria: "eventos",
    titulo: "Festa Junina",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop",
    alt: "Formatura",
    categoria: "eventos",
    titulo: "Formatura",
  },
  {
    id: 12,
    src: "img/1.png",
    alt: "Recreio",
    categoria: "atividades",
    titulo: "Momento do Recreio",
  },
]

// ===== VARIÁVEIS DE CONTROLE =====
let currentImageIndex = 0 // Índice da imagem atual no lightbox
let filteredImages = [...fotosGaleria] // Array de imagens filtradas

// ===== INICIALIZAR GALERIA =====
document.addEventListener("DOMContentLoaded", () => {
  renderGaleria() // Renderiza a galeria inicial
  setupEventListeners() // Configura os event listeners
})

// ===== RENDERIZAR GALERIA =====
function renderGaleria() {
  const galeriaGrid = document.getElementById("galeria-grid")
  const noResults = document.getElementById("no-results")

  // Se não há imagens filtradas, mostra mensagem
  if (filteredImages.length === 0) {
    galeriaGrid.innerHTML = ""
    noResults.classList.remove("hidden")
    return
  }

  // Esconde mensagem de "sem resultados"
  noResults.classList.add("hidden")

  // Gera HTML para cada imagem filtrada
  galeriaGrid.innerHTML = filteredImages
    .map(
      (foto, index) => `
        <div class="galeria-item" data-index="${index}" onclick="openLightbox(${index})">
            <div class="galeria-image-container">
                <img class="galeria-image" src="${foto.src}" alt="${foto.alt}" loading="lazy">
                <div class="galeria-overlay">
                    <i class="fas fa-camera"></i>
                </div>
            </div>
            <div class="galeria-info">
                <h3 class="galeria-titulo">${foto.titulo}</h3>
            </div>
        </div>
    `,
    )
    .join("")
}

// ===== CONFIGURAR EVENT LISTENERS =====
function setupEventListeners() {
  // ===== FILTROS =====
  const filtroButtons = document.querySelectorAll(".filtro-btn")
  filtroButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filter = this.dataset.filter

      // ===== ATUALIZAR BOTÃO ATIVO =====
      filtroButtons.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")

      // ===== FILTRAR IMAGENS =====
      if (filter === "todas") {
        filteredImages = [...fotosGaleria] // Mostra todas as imagens
      } else {
        // Filtra por categoria específica
        filteredImages = fotosGaleria.filter((foto) => foto.categoria === filter)
      }

      renderGaleria() // Re-renderiza com o filtro aplicado
    })
  })

  // ===== LIGHTBOX =====
  const lightbox = document.getElementById("lightbox")
  const lightboxClose = document.getElementById("lightbox-close")
  const lightboxPrev = document.getElementById("lightbox-prev")
  const lightboxNext = document.getElementById("lightbox-next")

  // Event listeners dos controles do lightbox
  lightboxClose.addEventListener("click", closeLightbox)
  lightboxPrev.addEventListener("click", prevImage)
  lightboxNext.addEventListener("click", nextImage)

  // ===== FECHAR LIGHTBOX CLICANDO NO FUNDO =====
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox()
    }
  })

  // ===== NAVEGAÇÃO POR TECLADO =====
  document.addEventListener("keydown", (e) => {
    // Só funciona se o lightbox estiver ativo
    if (!lightbox.classList.contains("active")) return

    switch (e.key) {
      case "Escape": // ESC fecha o lightbox
        closeLightbox()
        break
      case "ArrowLeft": // Seta esquerda = imagem anterior
        prevImage()
        break
      case "ArrowRight": // Seta direita = próxima imagem
        nextImage()
        break
    }
  })
}

// ===== ABRIR LIGHTBOX =====
function openLightbox(index) {
  currentImageIndex = index
  const lightbox = document.getElementById("lightbox")
  const lightboxImage = document.getElementById("lightbox-image")
  const lightboxCounter = document.getElementById("lightbox-counter")

  // Define a imagem atual
  const currentImage = filteredImages[currentImageIndex]
  lightboxImage.src = currentImage.src
  lightboxImage.alt = currentImage.alt

  updateLightboxCounter() // Atualiza contador
  lightbox.classList.add("active") // Torna lightbox visível
  document.body.style.overflow = "hidden" // Impede scroll da página
}

// ===== FECHAR LIGHTBOX =====
function closeLightbox() {
  const lightbox = document.getElementById("lightbox")
  lightbox.classList.remove("active") // Esconde lightbox
  document.body.style.overflow = "" // Restaura scroll
}

// ===== IMAGEM ANTERIOR =====
function prevImage() {
  // Calcula índice anterior (com wrap-around)
  currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length
  updateLightboxImage()
}

// ===== PRÓXIMA IMAGEM =====
function nextImage() {
  // Calcula próximo índice (com wrap-around)
  currentImageIndex = (currentImageIndex + 1) % filteredImages.length
  updateLightboxImage()
}

// ===== ATUALIZAR IMAGEM DO LIGHTBOX =====
function updateLightboxImage() {
  const lightboxImage = document.getElementById("lightbox-image")
  const currentImage = filteredImages[currentImageIndex]

  // Atualiza src e alt da imagem
  lightboxImage.src = currentImage.src
  lightboxImage.alt = currentImage.alt
  updateLightboxCounter()
}

// ===== ATUALIZAR CONTADOR DO LIGHTBOX =====
function updateLightboxCounter() {
  const lightboxCounter = document.getElementById("lightbox-counter")
  // Mostra "imagem atual / total de imagens"
  lightboxCounter.textContent = `${currentImageIndex + 1} / ${filteredImages.length}`
}
