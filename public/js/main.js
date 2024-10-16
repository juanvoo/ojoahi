document.addEventListener('DOMContentLoaded', (event) => {
    const toggleContrastBtn = document.getElementById('toggle-contrast');
    const increaseFontBtn = document.getElementById('increase-font');
    const decreaseFontBtn = document.getElementById('decrease-font');

    // Alternar alto contraste
    toggleContrastBtn.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
    });

    // Aumentar tamaño de texto
    increaseFontBtn.addEventListener('click', () => {
        if (document.body.classList.contains('large-text')) {
            document.body.classList.remove('large-text');
            document.body.classList.add('extra-large-text');
        } else if (!document.body.classList.contains('extra-large-text')) {
            document.body.classList.add('large-text');
        }
    });

    // Disminuir tamaño de texto
    decreaseFontBtn.addEventListener('click', () => {
        if (document.body.classList.contains('extra-large-text')) {
            document.body.classList.remove('extra-large-text');
            document.body.classList.add('large-text');
        } else if (document.body.classList.contains('large-text')) {
            document.body.classList.remove('large-text');
        }
    });

    // Función para leer el texto en voz alta
    function speak(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    }

    // Agregar funcionalidad de lectura a elementos importantes
    document.querySelectorAll('h1, h2, p, li, a').forEach(element => {
        element.addEventListener('focus', () => {
            speak(element.textContent);
        });
    });
});