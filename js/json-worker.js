// Web Worker para procesamiento de JSON en segundo plano
// Este worker maneja el parsing, stringifying y estadísticas de JSON
// para evitar bloquear la interfaz de usuario con archivos grandes

class JsonWorker {
    worker = null;

    constructor() {
        this.init();
    }

    init() {
        // Crear el código del worker como string
        const workerCode = `
            // Función para calcular estadísticas recursivamente
            function calculateStats(obj, path, stats) {
                if (path === undefined) path = '';
                if (stats === undefined) stats = { total: 0, objects: 0, arrays: 0, strings: 0, numbers: 0, booleans: 0, nulls: 0, depth: 0 };

                stats.total++;

                if (Array.isArray(obj)) {
                    stats.arrays++;
                    const currentDepth = path.split('.').length;
                    stats.depth = Math.max(stats.depth, currentDepth);

                    for (let i = 0; i < obj.length; i++) {
                        calculateStats(obj[i], path + '[' + i + ']', stats);
                    }
                } else if (obj !== null && typeof obj === 'object') {
                    stats.objects++;
                    const currentDepth = path.split('.').length;
                    stats.depth = Math.max(stats.depth, currentDepth);

                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            calculateStats(obj[key], path ? path + '.' + key : key, stats);
                        }
                    }
                } else {
                    switch (typeof obj) {
                        case 'string':
                            stats.strings++;
                            break;
                        case 'number':
                            stats.numbers++;
                            break;
                        case 'boolean':
                            stats.booleans++;
                            break;
                        case 'object':
                            if (obj === null) {
                                stats.nulls++;
                            }
                            break;
                    }
                }

                return stats;
            }

            // Función para buscar en el JSON
            function searchInJson(obj, searchTerm, path, results) {
                if (path === undefined) path = '';
                if (results === undefined) results = [];

                if (Array.isArray(obj)) {
                    for (let i = 0; i < obj.length; i++) {
                        searchInJson(obj[i], searchTerm, path + '[' + i + ']', results);
                    }
                } else if (obj !== null && typeof obj === 'object') {
                    for (const key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            // Buscar en la clave
                            if (key.toLowerCase().includes(searchTerm.toLowerCase())) {
                                results.push({
                                    path: path ? path + '.' + key : key,
                                    key: key,
                                    value: obj[key],
                                    type: 'key'
                                });
                            }
                            searchInJson(obj[key], searchTerm, path ? path + '.' + key : key, results);
                        }
                    }
                } else {
                    // Buscar en el valor
                    const valueStr = String(obj).toLowerCase();
                    if (valueStr.includes(searchTerm.toLowerCase())) {
                        results.push({
                            path: path,
                            key: path.split('.').pop(),
                            value: obj,
                            type: 'value'
                        });
                    }
                }

                return results;
            }

            // Manejar mensajes del hilo principal
            self.onmessage = function(e) {
                const messageData = e.data;
                const action = messageData.action;
                const data = messageData.data;

                try {
                    switch (action) {
                        case 'parse':
                            const parsedJson = JSON.parse(data);
                            const jsonStats = calculateStats(parsedJson);
                            self.postMessage({
                                success: true,
                                action: 'parse',
                                data: parsedJson,
                                stats: jsonStats
                            });
                            break;

                        case 'stringify':
                            const stringified = JSON.stringify(data, null, 2);
                            self.postMessage({
                                success: true,
                                action: 'stringify',
                                data: stringified
                            });
                            break;

                        case 'search':
                            const searchData = data;
                            const json = searchData.json;
                            const searchTerm = searchData.searchTerm;
                            const searchResults = searchInJson(json, searchTerm);
                            self.postMessage({
                                success: true,
                                action: 'search',
                                data: searchResults
                            });
                            break;

                        case 'stats':
                            const statsOnly = calculateStats(data);
                            self.postMessage({
                                success: true,
                                action: 'stats',
                                data: statsOnly
                            });
                            break;

                        default:
                            throw new Error('Acción no soportada: ' + action);
                    }
                } catch (error) {
                    self.postMessage({
                        success: false,
                        action: action,
                        error: error.message
                    });
                }
            };
        `;

        // Crear el blob y el worker
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        this.worker = new Worker(URL.createObjectURL(blob));
    }

    // Enviar mensaje al worker
    postMessage(message) {
        if (this.worker) {
            this.worker.postMessage(message);
        }
    }

    // Establecer manejador de mensajes
    onMessage(callback) {
        if (this.worker) {
            this.worker.onmessage = callback;
        }
    }

    // Establecer manejador de errores
    onError(callback) {
        if (this.worker) {
            this.worker.onerror = callback;
        }
    }

    // Terminar el worker
    terminate() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}

// Exportar para uso en el módulo principal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JsonWorker;
} else if (globalThis.window !== undefined) {
    globalThis.JsonWorker = JsonWorker;
}