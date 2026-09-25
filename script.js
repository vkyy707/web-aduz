// =============================================================
// script.js — compartido por todas las páginas del sitio
// =============================================================

document.addEventListener('DOMContentLoaded', () => {

  // ---------------------------------------------------------------
  // 1. AÑO ACTUAL EN EL FOOTER (todas las páginas)
  // ---------------------------------------------------------------
  document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ---------------------------------------------------------------
  // 2. MARCAR EL ENLACE DE LA PÁGINA ACTUAL EN EL MENÚ ("active")
  // ---------------------------------------------------------------
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // ---------------------------------------------------------------
  // 3. MENÚ MÓVIL (hamburguesa)
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
  // 4. CARRUSEL GENÉRICO DE IMÁGENES (proyectos, en index.html)
  // ---------------------------------------------------------------
  function initCarousel({ trackId, prevId, nextId, dotsId, autoplay = false }) {
    const track = document.getElementById(trackId);
    if (!track) return;

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

    function startAutoplay() { if (autoplay) autoplayTimer = setInterval(nextSlide, 5000); }
    function stopAutoplay() { clearInterval(autoplayTimer); }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }

    const wrapper = track.closest('.carousel');
    if (wrapper) {
      wrapper.addEventListener('mouseenter', stopAutoplay);
      wrapper.addEventListener('mouseleave', startAutoplay);
    }

    goToSlide(0);
    startAutoplay();
  }

  initCarousel({
    trackId: 'projectsTrack',
    prevId: 'projectsPrev',
    nextId: 'projectsNext',
    dotsId: 'projectsDots',
    autoplay: true
  });

  // ---------------------------------------------------------------
  // 5. CARRUSEL "COVERFLOW" DE VÍDEOS (vídeo central + laterales)
  //    Solo existe en index.html
  // ---------------------------------------------------------------
  const coverflowTrack = document.getElementById('coverflowTrack');

  if (coverflowTrack) {
    const items = Array.from(coverflowTrack.querySelectorAll('.coverflow-item'));
    let centerIndex = Math.floor(items.length / 2); // empezamos con el del medio

    function renderCoverflow() {
      const total = items.length;

      items.forEach((item, i) => {
        // Calculamos la distancia "circular" más corta hasta el centro,
        // para que el orden visual tenga sentido incluso al dar la vuelta.
        let diff = i - centerIndex;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;

        item.style.order = diff;
        item.classList.toggle('is-center', diff === 0);

        const video = item.querySelector('video');
        if (!video) return;

        if (diff === 0) {
          // El vídeo central se reproduce; el volumen lo controla el slider
          video.play().catch(() => { /* el navegador puede bloquear autoplay con sonido */ });
        } else {
          video.pause();
        }
      });
    }

    // Clic en cualquier vídeo: si es lateral, pasa a ser el central;
    // si ya es el central, se abre Instagram (salvo que se toque el volumen)
    items.forEach((item, i) => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.coverflow-controls')) return; // no interferir con el volumen

        if (item.classList.contains('is-center')) {
          const igLink = item.dataset.igLink;
          if (igLink) window.open(igLink, '_blank', 'noopener,noreferrer');
        } else {
          centerIndex = i;
          renderCoverflow();
        }
      });

      const controls = item.querySelector('.coverflow-controls');
      if (controls) controls.addEventListener('click', (e) => e.stopPropagation());

      const slider = item.querySelector('.volume-slider');
      const video = item.querySelector('video');
      if (slider && video) {
        slider.addEventListener('input', () => {
          const value = parseFloat(slider.value);
          video.volume = value;
          video.muted = value === 0;
        });
      }
    });

    renderCoverflow();
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
      e.preventDefault();

      // --- AQUÍ IRÍA LA CONEXIÓN A UN SERVICIO REAL DE FORMULARIOS ---
      // Con Formspree:
      //
      //   fetch('https://formspree.io/f/TU_ID_DE_FORMULARIO', {
      //     method: 'POST',
      //     headers: { 'Accept': 'application/json' },
      //     body: new FormData(contactForm)
      //   })
      //   .then(response => { if (response.ok) { /* mostrar éxito */ } });
      //
      // Con Netlify Forms: añade data-netlify="true" al <form> en el HTML
      // y despliega el sitio en Netlify en lugar de GitHub Pages.
      //
      // Mientras no haya backend, simulamos el envío:

      formConfirmation.hidden = false;
      contactForm.reset();
      if (carreraGroup) carreraGroup.hidden = true;

      setTimeout(() => { formConfirmation.hidden = true; }, 6000);
    });
  }

});
