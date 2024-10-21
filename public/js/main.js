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

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    initTooltips();

    // Add smooth scrolling to all links
    addSmoothScrolling();

    // Initialize form validation
    initFormValidation();

    // Initialize reservation date picker
    initDatePicker();
});

function initTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseover', showTooltip);
        tooltip.addEventListener('mouseout', hideTooltip);
    });
}

function showTooltip(event) {
    const tooltipText = event.target.getAttribute('data-tooltip');
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip';
    tooltipEl.textContent = tooltipText;
    document.body.appendChild(tooltipEl);

    const rect = event.target.getBoundingClientRect();
    tooltipEl.style.top = `${rect.bottom + window.scrollY + 5}px`;
    tooltipEl.style.left = `${rect.left + window.scrollX}px`;
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

function addSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
}

function initFormValidation() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        }, false);
    });
}

function initDatePicker() {
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const today = new Date();
            if (selectedDate < today) {
                alert('Por favor, seleccione una fecha futura.');
                this.value = '';
            }
        });
    });
}

// Función para manejar el envío de mensajes
function sendMessage(event) {
    event.preventDefault();
    const form = event.target;
    const content = form.querySelector('textarea[name="content"]').value;
    const receiverId = form.querySelector('input[name="receiverId"]').value;

    fetch('/messages/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content, receiverId }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Actualizar la interfaz de usuario con el nuevo mensaje
            appendMessage(content, 'sent');
            form.reset();
        } else {
            alert('Error al enviar el mensaje. Por favor, inténtelo de nuevo.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al enviar el mensaje. Por favor, inténtelo de nuevo.');
    });
}

function appendMessage(content, type) {
    const messagesContainer = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <p>${content}</p>
        <small>${new Date().toLocaleString()}</small>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event listener para el formulario de mensajes
document.querySelector('form[action="/messages/send"]')?.addEventListener('submit', sendMessage);

const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
  });
}