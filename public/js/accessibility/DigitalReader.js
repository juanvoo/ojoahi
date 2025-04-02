class DigitalReader {
    constructor(accessibilityManager) {
        this.accessibilityManager = accessibilityManager;
        this.isAnalyzing = false;
        this.setupCamera();
    }

    async setupCamera() {
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('muted', '');

        // Cargar el modelo de TensorFlow.js para detección de objetos
        this.model = await cocoSsd.load();
    }

    async startObjectDetection() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            this.videoElement.srcObject = stream;
            this.isAnalyzing = true;
            this.analyzeFrame();
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            this.accessibilityManager.speak('No se pudo acceder a la cámara');
        }
    }

    async analyzeFrame() {
        if (!this.isAnalyzing) return;

        const predictions = await this.model.detect(this.videoElement);
        let description = 'Objetos detectados: ';
        
        if (predictions.length === 0) {
            description = 'No se detectaron objetos';
        } else {
            description += predictions
                .map(pred => `${pred.class} con ${Math.round(pred.score * 100)}% de confianza`)
                .join(', ');
        }

        this.accessibilityManager.speak(description);

        // Continuar analizando frames
        requestAnimationFrame(() => this.analyzeFrame());
    }

    stopObjectDetection() {
        this.isAnalyzing = false;
        if (this.videoElement.srcObject) {
            this.videoElement.srcObject.getTracks().forEach(track => track.stop());
        }
    }
}