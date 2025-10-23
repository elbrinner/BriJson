/**
 * TreeRenderer - Módulo para renderizar el árbol JSON con virtual scrolling
 * Optimizado para manejar archivos JSON muy grandes (100k+ líneas)
 */
class TreeRenderer {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            maxVisibleNodes: 100,
            nodeHeight: 24,
            indentSize: 20,
            ...options
        };

        this.treeData = null;
        this.expandedNodes = new Set();
        this.visibleNodes = [];
        this.scrollTop = 0;
        this.totalHeight = 0;

        this._init();
    }

    /**
     * Inicializa el renderer
     * @private
     */
    _init() {
        this.container.innerHTML = '';
        this.container.className = 'json-tree-container';

        // Crear contenedor de nodos (sin virtual scrolling por ahora)
        this.nodesContainer = Utils.createElement('div', {
            className: 'json-tree-nodes'
        });

        this.container.appendChild(this.nodesContainer);

        // Configurar eventos
        this._setupEventListeners();
    }

    /**
     * Configura los event listeners
     * @private
     */
    _setupEventListeners() {
        // Delegación de eventos para nodos con clic izquierdo
        this.nodesContainer.addEventListener('click', (e) => {
            const nodeElement = e.target.closest('.json-node');
            if (!nodeElement) return;

            const nodeId = nodeElement.dataset.nodeId;
            if (e.target.classList.contains('toggle-icon') || e.target.closest('.toggle-icon')) {
                this._toggleNode(nodeId);
            }
        });

        // Clic derecho para menú contextual
        this.nodesContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const nodeElement = e.target.closest('.json-node');
            if (nodeElement) {
                const nodeId = nodeElement.dataset.nodeId;
                this._onNodeClick(nodeId, e);
            }
        });

        // Doble click para expandir/colapsar
        this.nodesContainer.addEventListener('dblclick', (e) => {
            const nodeElement = e.target.closest('.json-node');
            if (nodeElement) {
                const nodeId = nodeElement.dataset.nodeId;
                this._toggleNode(nodeId);
            }
        });
    }

    /**
     * Renderiza el árbol JSON
     * @param {Object} data - Datos JSON a renderizar
     */
    render(data) {
        this.treeData = data;
        this.expandedNodes.clear();
        this.visibleNodes = [];

        // Construir estructura plana del árbol
        this._buildFlatTree(data);

        // Renderizar todos los nodos (sin virtual scrolling)
        this._renderAllNodes();
    }

    /**
     * Construye la estructura plana del árbol
     * @private
     */
    _buildFlatTree(obj, path = '', depth = 0) {
        if (Array.isArray(obj)) {
            this._buildArrayTree(obj, path, depth);
        } else if (typeof obj === 'object' && obj !== null) {
            this._buildObjectTree(obj, path, depth);
        } else {
            this._buildPrimitiveTree(obj, path, depth);
        }
    }

    /**
     * Renderiza todos los nodos del árbol
     * @private
     */
    _renderAllNodes() {
        this.nodesContainer.innerHTML = '';

        for (const node of this.visibleNodes) {
            const nodeElement = this._createNodeElement(node);
            this.nodesContainer.appendChild(nodeElement);
        }
    }

    /**
     * Construye árbol para arrays
     * @private
     */
    _buildArrayTree(arr, path, depth) {
        const nodeId = path || 'root';
        const isExpanded = this.expandedNodes.has(nodeId);

        this.visibleNodes.push({
            id: nodeId,
            type: 'array',
            path: path,
            depth: depth,
            length: arr.length,
            isExpanded: isExpanded,
            isExpandable: arr.length > 0
        });

        if (isExpanded) {
            for (const [index, item] of arr.entries()) {
                const itemPath = path ? `${path}[${index}]` : `[${index}]`;
                
                // Si el elemento es un objeto o array, agregamos un nodo de índice primero
                if (item !== null && typeof item === 'object') {
                    this.visibleNodes.push({
                        id: `${nodeId}.index.${index}`,
                        type: 'array-item',
                        path: itemPath,
                        depth: depth + 1,
                        index: index,
                        value: item,
                        valueType: Array.isArray(item) ? 'array' : 'object'
                    });
                    this._buildFlatTree(item, itemPath, depth + 2);
                } else {
                    // Para primitivos, mostrarlos directamente
                    this.visibleNodes.push({
                        id: `${nodeId}.index.${index}`,
                        type: 'array-item',
                        path: itemPath,
                        depth: depth + 1,
                        index: index,
                        value: item,
                        valueType: typeof item
                    });
                }
            }
        }
    }

    /**
     * Construye árbol para objetos
     * @private
     */
    _buildObjectTree(obj, path, depth) {
        const nodeId = path || 'root';
        const isExpanded = this.expandedNodes.has(nodeId);
        const keys = Object.keys(obj);

        this.visibleNodes.push({
            id: nodeId,
            type: 'object',
            path: path,
            depth: depth,
            keys: keys,
            isExpanded: isExpanded,
            isExpandable: keys.length > 0
        });

        if (isExpanded) {
            for (const key of keys) {
                const value = obj[key];
                const valuePath = path ? `${path}.${key}` : key;

                // Agregar nodo de propiedad
                this.visibleNodes.push({
                    id: `${nodeId}.prop.${key}`,
                    type: 'property',
                    path: valuePath,
                    depth: depth + 1,
                    key: key,
                    value: value,
                    valueType: typeof value
                });

                // Si el valor es un objeto/array, construir su subárbol
                if (typeof value === 'object' && value !== null) {
                    this._buildFlatTree(value, valuePath, depth + 2);
                }
            }
        }
    }

    /**
     * Construye árbol para valores primitivos
     * @private
     */
    _buildPrimitiveTree(value, path, depth) {
        this.visibleNodes.push({
            id: path || 'root',
            type: 'primitive',
            path: path,
            depth: depth,
            value: value,
            valueType: typeof value
        });
    }

    /**
     * Crea el elemento DOM para un nodo
     * @private
     */
    _createNodeElement(node) {
        const element = Utils.createElement('div', {
            className: `json-node json-node-${node.type}`,
            'data-node-id': node.id,
            'data-depth': node.depth
        });

        element.style.paddingLeft = `${node.depth * this.options.indentSize}px`;

        switch (node.type) {
            case 'array':
                this._renderArrayNode(element, node);
                break;
            case 'object':
                this._renderObjectNode(element, node);
                break;
            case 'property':
                this._renderPropertyNode(element, node);
                break;
            case 'array-item':
                this._renderArrayItemNode(element, node);
                break;
            case 'primitive':
                this._renderPrimitiveNode(element, node);
                break;
        }

        return element;
    }

    /**
     * Renderiza nodo de array
     * @private
     */
    _renderArrayNode(element, node) {
        const toggle = node.isExpandable ? this._createToggleButton(node.isExpanded) : '';
        const icon = '<i class="fas fa-brackets-square json-icon"></i>';
    const content = `<span class="json-key">${(globalThis.I18n && I18n.t('tree.labels.array')) || 'Array'}</span><span class="json-meta">(${node.length})</span>`;

        element.innerHTML = `${toggle}${icon}${content}`;
    }

    /**
     * Renderiza nodo de objeto
     * @private
     */
    _renderObjectNode(element, node) {
        const toggle = node.isExpandable ? this._createToggleButton(node.isExpanded) : '';
        const icon = '<i class="fas fa-braces json-icon"></i>';
    const content = `<span class="json-key">${(globalThis.I18n && I18n.t('tree.labels.object')) || 'Object'}</span><span class="json-meta">(${node.keys.length})</span>`;

        element.innerHTML = `${toggle}${icon}${content}`;
    }

    /**
     * Renderiza nodo de propiedad
     * @private
     */
    _renderPropertyNode(element, node) {
        const key = `<span class="json-key">"${node.key}"</span><span class="json-colon">:</span>`;
        
        // Verificar si el valor es un objeto o array
        if (node.value !== null && typeof node.value === 'object') {
            let preview = '';
            let icon = '';
            
            if (Array.isArray(node.value)) {
                icon = '<i class="fas fa-brackets-square json-icon"></i>';
                preview = `<span class="json-meta">[${node.value.length}]</span>`;
            } else {
                icon = '<i class="fas fa-braces json-icon"></i>';
                const keys = Object.keys(node.value);
                preview = `<span class="json-meta">{${keys.length}}</span>`;
            }
            
            element.innerHTML = `${key} ${icon}${preview}`;
        } else {
            // Valor primitivo
            const value = this._formatValue(node.value, node.valueType);
            element.innerHTML = `${key} ${value}`;
        }
    }

    /**
     * Renderiza elemento de array (índice)
     * @private
     */
    _renderArrayItemNode(element, node) {
        const index = `<span class="json-key json-index">[${node.index}]</span><span class="json-colon">:</span>`;
        
        // Verificar si el valor es un objeto o array
        if (node.value !== null && typeof node.value === 'object') {
            let preview = '';
            let icon = '';
            
            if (Array.isArray(node.value)) {
                icon = '<i class="fas fa-brackets-square json-icon"></i>';
                preview = `<span class="json-meta">[${node.value.length}]</span>`;
            } else {
                icon = '<i class="fas fa-braces json-icon"></i>';
                const keys = Object.keys(node.value);
                preview = `<span class="json-meta">{${keys.length}}</span>`;
            }
            
            element.innerHTML = `${index} ${icon}${preview}`;
        } else {
            // Valor primitivo
            const value = this._formatValue(node.value, node.valueType);
            element.innerHTML = `${index} ${value}`;
        }
    }

    /**
     * Renderiza nodo primitivo
     * @private
     */
    _renderPrimitiveNode(element, node) {
        const value = this._formatValue(node.value, node.valueType);
        element.innerHTML = value;
    }

    /**
     * Crea botón de toggle para expandir/colapsar
     * @private
     */
    _createToggleButton(isExpanded) {
        const expandedClass = isExpanded ? 'expanded' : 'collapsed';
        return `<span class="toggle-icon ${expandedClass}"><i class="fas fa-chevron-right"></i></span>`;
    }

    /**
     * Formatea un valor para mostrar
     * @private
     */
    _formatValue(value, type) {
        switch (type) {
            case 'string':
                return `<span class="json-value json-string">"${Utils.escapeHtml(value)}"</span>`;
            case 'number':
                return `<span class="json-value json-number">${value}</span>`;
            case 'boolean':
                return `<span class="json-value json-boolean">${value}</span>`;
            case 'null':
                return `<span class="json-value json-null">null</span>`;
            default:
                return `<span class="json-value">${String(value)}</span>`;
        }
    }

    /**
     * Toggle expandir/colapsar nodo
     * @private
     */
    _toggleNode(nodeId) {
        if (this.expandedNodes.has(nodeId)) {
            this.expandedNodes.delete(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }

        // Reconstruir árbol y actualizar vista
        this.visibleNodes = [];
        this._buildFlatTree(this.treeData);
        this._renderAllNodes();
    }

    /**
     * Maneja click en nodo
     * @private
     */
    _onNodeClick(nodeId, event) {
        // Emitir evento para que el modal manager lo maneje
        const customEvent = new CustomEvent('nodeClick', {
            detail: {
                nodeId: nodeId,
                node: this.visibleNodes.find(n => n.id === nodeId),
                event: event
            }
        });
        this.container.dispatchEvent(customEvent);
    }

    /**
     * Expande todos los nodos completamente (sin límite de profundidad)
     */
    expandAll() {
        this.expandedNodes.clear();
        this._expandAllRecursive(this.treeData, '');
        this.visibleNodes = [];
        this._buildFlatTree(this.treeData);
        this._renderAllNodes();
    }

    /**
     * Expande recursivamente todos los nodos
     * @private
     */
    _expandAllRecursive(obj, path) {
        const nodeId = path || 'root';
        this.expandedNodes.add(nodeId);

        if (Array.isArray(obj)) {
            for (const [index, item] of obj.entries()) {
                if (typeof item === 'object' && item !== null) {
                    const itemPath = path ? `${path}[${index}]` : `[${index}]`;
                    this._expandAllRecursive(item, itemPath);
                }
            }
        } else if (typeof obj === 'object' && obj !== null) {
            for (const key of Object.keys(obj)) {
                const value = obj[key];
                if (typeof value === 'object' && value !== null) {
                    const valuePath = path ? `${path}.${key}` : key;
                    this._expandAllRecursive(value, valuePath);
                }
            }
        }
    }

    /**
     * Expande todos los nodos hasta una profundidad
     */
    expandToDepth(depth) {
        this.expandedNodes.clear();
        this._expandToDepthRecursive(this.treeData, '', 0, depth);
        this.visibleNodes = [];
        this._buildFlatTree(this.treeData);
        this._renderAllNodes();
    }

    /**
     * Función recursiva para expandir hasta profundidad
     * @private
     */
    _expandToDepthRecursive(obj, path, currentDepth, maxDepth) {
        if (currentDepth >= maxDepth) return;

        const nodeId = path || 'root';
        this.expandedNodes.add(nodeId);

        if (Array.isArray(obj)) {
            this._expandArrayToDepth(obj, path, currentDepth, maxDepth);
        } else if (typeof obj === 'object' && obj !== null) {
            this._expandObjectToDepth(obj, path, currentDepth, maxDepth);
        }
    }

    /**
     * Expande array hasta profundidad
     * @private
     */
    _expandArrayToDepth(arr, path, currentDepth, maxDepth) {
        for (const [index, item] of arr.entries()) {
            if (typeof item === 'object' && item !== null) {
                const itemPath = path ? `${path}[${index}]` : `[${index}]`;
                this._expandToDepthRecursive(item, itemPath, currentDepth + 1, maxDepth);
            }
        }
    }

    /**
     * Expande objeto hasta profundidad
     * @private
     */
    _expandObjectToDepth(obj, path, currentDepth, maxDepth) {
        for (const key of Object.keys(obj)) {
            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                const valuePath = path ? `${path}.${key}` : key;
                this._expandToDepthRecursive(value, valuePath, currentDepth + 1, maxDepth);
            }
        }
    }

    /**
     * Contrae todos los nodos
     */
    collapseAll() {
        this.expandedNodes.clear();
        this.visibleNodes = [];
        this._buildFlatTree(this.treeData);
        this._renderAllNodes();
    }

    /**
     * Expande todos los ancestros necesarios para revelar rutas dadas
     * @param {string[]} paths - Rutas con formato a.b[0].c
     */
    expandPaths(paths = []) {
        if (!paths || paths.length === 0) return;

        // Asegurar raíz expandida
        this.expandedNodes.add('root');

        for (const p of paths) {
            this._expandAncestorsForPath(p);
        }

        // Reconstruir árbol para aplicar la expansión
        this.visibleNodes = [];
        this._buildFlatTree(this.treeData);
        this._renderAllNodes();
    }

    /**
     * Dado un path, agrega a expandedNodes cada contenedor (objeto/array) y, si corresponde, el item del array
     * @private
     */
    _expandAncestorsForPath(path) {
        if (!path) return;

        const tokens = path.split('.');
        let accum = '';

        for (const token of tokens) {
            const m = token.match(/^(.*?)(\[(\d+)\])?$/);
            if (!m) continue;
            const key = m[1];
            const hasIndex = !!m[2];
            const idx = m[3];

            const containerPath = accum ? `${accum}.${key}` : key;
            if (containerPath) this.expandedNodes.add(containerPath);

            if (hasIndex) {
                const itemPath = `${containerPath}[${idx}]`;
                this.expandedNodes.add(itemPath);
                accum = itemPath;
            } else {
                accum = containerPath;
            }
        }
    }

    /**
     * Busca y resalta nodos
     */
    highlightSearch(searchTerm, caseSensitive = false) {
        // Implementar búsqueda visual
        const nodes = this.nodesContainer.querySelectorAll('.json-node');
        for (const node of nodes) {
            const text = node.textContent.toLowerCase();
            const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

            if (text.includes(term)) {
                node.classList.add('json-search-highlight');
            } else {
                node.classList.remove('json-search-highlight');
            }
        }
    }

    /**
     * Revela rutas y resalta resultados; hace scroll al primero
     * @param {{path:string}[]} results
     * @param {string} searchTerm
     * @param {boolean} caseSensitive
     */
    revealSearchResults(results, searchTerm, caseSensitive = false) {
        if (!results || results.length === 0) {
            this.clearSearchHighlight();
            return;
        }

        const uniquePaths = Array.from(new Set(results.map(r => r.path).filter(Boolean)));
        this.expandPaths(uniquePaths);

        // Resaltar y llevar al primer match visible
        this.highlightSearch(searchTerm, caseSensitive);

        const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();
        const first = Array.from(this.nodesContainer.querySelectorAll('.json-node')).find(el => {
            const text = caseSensitive ? el.textContent : el.textContent.toLowerCase();
            return text.includes(term);
        });
        if (first && typeof first.scrollIntoView === 'function') {
            first.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Limpia resaltado de búsqueda
     */
    clearSearchHighlight() {
        const nodes = this.nodesContainer.querySelectorAll('.json-node');
        for (const node of nodes) {
            node.classList.remove('json-search-highlight');
        }
    }

    /**
     * Destruye el renderer y limpia recursos
     */
    destroy() {
        this.container.innerHTML = '';
    }
}

// Exportar para uso en módulos
globalThis.TreeRenderer = TreeRenderer;