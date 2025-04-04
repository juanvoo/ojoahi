// Función para cambiar el tamaño del texto
function changeTextSize(increase) {
    const body = document.body;
    const currentSize = parseFloat(window.getComputedStyle(body, null).getPropertyValue('font-size'));
    const newSize = increase ? currentSize * 1.1 : currentSize * 0.9;
    body.style.fontSize = newSize + 'px';
  }
  
  // Función para cambiar el contraste
  function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
  }
  
 // Función para leer el texto en voz alta
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.8; // Velocidad más lenta

  // Agregar pausas después de oraciones, enlaces, botones y encabezados
  utterance.text = text.replace(/([,.!?;:])\s*/g, '$1 ').replace(/(<a [^>]+>[^<]+<\/a>)/g, '$1. ').replace(/(<button [^>]+>[^<]+<\/button>)/g, '$1. ').replace(/(<h[1-6]>[^<]+<\/h[1-6]>)/g, '$1. ');
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}
  
  // Función para cambiar el idioma
  function changeLanguage(lang) {
    window.location.href = '/change-lang/' + lang;
  }

  // Función para anunciar la vista actual
function announceCurrentView() {
  const path = window.location.pathname;
  let viewName = '';

  if (path === '/') {
    viewName = 'Inicio';
  } else if (path.includes('/register')) {
    viewName = 'Registro';
  } else if (path.includes('/login')) {
    viewName = 'Iniciar Sesión';
  } else if (path.includes('/dashboard')) {
    viewName = 'Dashboard';
  } else {
    viewName = 'Desconocida';
  }

  speakText(`Actualmente te encuentras en la vista de ${viewName}`);
}
  
  // Event listeners
  document.getElementById('speak-text').addEventListener('click', () => speakText(document.body.innerText));
  document.getElementById('increase-text').addEventListener('click', () => changeTextSize(true));
  document.getElementById('decrease-text').addEventListener('click', () => changeTextSize(false));
  document.getElementById('toggle-contrast').addEventListener('click', toggleHighContrast);
  document.getElementById('change-language').addEventListener('change', (e) => changeLanguage(e.target.value));

  // Anunciar la vista actual al cargar la página
  window.addEventListener('load', announceCurrentView);