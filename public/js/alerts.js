class AlertManager {
    constructor() {
      this.container = this.createContainer();
      document.body.appendChild(this.container);
    }
  
    createContainer() {
      const container = document.createElement('div');
      container.className = 'alerts-container';
      container.innerHTML = '<div class="alert-stack"></div>';
      return container;
    }
  
    show(options) {
      const {
        type = 'info',
        title,
        message,
        duration = 5000,
        closeable = true
      } = options;
  
      const alert = document.createElement('div');
      alert.className = `custom-alert custom-alert-${type}`;
  
      // Definir el icono según el tipo
      let icon;
      switch (type) {
        case 'success':
          icon = 'check-circle';
          break;
        case 'danger':
          icon = 'exclamation-circle';
          break;
        case 'warning':
          icon = 'exclamation-triangle';
          break;
        case 'info':
        default:
          icon = 'info-circle';
      }
  
      alert.innerHTML = `
        <div class="custom-alert-icon">
          <i class="fas fa-${icon}"></i>
        </div>
        <div class="custom-alert-content">
          ${title ? `<div class="custom-alert-title">${title}</div>` : ''}
          <p class="custom-alert-message">${message}</p>
        </div>
        ${closeable ? `
          <button type="button" class="custom-alert-close" aria-label="Cerrar">
            <i class="fas fa-times"></i>
          </button>
        ` : ''}
      `;
  
      const stack = this.container.querySelector('.alert-stack');
      stack.appendChild(alert);
  
      // Manejar el botón de cierre
      if (closeable) {
        const closeBtn = alert.querySelector('.custom-alert-close');
        closeBtn.addEventListener('click', () => this.close(alert));
      }
  
      // Auto cerrar después del tiempo especificado
      if (duration) {
        setTimeout(() => this.close(alert), duration);
      }
  
      return alert;
    }
  
    close(alert) {
      alert.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        alert.remove();
      }, 300);
    }
  
    success(message, title = '') {
      return this.show({ type: 'success', title, message });
    }
  
    error(message, title = '') {
      return this.show({ type: 'danger', title, message });
    }
  
    warning(message, title = '') {
      return this.show({ type: 'warning', title, message });
    }
  
    info(message, title = '') {
      return this.show({ type: 'info', title, message });
    }
  }
  
  // Crear una instancia global
  window.alertManager = new AlertManager();