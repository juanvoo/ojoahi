// document.addEventListener('DOMContentLoaded', (event) => {
//     const toggleContrastBtn = document.getElementById('toggle-contrast');
//     const increaseFontBtn = document.getElementById('increase-font');
//     const decreaseFontBtn = document.getElementById('decrease-font');

//     // Alternar alto contraste
//     toggleContrastBtn.addEventListener('click', () => {
//         document.body.classList.toggle('high-contrast');
//     });

//     // Aumentar tamaño de texto
//     increaseFontBtn.addEventListener('click', () => {
//         if (document.body.classList.contains('large-text')) {
//             document.body.classList.remove('large-text');
//             document.body.classList.add('extra-large-text');
//         } else if (!document.body.classList.contains('extra-large-text')) {
//             document.body.classList.add('large-text');
//         }
//     });

//     // Disminuir tamaño de texto
//     decreaseFontBtn.addEventListener('click', () => {
//         if (document.body.classList.contains('extra-large-text')) {
//             document.body.classList.remove('extra-large-text');
//             document.body.classList.add('large-text');
//         } else if (document.body.classList.contains('large-text')) {
//             document.body.classList.remove('large-text');
//         }
//     });

//     // Función para leer el texto en voz alta
//     function speak(text) {
//         if ('speechSynthesis' in window) {
//             const utterance = new SpeechSynthesisUtterance(text);
//             window.speechSynthesis.speak(utterance);
//         }
//     }

//     // Agregar funcionalidad de lectura a elementos importantes
//     document.querySelectorAll('h1, h2, p, li, a').forEach(element => {
//         element.addEventListener('focus', () => {
//             speak(element.textContent);
//         });
//     });
// });
// document.getElementById('mobile-menu').addEventListener('click', function() {
//     const navLinks = document.querySelector('.nav-links');
//     navLinks.classList.toggle('active');
// });

// main.js

// document.addEventListener('DOMContentLoaded', function() {
//     // Initialize tooltips
//     initTooltips();

//     // Add smooth scrolling to all links
//     addSmoothScrolling();

//     // Initialize form validation
//     initFormValidation();

//     // Initialize reservation date picker
//     initDatePicker();
// });

// function initTooltips() {
//     const tooltips = document.querySelectorAll('[data-tooltip]');
//     tooltips.forEach(tooltip => {
//         tooltip.addEventListener('mouseover', showTooltip);
//         tooltip.addEventListener('mouseout', hideTooltip);
//     });
// }

// function showTooltip(event) {
//     const tooltipText = event.target.getAttribute('data-tooltip');
//     const tooltipEl = document.createElement('div');
//     tooltipEl.className = 'tooltip';
//     tooltipEl.textContent = tooltipText;
//     document.body.appendChild(tooltipEl);

//     const rect = event.target.getBoundingClientRect();
//     tooltipEl.style.top = `${rect.bottom + window.scrollY + 5}px`;
//     tooltipEl.style.left = `${rect.left + window.scrollX}px`;
// }

// function hideTooltip() {
//     const tooltip = document.querySelector('.tooltip');
//     if (tooltip) {
//         tooltip.remove();
//     }
// }

// function addSmoothScrolling() {
//     document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//         anchor.addEventListener('click', function (e) {
//             e.preventDefault();
//             document.querySelector(this.getAttribute('href')).scrollIntoView({
//                 behavior: 'smooth'
//             });
//         });
//     });
// }

// function initFormValidation() {
//     const forms = document.querySelectorAll('form');
//     forms.forEach(form => {
//         form.addEventListener('submit', function(event) {
//             if (!form.checkValidity()) {
//                 event.preventDefault();
//                 event.stopPropagation();
//             }
//             form.classList.add('was-validated');
//         }, false);
//     });
// }

// function initDatePicker() {
//     const dateInputs = document.querySelectorAll('input[type="date"]');
//     dateInputs.forEach(input => {
//         input.addEventListener('change', function() {
//             const selectedDate = new Date(this.value);
//             const today = new Date();
//             if (selectedDate < today) {
//                 alert('Por favor, seleccione una fecha futura.');
//                 this.value = '';
//             }
//         });
//     });
// }

// // Función para manejar el envío de mensajes
// function sendMessage(event) {
//     event.preventDefault();
//     const form = event.target;
//     const content = form.querySelector('textarea[name="content"]').value;
//     const receiverId = form.querySelector('input[name="receiverId"]').value;

//     fetch('/messages/send', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ content, receiverId }),
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             // Actualizar la interfaz de usuario con el nuevo mensaje
//             appendMessage(content, 'sent');
//             form.reset();
//         } else {
//             alert('Error al enviar el mensaje. Por favor, inténtelo de nuevo.');
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         alert('Ocurrió un error al enviar el mensaje. Por favor, inténtelo de nuevo.');
//     });
// }

// function appendMessage(content, type) {
//     const messagesContainer = document.getElementById('messages');
//     const messageDiv = document.createElement('div');
//     messageDiv.className = `message ${type}`;
//     messageDiv.innerHTML = `
//         <p>${content}</p>
//         <small>${new Date().toLocaleString()}</small>
//     `;
//     messagesContainer.appendChild(messageDiv);
//     messagesContainer.scrollTop = messagesContainer.scrollHeight;
// }

// // Event listener para el formulario de mensajes
// document.querySelector('form[action="/messages/send"]')?.addEventListener('submit', sendMessage);

// const menuToggle = document.getElementById('menu-toggle');
// const mainNav = document.getElementById('main-nav');

// if (menuToggle && mainNav) {
//   menuToggle.addEventListener('click', () => {
//     mainNav.classList.toggle('active');
//   });
// }

/**
 * VisionAssist - Main JavaScript
 * Handles client-side functionality and accessibility enhancements
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {

  // Initialize tooltips if Bootstrap is available
  if (typeof bootstrap !== 'undefined') {
    // Initialize tooltips
    if (bootstrap.Tooltip) {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
      });
    }

    // Initialize all dropdowns and mobile nav toggles
    const dropdownElementList = [].slice.call(document.querySelectorAll('.dropdown-toggle'));
    dropdownElementList.map(function (dropdownToggleEl) {
      return new bootstrap.Dropdown(dropdownToggleEl);
    });

    // Ensure mobile navbar toggle works
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
      navbarToggler.addEventListener('click', function() {
        const targetId = this.getAttribute('data-bs-target') || this.getAttribute('data-target');
        if (targetId) {
          const targetElement = document.querySelector(targetId);
          if (targetElement && bootstrap.Collapse) {
            const bsCollapse = new bootstrap.Collapse(targetElement, {
              toggle: true
            });
          }
        }
      });
    }
  }

  // Add skip to content functionality for accessibility
  const skipLink = document.createElement('a');
  skipLink.setAttribute('href', '#main-content');
  skipLink.setAttribute('class', 'skip-to-content');
  // skipLink.textContent = 'Saltar al contenido principal';
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add ID to main content for skip link
  const mainContent = document.querySelector('main');
  if (mainContent) {
    mainContent.setAttribute('id', 'main-content');
    mainContent.setAttribute('tabindex', '-1');
  }

  // Enhance form accessibility
  enhanceFormAccessibility();

  // Add animation classes as elements come into view
  initScrollAnimations();

  // Initialize high contrast mode toggle if it exists
  const contrastToggle = document.getElementById('contrast-toggle');
  if (contrastToggle) {
    contrastToggle.addEventListener('click', toggleHighContrast);
  }

  // Initialize font size controls if they exist
  const fontSizeIncrease = document.getElementById('font-size-increase');
  const fontSizeDecrease = document.getElementById('font-size-decrease');
  const fontSizeReset = document.getElementById('font-size-reset');

  if (fontSizeIncrease) fontSizeIncrease.addEventListener('click', () => adjustFontSize(1));
  if (fontSizeDecrease) fontSizeDecrease.addEventListener('click', () => adjustFontSize(-1));
  if (fontSizeReset) fontSizeReset.addEventListener('click', resetFontSize);

  // Check for previously set accessibility preferences
  loadAccessibilityPreferences();
});

/**
 * Enhances form accessibility
 */
function enhanceFormAccessibility() {
  // Add ARIA attributes to required form fields
  const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
  requiredFields.forEach(field => {
    field.setAttribute('aria-required', 'true');

    // Get the associated label
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label && !label.textContent.includes('*')) {
      label.innerHTML += ' <span class="text-danger">*</span>';
    }
  });

  // Enhance password visibility toggle if it exists
  const passwordToggles = document.querySelectorAll('.password-toggle');
  passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', function() {
      const passwordField = document.getElementById(this.getAttribute('data-target'));
      if (passwordField) {
        const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordField.setAttribute('type', type);

        // Update toggle icon
        const icon = this.querySelector('i');
        if (icon) {
          if (type === 'text') {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
            this.setAttribute('aria-label', 'Ocultar contraseña');
          } else {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
            this.setAttribute('aria-label', 'Mostrar contraseña');
          }
        }
      }
    });
  });
}

/**
 * Initializes scroll animations
 */
function initScrollAnimations() {
  const fadeElements = document.querySelectorAll('.fade-in-element');
  const slideElements = document.querySelectorAll('.slide-in-element');

  // Only initialize if IntersectionObserver is supported and elements exist
  if ('IntersectionObserver' in window && (fadeElements.length > 0 || slideElements.length > 0)) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    const slideObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-in-right');
          slideObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => fadeObserver.observe(el));
    slideElements.forEach(el => slideObserver.observe(el));
  }
}

/**
 * Toggles high contrast mode
 */
function toggleHighContrast() {
  document.body.classList.toggle('high-contrast');

  // Store preference
  const isHighContrast = document.body.classList.contains('high-contrast');
  localStorage.setItem('highContrast', isHighContrast);

  // Announce change to screen readers
  announceToScreenReader(isHighContrast ?
    'Modo de alto contraste activado' :
    'Modo de alto contraste desactivado'
  );
}

/**
 * Adjusts font size
 * @param {number} step - Amount to adjust (positive = increase, negative = decrease)
 */
function adjustFontSize(step) {
  const body = document.body;
  let currentSize = parseInt(window.getComputedStyle(body).fontSize);
  let newSize = currentSize + step;

  // Limit minimum and maximum font sizes
  if (newSize >= 12 && newSize <= 24) {
    body.style.fontSize = newSize + 'px';
    localStorage.setItem('fontSize', newSize);

    // Announce change to screen readers
    announceToScreenReader(`Tamaño de fuente cambiado a ${newSize} píxeles`);
  }
}

/**
 * Resets font size to default
 */
function resetFontSize() {
  document.body.style.fontSize = '';
  localStorage.removeItem('fontSize');

  // Announce change to screen readers
  announceToScreenReader('Tamaño de fuente restablecido');
}

/**
 * Loads user's accessibility preferences from localStorage
 */
function loadAccessibilityPreferences() {
  // Load high contrast setting
  const highContrast = localStorage.getItem('highContrast') === 'true';
  if (highContrast) {
    document.body.classList.add('high-contrast');
  }

  // Load font size setting
  const fontSize = localStorage.getItem('fontSize');
  if (fontSize) {
    document.body.style.fontSize = `${fontSize}px`;
  }
}

/**
 * Announces a message to screen readers
 * @param {string} message - The message to announce
 */
function announceToScreenReader(message) {
  let announcer = document.getElementById('sr-announcer');

  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'sr-announcer';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.classList.add('sr-only');
    document.body.appendChild(announcer);
  }

  announcer.textContent = message;
}