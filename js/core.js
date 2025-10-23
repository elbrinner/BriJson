/**
 * Core - Módulo principal que coordina todos los componentes
 * Gestiona la aplicación completa del visualizador JSON
 */
class Core {
    jsonParser = null;
    treeRenderer = null;
    modalManager = null;
    currentJson = null;
    searchTimeout = null;

    constructor() {
        this._init();
    }

    /**
     * Inicializa la aplicación
     * @private
     */
    _init() {
        this._setupDOMReferences();
        this._setupEventListeners();
        this._initializeModules();

        // Cargar JSON de ejemplo
        this._loadSampleData();
    }

    /**
     * Configura referencias al DOM
     * @private
     */
    _setupDOMReferences() {
        this.editor = document.getElementById('json-editor');
        this.treeContainer = document.getElementById('json-tree');
        this.statsContainer = document.getElementById('json-stats');
        this.searchInput = document.getElementById('search-input');
        this.formatBtn = document.getElementById('formatBtn');
        this.minifyBtn = document.getElementById('minifyBtn');
        this.validateBtn = document.getElementById('validateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyJsonBtn = document.getElementById('copyJsonBtn');
        this.loadFileBtn = document.getElementById('load-file-btn');
        this.fileInput = document.getElementById('file-input');
        this.expandAllBtn = document.getElementById('expandAllBtn');
        this.collapseAllBtn = document.getElementById('collapseAllBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
    this.nextMatchBtn = document.getElementById('nextMatchBtn');
        this.modalContainer = document.getElementById('modal-container');
    }

    /**
     * Configura event listeners
     * @private
     */
    _setupEventListeners() {
        // Editor de texto
        this.editor?.addEventListener('input', Utils.debounce(() => {
            this._onEditorInput();
        }, 300));

        // Botones de acción
        this.formatBtn?.addEventListener('click', () => this._formatJson());
        this.minifyBtn?.addEventListener('click', () => this._minifyJson());
        this.validateBtn?.addEventListener('click', () => this._validateJson());
        this.clearBtn?.addEventListener('click', () => this._clearEditor());
        this.copyJsonBtn?.addEventListener('click', () => this._copyJsonToClipboard());

        // Carga de archivos
        this.loadFileBtn?.addEventListener('click', () => this.fileInput?.click());
        this.fileInput?.addEventListener('change', (e) => this._loadFile(e));

        // Controles del árbol
        this.expandAllBtn?.addEventListener('click', () => this._expandAll());
        this.collapseAllBtn?.addEventListener('click', () => this._collapseAll());
        this.fullscreenBtn?.addEventListener('click', () => this._toggleFullscreen());
    this.nextMatchBtn?.addEventListener('click', () => this._gotoNextMatch());

        // Búsqueda con debounce
        const debouncedSearch = Utils.debounce((value) => {
            this._onSearchInput(value);
        }, 300);
        
        this.searchInput?.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'o':
                        e.preventDefault();
                        this.fileInput?.click();
                        break;
                    case 's':
                        e.preventDefault();
                        this._formatJson();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.searchInput?.focus();
                        break;
                }
            }
        });
    }

    /**
     * Inicializa los módulos
     * @private
     */
    _initializeModules() {
        // Parser JSON
        this.jsonParser = new JsonParser();

        // Renderer del árbol
        this.treeRenderer = new TreeRenderer(this.treeContainer);

        // Manager de modales
        this.modalManager = new ModalManager(this.modalContainer);

        // Escuchar eventos del árbol
        this.treeContainer?.addEventListener('nodeClick', (e) => {
            this._onNodeClick(e.detail);
        });
    }

    /**
     * Carga datos de ejemplo
     * @private
     */
    async _loadSampleData() {
        try {
            // Datos de ejemplo embebidos para evitar problemas de CORS
            const sampleData = {
                "name": "Ejemplo JSON",
                "version": "1.0.0",
                "description": "Archivo de ejemplo para probar el visualizador JSON",
                "active": true,
                "count": 42,
                "tags": ["json", "visualizer", "example"],
                "metadata": {
                    "created": "2024-01-15",
                    "author": "BriJson",
                    "license": null
                },
                "features": [
                    {
                        "name": "Tree View",
                        "enabled": true,
                        "priority": 1
                    },
                    {
                        "name": "Validation",
                        "enabled": true,
                        "priority": 2
                    },
                    {
                        "name": "Modal Editing",
                        "enabled": false,
                        "priority": 3
                    }
                ],
                "nested": {
                    "level1": {
                        "level2": {
                            "level3": {
                                "deep": "value",
                                "array": [1, 2, 3, "four", true, false, null]
                            }
                        }
                    }
                },
                "empty": {},
                "emptyArray": []
            };

            this._setJsonData(sampleData);
        } catch (error) {
            console.warn('No se pudo cargar el JSON de ejemplo:', error);
            // Cargar JSON vacío por defecto
            this._setJsonData({});
        }
    }

    /**
     * Maneja input del editor
     * @private
     */
    _onEditorInput() {
        const jsonText = this.editor.value.trim();

        if (!jsonText) {
            this._clearTree();
            return;
        }

        try {
            const parsed = JSON.parse(jsonText);
            this._setJsonData(parsed, false); // No actualizar editor para evitar bucles
        } catch (error) {
            // JSON inválido, mostrar error pero no actualizar árbol
            this._showValidationError(error.message);
        }
    }

    /**
     * Establece los datos JSON actuales
     * @private
     */
    _setJsonData(data, updateEditor = true) {
        this.currentJson = data;

        // Actualizar editor si es necesario
        if (updateEditor && this.editor) {
            this.editor.value = JSON.stringify(data, null, 2);
        }

        // Actualizar árbol
        if (this.treeRenderer) {
            this.treeRenderer.render(data);
            // Expandir automáticamente el primer nivel
            this.treeRenderer.expandToDepth(1);
        }

        // Actualizar estadísticas
        this._updateStats();

        // Limpiar errores de validación
        this._clearValidationError();
    }

    /**
     * Actualiza las estadísticas del JSON
     * @private
     */
    _updateStats() {
        if (!this.statsContainer || !this.jsonParser) return;
        const stats = this.jsonParser.getStats(this.currentJson);

        const values = {
            size: Utils.formatBytes(stats.size),
            lines: stats.lines,
            keys: stats.keys,
            objects: stats.objects,
            arrays: stats.arrays,
            depth: stats.maxDepth
        };

        // Actualizar los contadores en las tarjetas existentes
        const nodes = this.statsContainer.querySelectorAll('.stat-value');
        for (const el of nodes) {
            const key = el.dataset.stat;
            if (!key) continue;
            const val = values[key];
            if (val !== undefined) el.textContent = val;
        }
    }

    /**
     * Maneja click en nodo del árbol
     * @private
     */
    _onNodeClick(detail) {
        const { node, event } = detail;

        // Solo mostrar menú contextual con clic derecho
        if (event.button === 2 || event.ctrlKey || event.which === 3) {
            this._showNodeContextMenu(node, event);
        }
    }

    /**
     * Muestra menú contextual para nodo
     * @private
     */
    _showNodeContextMenu(node, event) {
        event.preventDefault();
        event.stopPropagation();

        // Remover menú existente
        this._removeContextMenu();

        // Crear menú mejorado
        const menu = Utils.createElement('div', {
            className: 'context-menu'
        });

        const T = (k, p) => (globalThis.I18n ? I18n.t(k, p) : null) || '';
        menu.innerHTML = `
            <div class="context-menu-item" data-action="edit">
                <i class="fas fa-pen-square"></i> ${T('context.editValue') || 'Editar valor'}
            </div>
            <div class="context-menu-item" data-action="modify">
                <i class="fas fa-tag"></i> ${T('context.editName') || 'Editar nombre'}
            </div>
            <div class="context-menu-item" data-action="add">
                <i class="fas fa-plus"></i> ${T('context.addProperty') || 'Agregar propiedad'}
            </div>
            <div class="context-menu-item" data-action="delete">
                <i class="fas fa-trash"></i> ${T('context.delete') || 'Eliminar'}
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="copy-path">
                <i class="fas fa-route"></i> ${T('context.copyPath') || 'Copiar ruta'}
            </div>
            <div class="context-menu-item" data-action="copy-value">
                <i class="fas fa-clipboard"></i> ${T('context.copyValue') || 'Copiar valor'}
            </div>
        `;

        // Estilos del menú
        Object.assign(menu.style, {
            position: 'fixed',
            left: `${event.pageX}px`,
            top: `${event.pageY}px`,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: '1000',
            minWidth: '160px',
            fontSize: '14px',
            padding: '4px 0'
        });

        document.body.appendChild(menu);

        // Ajustar posición si se sale de la pantalla
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - rect.width - 10}px`;
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = `${event.pageY - rect.height - 10}px`;
        }

        // Manejar clics en el menú con efectos visuales
        menu.addEventListener('click', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                const action = item.dataset.action;
                if (action) {
                    this._handleContextMenuAction(action, node);
                    this._removeContextMenu();
                }
            }
        });

        // Efectos hover
        menu.addEventListener('mouseover', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item && !item.classList.contains('context-menu-separator')) {
                item.style.backgroundColor = '#f0f8ff';
            }
        });

        menu.addEventListener('mouseout', (e) => {
            const item = e.target.closest('.context-menu-item');
            if (item) {
                item.style.backgroundColor = 'transparent';
            }
        });

        // Cerrar menú al hacer click fuera
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                this._removeContextMenu();
                document.removeEventListener('click', closeMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 10);
    }

    /**
     * Maneja acciones del menú contextual
     * @private
     */
    _handleContextMenuAction(action, node) {
        switch (action) {
            case 'edit':
                this._editNode(node);
                break;
            case 'modify':
                this._modifyNode(node);
                break;
            case 'add':
                this._addNode(node);
                break;
            case 'delete':
                this._deleteNode(node);
                break;
            case 'copy-path':
                Utils.copyToClipboard(node.path);
                this._showNotification((globalThis.I18n && I18n.t('notify.copy.path')) || 'Ruta copiada al portapapeles');
                break;
            case 'copy-value': {
                const value = this._getNodeValue(node);
                Utils.copyToClipboard(JSON.stringify(value, null, 2));
                this._showNotification((globalThis.I18n && I18n.t('notify.copy.value')) || 'Valor copiado al portapapeles');
                break;
            }
        }
    }

    /**
     * Edita un nodo
     * @private
     */
    _editNode(node) {
        if (!this.modalManager) return;

        this.modalManager.showEditModal(
            node,
            (node, newValue) => this._saveNodeEdit(node, newValue),
            (node) => this._deleteNode(node)
        );
    }

    /**
     * Modifica el nombre de una propiedad
     * @private
     */
    _modifyNode(node) {
        if (!this.modalManager) return;
        
        // Solo se puede renombrar propiedades, no elementos de array
        if (node.type !== 'property') {
            this._showNotification((globalThis.I18n && I18n.t('notify.rename.onlyProperties')) || 'Solo se puede renombrar propiedades, no elementos de array', 'warning');
            return;
        }

        this.modalManager.showRenameModal(
            node,
            (node, newName) => this._saveNodeRename(node, newName)
        );
    }

    /**
     * Guarda el renombrado de una propiedad
     * @private
     */
    _saveNodeRename(node, newName) {
        try {
            const newJson = this._renameNodeInJson(this.currentJson, node, newName);
            this._setJsonData(newJson);
            const msg = (globalThis.I18n && I18n.t('notify.rename.ok', { old: node.key, name: newName })) || `Propiedad renombrada de "${node.key}" a "${newName}"`;
            this._showNotification(msg);
        } catch (error) {
            const msg = (globalThis.I18n && I18n.t('notify.rename.error', { message: error.message })) || `Error al renombrar: ${error.message}`;
            this._showNotification(msg, 'error');
        }
    }

    /**
     * Renombra una propiedad en el JSON
     * @private
     */
    _renameNodeInJson(json, node, newName) {
        const pathParts = this._parseJsonPath(node.path);
        const jsonCopy = JSON.parse(JSON.stringify(json));
        
        if (pathParts.length === 0) {
            throw new Error('No se puede renombrar el nodo raíz');
        }

        // Navegar hasta el padre
        let current = jsonCopy;
        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (typeof part === 'string') {
                current = current[part];
            } else {
                current = current[part.key][part.index];
            }
        }

        // Renombrar la propiedad
        const lastPart = pathParts[pathParts.length - 1];
        const oldKey = typeof lastPart === 'string' ? lastPart : lastPart.key;
        
        if (current[newName] !== undefined && newName !== oldKey) {
            throw new Error(`Ya existe una propiedad con el nombre "${newName}"`);
        }

        // Crear nueva propiedad y eliminar la antigua
        const value = current[oldKey];
        delete current[oldKey];
        current[newName] = value;

        return jsonCopy;
    }

    /**
     * Obtiene el valor de un nodo del JSON actual
     * @private
     */
    _getNodeValue(node) {
        const path = node.path;
        if (!path || !this.currentJson) return null;

        const pathParts = this._parseJsonPath(path);
        let current = this.currentJson;

        for (const part of pathParts) {
            if (typeof part === 'string') {
                current = current?.[part];
            } else {
                current = current?.[part.key]?.[part.index];
            }
            if (current === undefined) return null;
        }

        return current;
    }

    /**
     * Agrega un nuevo nodo
     * @private
     */
    _addNode(parentNode) {
        if (!this.modalManager) return;

        let type = 'property';
        let parentPath = '';

        if (parentNode.type === 'array') {
            type = 'array-item';
            parentPath = parentNode.path;
        } else if (parentNode.type === 'object') {
            type = 'property';
            parentPath = parentNode.path;
        } else if (parentNode.type === 'property') {
            // Si es una propiedad, determinar si el padre es array u objeto
            const pathParts = parentNode.path.split('.');
            // Lógica simplificada - en implementación real necesitaríamos más contexto
            parentPath = pathParts.slice(0, -1).join('.');
            type = 'property';
        }

        this.modalManager.showAddModal(
            parentPath,
            type,
            (parentPath, newData) => this._saveNewNode(parentPath, newData, type)
        );
    }

    /**
     * Elimina un nodo
     * @private
     */
    _deleteNode(node) {
        const q = (globalThis.I18n && I18n.t('confirm.delete', { name: node.key || node.path })) || `¿Estás seguro de que quieres eliminar "${node.key || node.path}"?`;
        if (!confirm(q)) {
            return;
        }

        try {
            const newJson = this._deleteNodeFromJson(this.currentJson, node);
            this._setJsonData(newJson);
            this._showNotification((globalThis.I18n && I18n.t('notify.node.deleted')) || 'Nodo eliminado correctamente');
        } catch (error) {
            const msg = (globalThis.I18n && I18n.t('notify.node.deleteError', { message: error.message })) || `Error al eliminar nodo: ${error.message}`;
            this._showNotification(msg, 'error');
        }
    }

    /**
     * Guarda edición de nodo
     * @private
     */
    _saveNodeEdit(node, newValue) {
        try {
            const newJson = this._updateNodeInJson(this.currentJson, node, newValue);
            this._setJsonData(newJson);
            this._showNotification((globalThis.I18n && I18n.t('notify.node.updated')) || 'Nodo actualizado correctamente');
        } catch (error) {
            const msg = (globalThis.I18n && I18n.t('notify.node.updateError', { message: error.message })) || `Error al actualizar nodo: ${error.message}`;
            this._showNotification(msg, 'error');
        }
    }

    /**
     * Guarda nuevo nodo
     * @private
     */
    _saveNewNode(parentPath, newData, type) {
        try {
            const newJson = this._addNodeToJson(this.currentJson, parentPath, newData, type);
            this._setJsonData(newJson);
            this._showNotification((globalThis.I18n && I18n.t('notify.node.added')) || 'Nodo agregado correctamente');
        } catch (error) {
            const msg = (globalThis.I18n && I18n.t('notify.node.addError', { message: error.message })) || `Error al agregar nodo: ${error.message}`;
            this._showNotification(msg, 'error');
        }
    }

    /**
     * Actualiza un nodo en el JSON
     * @private
     */
    _updateNodeInJson(json, node, newValue) {
        const path = node.path;
        if (!path) return json;

        const pathParts = this._parseJsonPath(path);
        return this._setValueAtPath(json, pathParts, newValue);
    }

    /**
     * Elimina un nodo del JSON
     * @private
     */
    _deleteNodeFromJson(json, node) {
        const path = node.path;
        if (!path) return json;

        const pathParts = this._parseJsonPath(path);
        return this._deleteValueAtPath(json, pathParts);
    }

    /**
     * Agrega un nodo al JSON
     * @private
     */
    _addNodeToJson(json, parentPath, newData, type) {
        if (!parentPath) {
            // Agregar al raíz
            if (type === 'property') {
                return { ...json, [newData.key]: newData.value };
            } else if (type === 'array-item') {
                return Array.isArray(json) ? [...json, newData] : [newData];
            }
        }

        const pathParts = this._parseJsonPath(parentPath);
        return this._addValueAtPath(json, pathParts, newData, type);
    }

    /**
     * Parsea una ruta JSON en partes
     * @private
     */
    _parseJsonPath(path) {
        if (!path) return [];

        // Manejar arrays con índices
        return path.split('.').map(part => {
            const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
            if (arrayMatch) {
                return { key: arrayMatch[1], index: Number.parseInt(arrayMatch[2]) };
            }
            return part;
        });
    }

    /**
     * Establece valor en ruta específica
     * @private
     */
    _setValueAtPath(obj, pathParts, value) {
        if (pathParts.length === 0) return value;

        const current = pathParts[0];
        const rest = pathParts.slice(1);

        if (typeof current === 'string') {
            // Propiedad de objeto
            return {
                ...obj,
                [current]: rest.length === 0 ? value : this._setValueAtPath(obj[current] || {}, rest, value)
            };
        } else {
            // Elemento de array
            const newArray = [...(obj[current.key] || [])];
            newArray[current.index] = rest.length === 0 ? value : this._setValueAtPath(newArray[current.index] || {}, rest, value);
            return {
                ...obj,
                [current.key]: newArray
            };
        }
    }

    /**
     * Elimina valor en ruta específica
     * @private
     */
    _deleteValueAtPath(obj, pathParts) {
        if (pathParts.length === 0) return obj;

        const current = pathParts[0];
        const rest = pathParts.slice(1);

        if (typeof current === 'string') {
            // Propiedad de objeto
            const restObj = Object.fromEntries(
                Object.entries(obj).filter(([key]) => key !== current)
            );
            if (rest.length === 0) {
                return restObj;
            } else {
                return {
                    ...restObj,
                    [current]: this._deleteValueAtPath(obj[current], rest)
                };
            }
        } else {
            // Elemento de array
            const newArray = [...(obj[current.key] || [])];
            if (rest.length === 0) {
                newArray.splice(current.index, 1);
            } else {
                newArray[current.index] = this._deleteValueAtPath(newArray[current.index], rest);
            }
            return {
                ...obj,
                [current.key]: newArray
            };
        }
    }

    /**
     * Agrega valor en ruta específica
     * @private
     */
    _addValueAtPath(obj, pathParts, value, type) {
        if (pathParts.length === 0) {
            if (type === 'property') {
                return { ...obj, [value.key]: value.value };
            } else if (type === 'array-item') {
                return Array.isArray(obj) ? [...obj, value] : [value];
            }
            return obj;
        }

        const current = pathParts[0];
        const rest = pathParts.slice(1);

        if (typeof current === 'string') {
            const target = obj[current] || (type === 'array-item' ? [] : {});
            return {
                ...obj,
                [current]: this._addValueAtPath(target, rest, value, type)
            };
        } else {
            const newArray = [...(obj[current.key] || [])];
            newArray[current.index] = this._addValueAtPath(newArray[current.index] || {}, rest, value, type);
            return {
                ...obj,
                [current.key]: newArray
            };
        }
    }

    /**
     * Formatea el JSON
     * @private
     */
    _formatJson() {
        if (!this.editor || !this.currentJson) return;

        try {
            this.editor.value = JSON.stringify(this.currentJson, null, 2);
            this._showNotification((globalThis.I18n && I18n.t('notify.format.ok')) || 'JSON formateado');
        } catch (error) {
            console.error('Error al formatear JSON:', error);
            this._showNotification((globalThis.I18n && I18n.t('notify.format.error')) || 'Error al formatear JSON', 'error');
        }
    }

    /**
     * Minifica el JSON
     * @private
     */
    _minifyJson() {
        if (!this.editor || !this.currentJson) return;

        try {
            this.editor.value = JSON.stringify(this.currentJson);
            this._showNotification((globalThis.I18n && I18n.t('notify.minify.ok')) || 'JSON minificado');
        } catch (error) {
            console.error('Error al minificar JSON:', error);
            this._showNotification((globalThis.I18n && I18n.t('notify.minify.error')) || 'Error al minificar JSON', 'error');
        }
    }

    /**
     * Valida el JSON
     * @private
     */
    _validateJson() {
        const jsonText = this.editor?.value.trim();

        if (!jsonText) {
            this._showNotification((globalThis.I18n && I18n.t('notify.editor.empty')) || 'Editor vacío', 'warning');
            return;
        }

        try {
            JSON.parse(jsonText);
            this._showNotification((globalThis.I18n && I18n.t('notify.json.valid')) || 'JSON válido', 'success');
        } catch (error) {
            this._showValidationError(error.message);
        }
    }

    /**
     * Limpia el editor
     * @private
     */
    _clearEditor() {
        if (!this.editor) return;

        if (confirm((globalThis.I18n && I18n.t('confirm.clear')) || '¿Estás seguro de que quieres limpiar el editor?')) {
            this.editor.value = '';
            this._setJsonData({});
            this._showNotification((globalThis.I18n && I18n.t('notify.editor.cleared')) || 'Editor limpiado');
        }
    }

    /**
     * Copia el JSON al portapapeles
     * @private
     */
    async _copyJsonToClipboard() {
        if (!this.editor) return;

        const jsonText = this.editor.value.trim();

        if (!jsonText) {
            this._showNotification((globalThis.I18n && I18n.t('notify.copy.empty')) || 'No hay JSON para copiar', 'warning');
            return;
        }

        try {
            // Intentar parsear para verificar que es JSON válido
            let formattedJson = jsonText;
            try {
                const parsed = JSON.parse(jsonText);
                formattedJson = JSON.stringify(parsed, null, 2);
            } catch (parseError) {
                // Si no es JSON válido, copiar el texto tal cual
                console.warn('JSON no válido, copiando texto sin formato:', parseError.message);
            }

            // Copiar al portapapeles
            await navigator.clipboard.writeText(formattedJson);
            
            // Cambiar temporalmente el ícono del botón
            const originalHtml = this.copyJsonBtn.innerHTML;
            this.copyJsonBtn.innerHTML = `<i class="fas fa-check"></i> ${(globalThis.I18n && I18n.t('buttons.copied')) || '¡Copiado!'}`;
            this.copyJsonBtn.classList.remove('bg-teal-500', 'hover:bg-teal-600');
            this.copyJsonBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            
            setTimeout(() => {
                this.copyJsonBtn.innerHTML = originalHtml;
                this.copyJsonBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
                this.copyJsonBtn.classList.add('bg-teal-500', 'hover:bg-teal-600');
            }, 2000);

            this._showNotification((globalThis.I18n && I18n.t('notify.copy.ok')) || 'JSON copiado al portapapeles');
        } catch (error) {
            const msg = (globalThis.I18n && I18n.t('notify.copy.error', { message: error.message })) || ('Error al copiar: ' + error.message);
            this._showNotification(msg, 'error');
        }
    }

    /**
     * Carga archivo JSON
     * @private
     */
    async _loadFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.json')) {
            this._showNotification((globalThis.I18n && I18n.t('notify.file.onlyJson')) || 'Solo se permiten archivos JSON', 'error');
            return;
        }

        try {
            const text = await file.text();
            const jsonData = JSON.parse(text);
            this._setJsonData(jsonData);
            const msg = (globalThis.I18n && I18n.t('notify.file.loaded', { name: file.name })) || `Archivo "${file.name}" cargado correctamente`;
            this._showNotification(msg);
        } catch (error) {
            const msg = (globalThis.I18n && I18n.t('notify.file.parseError', { message: error.message })) || `Error al parsear JSON: ${error.message}`;
            this._showNotification(msg, 'error');
        }
    }

    /**
     * Expande todos los nodos
     * @private
     */
    _expandAll() {
        if (this.treeRenderer) {
            this.treeRenderer.expandAll();
            this._showNotification((globalThis.I18n && I18n.t('notify.expand.all')) || 'Todos los nodos expandidos');
        }
    }

    /**
     * Contrae todos los nodos
     * @private
     */
    _collapseAll() {
        if (this.treeRenderer) {
            this.treeRenderer.collapseAll();
            this._showNotification((globalThis.I18n && I18n.t('notify.collapse.all')) || 'Todos los nodos contraídos');
        }
    }

    /**
     * Toggle fullscreen
     * @private
     */
    _toggleFullscreen() {
        const container = document.querySelector('.app-container');
        const treePanel = document.querySelector('.tree-panel');

        if (!container || !treePanel) return;

        // Verificar si ya está en modo fullscreen
        const isFullscreen = treePanel.classList.contains('fullscreen-mode');

        if (isFullscreen) {
            // Salir del modo fullscreen
            this._exitTreeOnlyMode();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            this._showNotification((globalThis.I18n && I18n.t('notify.fullscreen.exit')) || 'Modo normal restaurado');
        } else {
            // Entrar en modo fullscreen (solo árbol)
            this._enterTreeOnlyMode();
            this.fullscreenBtn.innerHTML = '<i class="fas fa-xmark"></i>';
            this._showNotification((globalThis.I18n && I18n.t('notify.fullscreen.enter')) || 'Modo árbol completo activado');
        }
    }

    /**
     * Entra en modo árbol-solo (fullscreen)
     * @private
     */
    _enterTreeOnlyMode() {
        const editorPanel = document.querySelector('.editor-panel');
        const treePanel = document.querySelector('.tree-panel');
        const toolbar = document.querySelector('.toolbar');
        const stats = document.getElementById('json-stats');

        if (editorPanel) {
            editorPanel.style.display = 'none';
        }
        if (stats) {
            stats.style.display = 'none';
        }
        if (treePanel) {
            treePanel.classList.add('fullscreen-mode');
            treePanel.style.position = 'fixed';
            treePanel.style.top = '0';
            treePanel.style.left = '0';
            treePanel.style.right = '0';
            treePanel.style.bottom = '0';
            treePanel.style.width = '100vw';
            treePanel.style.height = '100vh';
            treePanel.style.zIndex = '1000';
            treePanel.style.background = 'white';
            treePanel.style.margin = '0';
            treePanel.style.maxWidth = 'none';
        }
        if (toolbar) {
            toolbar.style.position = 'fixed';
            toolbar.style.top = '10px';
            toolbar.style.right = '10px';
            toolbar.style.zIndex = '1001';
            toolbar.style.background = 'rgba(255, 255, 255, 0.95)';
            toolbar.style.borderRadius = '6px';
            toolbar.style.padding = '6px 8px';
            toolbar.style.boxShadow = '0 2px 12px rgba(0,0,0,0.2)';
            // Alinear elementos (buscador + botones) al extremo derecho y juntos
            toolbar.style.display = 'flex';
            toolbar.style.alignItems = 'center';
            toolbar.style.justifyContent = 'flex-end';
            toolbar.style.gap = '8px';

            // Ocultar cabecera/título e ícono de la vista de árbol en modo fullscreen
            const titleEl = toolbar.querySelector('h2');
            if (titleEl) titleEl.style.display = 'none';

            // Compactar botones: ocultar textos en expand/collapse
            try {
                const compactTargets = [
                    document.getElementById('expandAllBtn'),
                    document.getElementById('collapseAllBtn')
                ];
                for (const btn of compactTargets) {
                    btn && (btn.style.padding = '8px');
                    const span = btn?.querySelector('span');
                    if (span) span.style.display = 'none';
                }

                // Añadir buscador compacto en toolbar
                if (!document.getElementById('fullscreen-search-input')) {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.id = 'fullscreen-search-input';
                    input.dataset.i18nPlaceholder = 'search.placeholder';
                    input.placeholder = (globalThis.I18n && I18n.t('search.placeholder')) || 'Buscar en JSON...';
                    input.className = 'w-56 md:w-72 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500';
                    // No margen extra; usamos gap del contenedor

                    const handler = Utils.debounce((value) => this._onSearchInput(value), 300);
                    input.addEventListener('input', (e) => handler(e.target.value));

                    // Insertar el buscador inmediatamente antes del grupo de botones
                    const buttonsGroup = this.expandAllBtn?.parentElement || toolbar.lastElementChild;
                    toolbar.insertBefore(input, buttonsGroup);

                    // Mover el botón de siguiente junto al buscador para una composición elegante
                    const nextBtn = document.getElementById('nextMatchBtn');
                    if (nextBtn) {
                        nextBtn.style.padding = '8px';
                        nextBtn.style.borderRadius = '9999px';
                        toolbar.insertBefore(nextBtn, buttonsGroup);
                    }
                }

                // Compactar espacio entre botones
                const buttonsGroup = this.expandAllBtn?.parentElement;
                if (buttonsGroup) buttonsGroup.style.gap = '6px';
            } catch {}
        }
    }

    /**
     * Sale del modo árbol-solo
     * @private
     */
    _exitTreeOnlyMode() {
        const editorPanel = document.querySelector('.editor-panel');
        const treePanel = document.querySelector('.tree-panel');
        const toolbar = document.querySelector('.toolbar');
        const stats = document.getElementById('json-stats');

        if (editorPanel) {
            editorPanel.style.display = '';
        }
        if (stats) {
            stats.style.display = '';
        }
        if (treePanel) {
            treePanel.classList.remove('fullscreen-mode');
            treePanel.style.position = '';
            treePanel.style.top = '';
            treePanel.style.left = '';
            treePanel.style.right = '';
            treePanel.style.bottom = '';
            treePanel.style.width = '';
            treePanel.style.height = '';
            treePanel.style.zIndex = '';
            treePanel.style.background = '';
            treePanel.style.margin = '';
            treePanel.style.maxWidth = '';
        }
        if (toolbar) {
            toolbar.style.position = '';
            toolbar.style.top = '';
            toolbar.style.right = '';
            toolbar.style.zIndex = '';
            toolbar.style.background = '';
            toolbar.style.borderRadius = '';
            toolbar.style.padding = '';
            toolbar.style.boxShadow = '';
            toolbar.style.display = '';
            toolbar.style.alignItems = '';
            toolbar.style.justifyContent = '';
            toolbar.style.gap = '';

            // Restaurar visibilidad del título
            const titleEl = toolbar.querySelector('h2');
            if (titleEl) titleEl.style.display = '';

            try {
                // Restaurar textos de botones
                const restoreTargets = [
                    document.getElementById('expandAllBtn'),
                    document.getElementById('collapseAllBtn')
                ];
                for (const btn of restoreTargets) {
                    const span = btn?.querySelector('span');
                    if (span) span.style.display = '';
                    btn && (btn.style.padding = '');
                }
                // Eliminar buscador de fullscreen
                const fsInput = document.getElementById('fullscreen-search-input');
                if (fsInput) fsInput.remove();

                // Restaurar separación por defecto del grupo de botones
                const buttonsGroup = this.expandAllBtn?.parentElement;
                if (buttonsGroup) buttonsGroup.style.gap = '';

                // Devolver el botón de siguiente al grupo de botones si existe
                const nextBtn = document.getElementById('nextMatchBtn');
                if (nextBtn && buttonsGroup) {
                    buttonsGroup.insertBefore(nextBtn, buttonsGroup.firstChild);
                    nextBtn.style.padding = '';
                    nextBtn.style.borderRadius = '';
                }
            } catch {}
        }
    }

    /**
     * Maneja input de búsqueda
     * @private
     */
    _onSearchInput(query) {
        if (!this.treeRenderer) return;

        if (!query.trim()) {
            this.treeRenderer.clearSearchHighlight();
            return;
        }

        // Buscar en JSON usando el parser y expandir hasta las coincidencias
        if (this.jsonParser) {
            const results = this.jsonParser.search(this.currentJson, query);
            if (results && results.length > 0) {
                this.treeRenderer.revealSearchResults(results, query);
            } else {
                // Si no hay resultados por parser, al menos intenta resaltar por texto visible
                this.treeRenderer.highlightSearch(query);
            }
        } else {
            // Fallback
            this.treeRenderer.highlightSearch(query);
        }
    }

    /**
     * Ir a la siguiente coincidencia en el árbol
     * @private
     */
    _gotoNextMatch() {
        if (!this.treeRenderer) return;
        if (typeof this.treeRenderer.nextMatch === 'function') {
            this.treeRenderer.nextMatch();
        }
    }

    /**
     * Limpia el árbol
     * @private
     */
    _clearTree() {
        if (this.treeRenderer) {
            this.treeRenderer.render({});
        }
        this._updateStats();
    }

    /**
     * Muestra error de validación
     * @private
     */
    _showValidationError(message) {
        const editor = this.editor;
        if (!editor) return;

        editor.classList.add('json-error');
        // Podríamos mostrar un tooltip o mensaje de error aquí
        console.error('JSON validation error:', message);
    }

    /**
     * Limpia error de validación
     * @private
     */
    _clearValidationError() {
        const editor = this.editor;
        if (!editor) return;

        editor.classList.remove('json-error');
    }

    /**
     * Muestra notificación
     * @private
     */
    _showNotification(message, type = 'info') {
        // Crear notificación simple
        const notification = Utils.createElement('div', {
            className: `notification notification-${type}`
        });

        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;

        document.body.appendChild(notification);

        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notification.remove();
        }, 3000);

        // Click para cerrar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * Remueve el menú contextual
     * @private
     */
    _removeContextMenu() {
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    globalThis.jsonVisualizer = new Core();
});

// Exportar para uso en módulos
globalThis.Core = Core;