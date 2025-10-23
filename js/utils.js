/**
 * BriJson - Utilidades Generales
 * Funciones de utilidad compartidas por toda la aplicación
 */

class Utils {
    /**
     * Debounce function para optimizar eventos
     * @param {Function} func - Función a debounced
     * @param {number} wait - Tiempo de espera en ms
     * @returns {Function} Función debounced
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle function para limitar la frecuencia de ejecución
     * @param {Function} func - Función a throttled
     * @param {number} limit - Límite de tiempo en ms
     * @returns {Function} Función throttled
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    /**
     * Copia texto al portapapeles de forma segura
     * @param {string} text - Texto a copiar
     * @returns {Promise<boolean>} - True si se copió correctamente
     */
    static async copyToClipboard(text) {
        try {
            // Intentar usar la API moderna del portapapeles
        if (navigator.clipboard && globalThis.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback para navegadores antiguos
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const success = document.execCommand('copy');
                textArea.remove();
                return success;
            }
        } catch (err) {
            console.error('Error al copiar al portapapeles:', err);
            return false;
        }
    }

    /**
     * Formatea bytes a unidades legibles
     * @param {number} bytes - Número de bytes
     * @returns {string} - Tamaño formateado
     */
    static formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Obtiene el tipo de dato de un valor
     * @param {*} value - Valor a evaluar
     * @returns {string} - Tipo de dato
     */
    static getType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'object') return 'object';
        return typeof value;
    }

    /**
     * Valida si un string es JSON válido
     * @param {string} str - String a validar
     * @returns {boolean} - True si es JSON válido
     */
    static isValidJson(str) {
        try {
            JSON.parse(str);
            return true;
        } catch (error) {
            console.warn('Error al copiar al portapapeles:', error);
            return false;
        }
    }

    /**
     * Escapa caracteres HTML
     * @param {string} text - Texto a escapar
     * @returns {string} - Texto escapado
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Genera un ID único
     * @returns {string} - ID único
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2);
    }

    /**
     * Obtiene el tamaño de un objeto JSON en bytes
     * @param {*} obj - Objeto a medir
     * @returns {number} - Tamaño en bytes
     */
    static getJsonSize(obj) {
        return new Blob([JSON.stringify(obj)]).size;
    }

    /**
     * Cuenta elementos en un objeto JSON recursivamente
     * @param {*} obj - Objeto a contar
     * @returns {Object} - Estadísticas del objeto
     */
    static countElements(obj) {
        let stats = { keys: 0, arrays: 0, objects: 0, primitives: 0 };

        function count(obj) {
            if (Array.isArray(obj)) {
                stats.arrays++;
                for (const item of obj) {
                    if (typeof item === 'object' && item !== null) {
                        count(item);
                    } else {
                        stats.primitives++;
                    }
                }
                stats.objects++;
                stats.keys += Object.keys(obj).length;
                for (const value of Object.values(obj)) {
                    if (typeof value === 'object' && value !== null) {
                        count(value);
                    } else {
                        stats.primitives++;
                    }
                }
            }
        }

        count(obj);
        return stats;
    }

    /**
     * Formatea números con separadores de miles
     * @param {number} num - Número a formatear
     * @returns {string} - Número formateado
     */
    static formatNumber(num) {
        return num.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Crea un elemento DOM con atributos y contenido
     * @param {string} tag - Nombre del tag
     * @param {Object} attrs - Atributos del elemento
     * @param {string|Node} content - Contenido del elemento
     * @returns {HTMLElement} - Elemento creado
     */
    static createElement(tag, attrs = {}, content = '') {
        const element = document.createElement(tag);

        for (const key of Object.keys(attrs)) {
            if (key === 'className') {
                element.className = attrs[key];
            } else if (key === 'style' && typeof attrs[key] === 'object') {
                Object.assign(element.style, attrs[key]);
            } else {
                element.setAttribute(key, attrs[key]);
            }
        }

        if (typeof content === 'string') {
            element.innerHTML = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        }

        return element;
    }

    /**
     * Muestra una notificación temporal
     * @param {string} message - Mensaje a mostrar
     * @param {string} type - Tipo de notificación (success, error, warning, info)
     * @param {number} duration - Duración en ms
     */
    static showNotification(message, type = 'info', duration = 3000) {
        let bgColor;
        if (type === 'success') {
            bgColor = 'bg-green-500';
        } else if (type === 'error') {
            bgColor = 'bg-red-500';
        } else if (type === 'warning') {
            bgColor = 'bg-yellow-500';
        } else {
            bgColor = 'bg-blue-500';
        }

        let iconClass;
        if (type === 'success') {
            iconClass = 'fa-check-circle';
        } else if (type === 'error') {
            iconClass = 'fa-exclamation-circle';
        } else if (type === 'warning') {
            iconClass = 'fa-exclamation-triangle';
        } else {
            iconClass = 'fa-info-circle';
        }

        const notification = this.createElement('div', {
            className: `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white \${bgColor}`
        }, `
            <div class="flex items-center gap-2">
                <i class="fas \${iconClass}"></i>
                <span>\${message}</span>
            </div>
        `);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
}

// Exportar para uso en módulos
globalThis.Utils = Utils;