class AccessibilityManager {
    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        this.currentZoomLevel = 1;
        this.setupVoiceRecognition();
        this.setupKeyboardListeners();
        this.initializeTextToSpeech();
    }

    // Inicializar reconocimiento de voz
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'es-ES';

            this.recognition.onresult = (event) => {
                const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
            };

            this.recognition.onerror = (event) => {
                console.error('Error en reconocimiento de voz:', event.error);
                this.speak('Se produjo un error en el reconocimiento de voz');
            };
        } else {
            console.error('El reconocimiento de voz no está soportado en este navegador');
        }
    }

    // Procesar comandos de voz
    processVoiceCommand(command) {
        if (command.includes('aumentar texto')) {
            this.zoomIn();
        } else if (command.includes('reducir texto')) {
            this.zoomOut();
        } else if (command.includes('leer página')) {
            this.readCurrentPage();
        } else if (command.includes('detener lectura')) {
            this.stopReading();
        } else if (command.includes('abrir chat')) {
            window.location.href = '/chat';
        }
        // Agregar más comandos según sea necesario
    }

    // Inicializar texto a voz
    initializeTextToSpeech() {
        if (!this.speechSynthesis) {
            console.error('La síntesis de voz no está soportada en este navegador');
            return;
        }

        // Cargar voces disponibles
        let voices = [];
        const loadVoices = () => {
            voices = this.speechSynthesis.getVoices();
            // Preferir voz en español
            this.defaultVoice = voices.find(voice => voice.lang.startsWith('es')) || voices[0];
        };

        this.speechSynthesis.onvoiceschanged = loadVoices;
        loadVoices();
    }

// Función para hablar texto
speak(text, options = {}) {
    if (!this.speechSynthesis) return;
  
    // Detener cualquier lectura en curso
    this.stopReading();
  
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.defaultVoice;
    utterance.rate = options.rate || 0.8; // Velocidad más lenta por defecto
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
  
    // Agregar pausas después de oraciones, enlaces, botones y encabezados
    utterance.text = text.replace(/([,.!?;:])\s*/g, '$1 ').replace(/(<a [^>]+>[^<]+<\/a>)/g, '$1. ').replace(/(<button [^>]+>[^<]+<\/button>)/g, '$1. ').replace(/(<h[1-6]>[^<]+<\/h[1-6]>)/g, '$1. ');
  
    this.speechSynthesis.speak(utterance);
  }

    // Detener lectura
    stopReading() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
    }

    // Aumentar zoom
    zoomIn() {
        if (this.currentZoomLevel < 3) {
            this.currentZoomLevel += 0.1;
            document.body.style.zoom = this.currentZoomLevel;
            this.speak(`Zoom aumentado a ${Math.round(this.currentZoomLevel * 100)}%`);
        }
    }

    // Reducir zoom
    zoomOut() {
        if (this.currentZoomLevel > 0.5) {
            this.currentZoomLevel -= 0.1;
            document.body.style.zoom = this.currentZoomLevel;
            this.speak(`Zoom reducido a ${Math.round(this.currentZoomLevel * 100)}%`);
        }
    }

    // Leer página actual
    readCurrentPage() {
        const mainContent = document.querySelector('main') || document.body;
        const textToRead = this.extractText(mainContent);
        this.speak(textToRead);
    }

    // Extraer texto de un elemento
    extractText(element) {
        if (element.nodeType === Node.TEXT_NODE) {
            return element.textContent.trim();
        }

        if (element.nodeType !== Node.ELEMENT_NODE) {
            return '';
        }

        const tagName = element.tagName.toLowerCase();
        if (tagName === 'script' || tagName === 'style') {
            return '';
        }

        let text = '';
        for (const child of element.childNodes) {
            text += this.extractText(child) + ' ';
        }

        // Agregar contexto según el tipo de elemento
        if (tagName === 'h1') text = 'Encabezado principal: ' + text;
        if (tagName === 'h2') text = 'Encabezado secundario: ' + text;
        if (tagName === 'a') text = 'Enlace a ' + text;
        if (tagName === 'button') text = 'Botón ' + text;
        if (tagName === 'img' && element.alt) text = 'Imagen: ' + element.alt;

        return text.trim();
    }

    // Configurar listeners de teclado
    setupKeyboardListeners() {
        document.addEventListener('keydown', (event) => {
            // Alt + A: Activar/desactivar asistente de voz
            if (event.altKey && event.key === 'a') {
                this.toggleVoiceAssistant();
            }
            
            // Alt + L: Leer página
            if (event.altKey && event.key === 'l') {
                this.readCurrentPage();
            }

            // Alt + +: Aumentar zoom
            if (event.altKey && event.key === '+') {
                this.zoomIn();
            }

            // Alt + -: Reducir zoom
            if (event.altKey && event.key === '-') {
                this.zoomOut();
            }
        });
    }

    // Activar/desactivar asistente de voz
    toggleVoiceAssistant() {
        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            this.speak('Asistente de voz desactivado');
        } else {
            this.recognition.start();
            this.isListening = true;
            this.speak('Asistente de voz activado');
        }
    }
}