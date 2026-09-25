// =============================================================
// script.js — compartido por las 5 páginas del sitio
// =============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------------------------------------------------------------
  // 1. MARCAR EL ENLACE DE LA PÁGINA ACTUAL EN EL MENÚ ("active")
  // ---------------------------------------------------------------
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.classList.add('active');
    }
  });

  // ---------------------------------------------------------------
  // 2. MENÚ MÓVIL (hamburguesa)
  // ---------------------------------------------------------------
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        menuToggle.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------------------------------------------------------------
  // 3. FUNCIÓN GENÉRICA PARA CREAR UN CARRUSEL
  //    (se usa para el carrusel de imágenes y el de vídeos)
  // ---------------------------------------------------------------
  function initCarousel({ trackId, prevId, nextId, dotsId, autoplay = false }) {
    const track = document.getElementById(trackId);
    if (!track) return; // esta página no tiene este carrusel

    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const dotsContainer = dotsId ? document.getElementById(dotsId) : null;
    const slides = Array.from(track.children);
    let currentIndex = 0;
    let autoplayTimer = null;

    if (dotsContainer) {
      slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        dot.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });
    }

    function updateDots() {
      if (!dotsContainer) return;
      Array.from(dotsContainer.children).forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    }

    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(${-currentIndex * 100}%)`;
      updateDots();
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

    function startAutoplay() {
      if (!autoplay) return;
      autoplayTimer = setInterval(nextSlide, 5000);
    }
    function stopAutoplay() { clearInterval(autoplayTimer); }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }

    const carouselWrapper = track.closest('.carousel');
    if (carouselWrapper) {
      carouselWrapper.addEventListener('mouseenter', stopAutoplay);
      carouselWrapper.addEventListener('mouseleave', startAutoplay);
    }

    goToSlide(0);
    startAutoplay();
  }

  // Carrusel de imágenes de actividades (página de inicio)
  initCarousel({
    trackId: 'activitiesTrack',
    prevId: 'activitiesPrev',
    nextId: 'activitiesNext',
    dotsId: 'activitiesDots',
    autoplay: true
  });

  // Carrusel de vídeos verticales (página de inicio)
  initCarousel({
    trackId: 'videosTrack',
    prevId: 'videosPrev',
    nextId: 'videosNext',
    dotsId: null,
    autoplay: false // los vídeos ya se reproducen solos; no forzamos avance automático
  });

  // ---------------------------------------------------------------
  // 4. CARRUSEL DE VÍDEOS: clic para abrir Instagram + control de volumen
  // ---------------------------------------------------------------
  document.querySelectorAll('.video-card').forEach(card => {
    const video = card.querySelector('video');
    const volumeSlider = card.querySelector('.volume-slider');
    const igLink = card.dataset.igLink;

    // Clic en la tarjeta (pero NO en el control de volumen) abre Instagram
    card.addEventListener('click', (e) => {
      if (e.target.closest('.video-controls')) return; // no abrir si se toca el volumen
      if (igLink) window.open(igLink, '_blank', 'noopener,noreferrer');
    });

    // El control de volumen no debe disparar el clic de la tarjeta
    const controls = card.querySelector('.video-controls');
    if (controls) {
      controls.addEventListener('click', (e) => e.stopPropagation());
    }

    // Al mover el slider, ajustamos el volumen real del vídeo
    if (volumeSlider && video) {
      volumeSlider.addEventListener('input', () => {
        const value = parseFloat(volumeSlider.value);
        video.volume = value;
        video.muted = value === 0; // si el volumen es 0, mantenemos "muted" activo
      });
    }
  });

  // ---------------------------------------------------------------
  // 5. PAUSAR VÍDEOS FUERA DE PANTALLA (ahorra datos y batería)
  //    Solo reproducimos el vídeo cuando está realmente visible.
  // ---------------------------------------------------------------
  const reelVideos = document.querySelectorAll('.reel-video');
  if (reelVideos.length && 'IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.play().catch(() => { /* el navegador puede bloquear el autoplay con sonido */ });
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.5 });

    reelVideos.forEach(video => videoObserver.observe(video));
  }

  // ---------------------------------------------------------------
  // 6. MOSTRAR/OCULTAR CAMPO "CARRERA" SEGÚN TIPO DE COLABORACIÓN
  // ---------------------------------------------------------------
  const tipoColaboracion = document.getElementById('tipoColaboracion');
  const carreraGroup = document.getElementById('carreraGroup');
  const carreraInput = document.getElementById('carrera');

  if (tipoColaboracion && carreraGroup) {
    tipoColaboracion.addEventListener('change', () => {
      if (tipoColaboracion.value === 'Estudiante') {
        carreraGroup.hidden = false;
      } else {
        carreraGroup.hidden = true;
        if (carreraInput) carreraInput.value = '';
      }
    });
  }

  // ---------------------------------------------------------------
  // 7. ENVÍO SIMULADO DEL FORMULARIO DE CONTACTO
  // ---------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const formConfirmation = document.getElementById('formConfirmation');

  if (contactForm && formConfirmation) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault(); // evita que la página se recargue

      // --- AQUÍ IRÍA LA CONEXIÓN A UN SERVICIO REAL DE FORMULARIOS ---
      // Con Formspree:
      //
      //   fetch('https://formspree.io/f/TU_ID_DE_FORMULARIO', {
      //     method: 'POST',
      //     headers: { 'Accept': 'application/json' },
      //     body: new FormData(contactForm)
      //   })
      //   .then(response => {
      //     if (response.ok) { /* mostrar mensaje de éxito */ }
      //   });
      //
      // Con Netlify Forms: añade el atributo data-netlify="true" al <form>
      // en el HTML y despliega el sitio en Netlify en lugar de GitHub Pages.
      //
      // Mientras no haya backend, simplemente simulamos el envío:

      formConfirmation.hidden = false;
      contactForm.reset();
      if (carreraGroup) carreraGroup.hidden = true;

      setTimeout(() => { formConfirmation.hidden = true; }, 6000);
    });
  }

});
