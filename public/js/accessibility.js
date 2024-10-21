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
    speechSynthesis.speak(utterance);
  }
  
  // Función para cambiar el idioma
  function changeLanguage(lang) {
    window.location.href = '/change-lang/' + lang;
  }
  
  // Event listeners
  document.getElementById('increase-text').addEventListener('click', () => changeTextSize(true));
  document.getElementById('decrease-text').addEventListener('click', () => changeTextSize(false));
  document.getElementById('toggle-contrast').addEventListener('click', toggleHighContrast);
  document.getElementById('speak-text').addEventListener('click', () => speakText(document.body.innerText));
  document.getElementById('change-language').addEventListener('change', (e) => changeLanguage(e.target.value));