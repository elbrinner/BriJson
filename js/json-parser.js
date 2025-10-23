/**
 * BriJson - Parser y Validador JSON
 * Manejo eficiente del parsing y validación de JSON con optimizaciones para archivos grandes
 */

class JsonParser {
    worker = null;

    constructor() {
        this.initWorker();
    }

    /**
     * Inicializa el Web Worker para parsing en background
     */
    initWorker() {
        if (globalThis.Worker) {
            try {
                // Crear worker inline para parsing JSON
                const workerCode = `
                    self.onmessage = function(e) {
                        const { action, data } = e.data;

                        try {
                            switch (action) {
                                case 'validate': {
                                    JSON.parse(data);
                                    self.postMessage({ success: true, valid: true });
                                    break;
                                }

                                case 'stringify':
                                    const stringified = JSON.stringify(data, null, e.data.indent || 2);
                                    self.postMessage({ success: true, result: stringified });
                                    break;

                                case 'parse': {
                                    const parsedForParse = JSON.parse(data);
                                    self.postMessage({ success: true, result: parsedForParse });
                                    break;
                                }

                                case 'minify': {
                                    const parsedForMinify = JSON.parse(data);
                                    const minified = JSON.stringify(parsedForMinify);
                                    self.postMessage({ success: true, result: minified });
                                    break;
                                }

                                default:
                                    self.postMessage({ success: false, error: 'Acción no reconocida' });
                            }
                        } catch (error) {
                            self.postMessage({ success: false, error: error.message });
                        }
                    };
                `;

                const blob = new Blob([workerCode], { type: 'application/javascript' });
                this.worker = new Worker(URL.createObjectURL(blob));
            } catch (error) {
                console.warn('Web Worker no disponible, usando parsing síncrono:', error);
            }
        }
    }

    /**
     * Parsea JSON de forma asíncrona con Web Worker
     * @param {string} jsonString - String JSON a parsear
     * @returns {Promise<Object>} - Objeto parseado
     */
    async parseAsync(jsonString) {
        return new Promise((resolve, reject) => {
            if (this.worker) {
                this.worker.postMessage({ action: 'parse', data: jsonString });

                this.worker.onmessage = (e) => {
                    if (e.data.success) {
                        resolve(e.data.result);
                    } else {
                        reject(new Error(e.data.error));
                    }
                };

                this.worker.onerror = (error) => {
                    reject(new Error('Error en Web Worker: ' + error.message));
                };
            } else {
                // Fallback síncrono
                try {
                    const result = JSON.parse(jsonString);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    /**
     * Parsea JSON de forma síncrona (para casos donde se necesita respuesta inmediata)
     * @param {string} jsonString - String JSON a parsear
     * @returns {Object} - Objeto parseado
     */
    parseSync(jsonString) {
        return JSON.parse(jsonString);
    }

    /**
     * Valida JSON de forma asíncrona
     * @param {string} jsonString - String JSON a validar
     * @returns {Promise<boolean>} - True si es válido
     */
    async validateAsync(jsonString) {
        return new Promise((resolve, reject) => {
            if (this.worker) {
                this.worker.postMessage({ action: 'validate', data: jsonString });

                this.worker.onmessage = (e) => {
                    if (e.data.success) {
                        resolve(e.data.valid);
                    } else {
                        reject(new Error(e.data.error));
                    }
                };
            } else {
                // Fallback síncrono
                try {
                    JSON.parse(jsonString);
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    /**
     * Formatea JSON con indentación
     * @param {Object} obj - Objeto a formatear
     * @param {number} indent - Número de espacios de indentación
     * @returns {Promise<string>} - JSON formateado
     */
    async stringifyAsync(obj, indent = 2) {
        return new Promise((resolve, reject) => {
            if (this.worker) {
                this.worker.postMessage({ action: 'stringify', data: obj, indent });

                this.worker.onmessage = (e) => {
                    if (e.data.success) {
                        resolve(e.data.result);
                    } else {
                        reject(new Error(e.data.error));
                    }
                };
            } else {
                // Fallback síncrono
                try {
                    const result = JSON.stringify(obj, null, indent);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    /**
     * Minifica JSON
     * @param {string} jsonString - JSON a minificar
     * @returns {Promise<string>} - JSON minificado
     */
    async minifyAsync(jsonString) {
        return new Promise((resolve, reject) => {
            if (this.worker) {
                this.worker.postMessage({ action: 'minify', data: jsonString });

                this.worker.onmessage = (e) => {
                    if (e.data.success) {
                        resolve(e.data.result);
                    } else {
                        reject(new Error(e.data.error));
                    }
                };
            } else {
                // Fallback síncrono
                try {
                    const parsed = JSON.parse(jsonString);
                    const result = JSON.stringify(parsed);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            }
        });
    }

    /**
     * Obtiene estadísticas del JSON
     * @param {Object} obj - Objeto JSON
     * @returns {Object} - Estadísticas
     */
    getStats(obj) {
        const stats = {
            size: Utils.getJsonSize(obj),
            lines: 0,
            keys: 0,
            arrays: 0,
            objects: 0,
            primitives: 0,
            maxDepth: 0
        };

        this._analyzeObject(obj, stats);

        // Contar líneas aproximadas
        const jsonString = JSON.stringify(obj, null, 2);
        stats.lines = jsonString.split('\n').length;

        return stats;
    }

    /**
     * Analiza un objeto recursivamente para estadísticas
     * @private
     */
    _analyzeObject(obj, stats, depth = 0) {
        stats.maxDepth = Math.max(stats.maxDepth, depth);

        if (Array.isArray(obj)) {
            this._analyzeArray(obj, stats, depth);
        } else if (typeof obj === 'object' && obj !== null) {
            this._analyzeObjectProps(obj, stats, depth);
        }
    }

    /**
     * Analiza un array para estadísticas
     * @private
     */
    _analyzeArray(arr, stats, depth) {
        stats.arrays++;
        for (const item of arr) {
            if (typeof item === 'object' && item !== null) {
                this._analyzeObject(item, stats, depth + 1);
            } else {
                stats.primitives++;
            }
        }
    }

    /**
     * Analiza propiedades de un objeto para estadísticas
     * @private
     */
    _analyzeObjectProps(obj, stats, depth) {
        stats.objects++;
        stats.keys += Object.keys(obj).length;
        for (const value of Object.values(obj)) {
            if (typeof value === 'object' && value !== null) {
                this._analyzeObject(value, stats, depth + 1);
            } else {
                stats.primitives++;
            }
        }
    }

    /**
     * Busca en el JSON de forma eficiente
     * @param {Object} obj - Objeto JSON
     * @param {string} query - Término de búsqueda
     * @param {boolean} caseSensitive - Búsqueda case sensitive
     * @returns {Array} - Resultados de la búsqueda
     */
    search(obj, query, caseSensitive = false) {
        const results = [];
        const searchTerm = caseSensitive ? query : query.toLowerCase();

        this._searchInObject(obj, searchTerm, caseSensitive, results);
        return results;
    }

    /**
     * Función auxiliar para búsqueda recursiva
     * @private
     */
    _searchInObject(obj, searchTerm, caseSensitive, results, path = '') {
        if (Array.isArray(obj)) {
            this._searchInArray(obj, searchTerm, caseSensitive, results, path);
        } else if (typeof obj === 'object' && obj !== null) {
            this._searchInObjectProps(obj, searchTerm, caseSensitive, results, path);
        }
    }

    /**
     * Busca en arrays
     * @private
     */
    _searchInArray(arr, searchTerm, caseSensitive, results, path) {
        for (const [index, item] of arr.entries()) {
            const currentPath = path ? `${path}[${index}]` : `[${index}]`;

            if (typeof item === 'string') {
                const value = caseSensitive ? item : item.toLowerCase();
                if (value.includes(searchTerm)) {
                    results.push({
                        path: currentPath,
                        value: item,
                        type: 'string'
                    });
                }
            } else if (typeof item === 'object' && item !== null) {
                this._searchInObject(item, searchTerm, caseSensitive, results, currentPath);
            }
        }
    }

    /**
     * Busca en propiedades de objetos
     * @private
     */
    _searchInObjectProps(obj, searchTerm, caseSensitive, results, path) {
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;

            // Buscar en el nombre de la clave
            if (this._matchesSearch(key, searchTerm, caseSensitive)) {
                results.push({
                    path: currentPath,
                    key: key,
                    type: 'key'
                });
            }

            // Buscar en el valor
            if (typeof value === 'string') {
                if (this._matchesSearch(value, searchTerm, caseSensitive)) {
                    results.push({
                        path: currentPath,
                        value: value,
                        type: 'string'
                    });
                }
            } else if (typeof value === 'object' && value !== null) {
                this._searchInObject(value, searchTerm, caseSensitive, results, currentPath);
            }
        }
    }

    /**
     * Verifica si un texto coincide con el término de búsqueda
     * @private
     */
    _matchesSearch(text, searchTerm, caseSensitive) {
        const processedText = caseSensitive ? text : text.toLowerCase();
        return processedText.includes(searchTerm);
    }

    /**
     * Limpia recursos del worker
     */
    destroy() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

// Exportar para uso en módulos
globalThis.JsonParser = JsonParser;