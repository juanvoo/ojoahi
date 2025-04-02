class PasswordVerbalizer {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.isEnabled = false;
        this.setupPasswordFields();
    }

    setupPasswordFields() {
        document.addEventListener('input', (event) => {
            if (event.target.type === 'password' && this.isEnabled) {
                const lastChar = event.target.value.slice(-1);
                if (lastChar) {
                    this.verbalizeLetter(lastChar);
                }
            }
        });
    }

    verbalizeLetter(char) {
        // Usar nombres especiales para caracteres especiales
        const specialChars = {
            '@': 'arroba',
            '.': 'punto',
            '_': 'guión bajo',
            '-': 'guión',
            '#': 'numeral',
            '$': 'dólar',
            '%': 'porcentaje',
            '&': 'ampersand',
            '*': 'asterisco'
        };

        const textToSpeak = specialChars[char] || char;
        this.accessibilityManager.speak(textToSpeak, { volume: 0.5 }); // Volumen bajo por seguridad
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        const message = this.isEnabled 
            ? 'Verbalización de contraseñas activada. Advertencia: esto puede comprometer su seguridad.' 
            : 'Verbalización de contraseñas desactivada';
        this.accessibilityManager.speak(message);
    }
}