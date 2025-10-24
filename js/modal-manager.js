/**
 * ModalManager - Módulo para manejar modales de edición de JSON
 * Gestiona la creación, edición y eliminación de nodos JSON a través de modales
 */
class ModalManager {
    constructor(container) {
        this.container = container;
        this.currentModal = null;
        this.currentNode = null;
        this.onSaveCallback = null;
        this.onDeleteCallback = null;

        this._init();
    }

    /**
     * Helper de traducción con fallback en inglés
     * @param {string} key
     * @param {object} [params]
     * @param {string} [fallback]
     */
    _t(key, params, fallback) {
        const v = (globalThis.I18n && I18n.t(key, params)) || null;
        if (!v || v === key) return fallback || '';
        return v;
    }

    /**
     * Inicializa el modal manager
     * @private
     */
    _init() {
        // Crear overlay para modales
        this.overlay = Utils.createElement('div', {
            className: 'modal-overlay',
            id: 'modal-overlay'
        });
        this.overlay.style.display = 'none';
        this.container.appendChild(this.overlay);

        // Event listeners
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeModal();
            }
        });

        // Escuchar eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }

    /**
     * Muestra modal para editar un nodo
     * @param {Object} node - Información del nodo a editar
     * @param {Function} onSave - Callback cuando se guarda
     * @param {Function} onDelete - Callback cuando se elimina
     */
    showEditModal(node, onSave, onDelete) {
        this.currentNode = node;
        this.onSaveCallback = onSave;
        this.onDeleteCallback = onDelete;

        const modal = this._createEditModal(node);
        this._showModal(modal);
    }

    /**
     * Muestra modal para renombrar una propiedad
     * @param {Object} node - Información del nodo a renombrar
     * @param {Function} onSave - Callback cuando se guarda
     */
    showRenameModal(node, onSave) {
        this.currentNode = node;
        this.onSaveCallback = onSave;

        const modal = this._createRenameModal(node);
        this._showModal(modal);
    }

    /**
     * Muestra modal para agregar un nuevo nodo
     * @param {string} parentPath - Ruta del padre donde agregar
     * @param {string} type - Tipo de nodo a agregar ('property', 'array-item')
     * @param {Function} onSave - Callback cuando se guarda
     */
    showAddModal(parentPath, type, onSave) {
        this.onSaveCallback = onSave;

        const modal = this._createAddModal(parentPath, type);
        this._showModal(modal);
    }

    /**
     * Crea modal de edición
     * @private
     */
    _createEditModal(node) {
        const modal = Utils.createElement('div', {
            className: 'modal json-edit-modal'
        });

        const isProperty = node.type === 'property';
        const isPrimitive = node.type === 'primitive';
        const isSimpleValue = isProperty && ['string', 'number', 'boolean', 'null'].includes(node.valueType);

        let content = '';

        if (isSimpleValue) {
            // Modal simplificado para valores simples (string, number, boolean)
            content = `
                <div class="modal-header">
                    <h3>${this._t('modal.edit.simpleTitle', { key: Utils.escapeHtml(node.key) }, `Edit "${Utils.escapeHtml(node.key)}"`)}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="property-value">${this._t('modal.labels.currentValue', null, 'Current value:')}</label>
                        ${this._createSimpleValueInput(node.value, node.valueType, 'property-value')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="delete-btn">${this._t('modal.buttons.deleteProperty', null, 'Delete property')}</button>
                    <div class="modal-actions">
                        <button class="btn btn-cancel" id="cancel-btn">${this._t('common.cancel', null, 'Cancel')}</button>
                        <button class="btn btn-primary" id="save-btn">${this._t('common.save', null, 'Save')}</button>
                    </div>
                </div>
            `;
        } else if (isProperty) {
            // Modal completo para propiedades con valores complejos
            content = `
                <div class="modal-header">
                    <h3>${this._t('modal.edit.propertyTitle', null, 'Edit Property')}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="property-key">${this._t('modal.labels.propertyName', null, 'Property name:')}</label>
                        <input type="text" id="property-key" value="${Utils.escapeHtml(node.key)}" class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="property-value">${this._t('modal.labels.value', null, 'Value:')}</label>
                        ${this._createValueInput(node.value, node.valueType, 'property-value')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="delete-btn">${this._t('common.delete', null, 'Delete')}</button>
                    <div class="modal-actions">
                        <button class="btn btn-cancel" id="cancel-btn">${this._t('common.cancel', null, 'Cancel')}</button>
                        <button class="btn btn-primary" id="save-btn">${this._t('common.save', null, 'Save')}</button>
                    </div>
                </div>
            `;
        } else if (isPrimitive) {
            // Modal para editar valor primitivo
            content = `
                <div class="modal-header">
                    <h3>${this._t('modal.edit.valueTitle', null, 'Edit Value')}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="primitive-value">${this._t('modal.labels.value', null, 'Value:')}</label>
                        ${this._createValueInput(node.value, node.valueType, 'primitive-value')}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="delete-btn">${this._t('common.delete', null, 'Delete')}</button>
                    <div class="modal-actions">
                        <button class="btn btn-cancel" id="cancel-btn">${this._t('common.cancel', null, 'Cancel')}</button>
                        <button class="btn btn-primary" id="save-btn">${this._t('common.save', null, 'Save')}</button>
                    </div>
                </div>
            `;
        } else {
            // Modal para editar objeto/array
            content = `
                <div class="modal-header">
                    <h3>${this._t('modal.edit.containerTitle', { type: (globalThis.I18n && I18n.t(node.type === 'object' ? 'types.object' : 'types.array')) || (node.type === 'object' ? 'Object' : 'Array') }, `Edit ${node.type === 'object' ? 'Object' : 'Array'}`)}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="json-preview">
                        <pre>${Utils.escapeHtml(JSON.stringify(node.value || node, null, 2))}</pre>
                    </div>
                    <div class="form-group">
                        <label for="json-text">${this._t('modal.labels.jsonText', null, 'JSON (text):')}</label>
                        <textarea id="json-text" class="form-textarea" rows="10">${Utils.escapeHtml(JSON.stringify(node.value || node, null, 2))}</textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="delete-btn">${this._t('common.delete', null, 'Delete')}</button>
                    <div class="modal-actions">
                        <button class="btn btn-cancel" id="cancel-btn">${this._t('common.cancel', null, 'Cancel')}</button>
                        <button class="btn btn-primary" id="save-btn">${this._t('common.save', null, 'Save')}</button>
                    </div>
                </div>
            `;
        }

        modal.innerHTML = content;

        // Event listeners
        this._setupModalEvents(modal, isSimpleValue || isPrimitive);

        return modal;
    }

    /**
     * Crea modal para renombrar una propiedad
     * @private
     */
    _createRenameModal(node) {
        const modal = Utils.createElement('div', {
            className: 'modal json-rename-modal'
        });

        const content = `
            <div class="modal-header">
                <h3>${this._t('modal.rename.title', null, 'Rename property')}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="property-name">${this._t('modal.labels.currentName', null, 'Current name:')}</label>
                    <div class="current-value">"${Utils.escapeHtml(node.key)}"</div>
                </div>
                <div class="form-group">
                    <label for="new-property-name">${this._t('modal.labels.newName', null, 'New name:')}</label>
                    <input 
                        type="text" 
                        id="new-property-name" 
                        class="form-input" 
                        value="${Utils.escapeHtml(node.key)}"
                        placeholder="${this._t('modal.placeholders.newPropertyName', null, 'new_name')}"
                        autofocus
                    >
                    <small class="form-hint">${this._t('modal.hints.rename', null, 'Enter a new name for this property')}</small>
                </div>
            </div>
            <div class="modal-footer">
                <div class="modal-actions">
                    <button class="btn btn-cancel" id="cancel-btn">${this._t('common.cancel', null, 'Cancel')}</button>
                    <button class="btn btn-primary" id="save-btn">${this._t('common.rename', null, 'Rename')}</button>
                </div>
            </div>
        `;

        modal.innerHTML = content;

        // Event listeners
        this._setupRenameModalEvents(modal);

        return modal;
    }

    /**
     * Crea modal para agregar nuevo nodo
     * @private
     */
    _createAddModal(parentPath, type) {
        const modal = Utils.createElement('div', {
            className: 'modal json-add-modal'
        });

        let content = '';

        if (type === 'property') {
            content = `
                <div class="modal-header">
                    <h3>${this._t('modal.add.propertyTitle', null, 'Add Property')}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="new-property-key">${this._t('modal.labels.propertyName', null, 'Property name:')}</label>
                        <input type="text" id="new-property-key" class="form-input" placeholder="${this._t('modal.placeholders.propertyKey', null, 'property_name')}">
                    </div>
                    <div class="form-group">
                        <label for="new-property-value">${this._t('modal.labels.value', null, 'Value:')}</label>
                        ${this._createValueInput('', 'string', 'new-property-value')}
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="modal-actions">
                        <button class="btn btn-cancel" id="cancel-btn">${this._t('common.cancel', null, 'Cancel')}</button>
                        <button class="btn btn-primary" id="save-btn">${this._t('common.add', null, 'Add')}</button>
                    </div>
                </div>
            `;
        } else if (type === 'array-item') {
            content = `
                <div class="modal-header">
                    <h3>${this._t('modal.add.arrayItemTitle', null, 'Add Array Item')}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label for="new-array-value">${this._t('modal.labels.value', null, 'Value:')}</label>
                        ${this._createValueInput('', 'string', 'new-array-value')}
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="modal-actions">
                        <button class="btn btn-cancel" id="cancel-btn">${this._t('common.cancel', null, 'Cancel')}</button>
                        <button class="btn btn-primary" id="save-btn">${this._t('common.add', null, 'Add')}</button>
                    </div>
                </div>
            `;
        }

        modal.innerHTML = content;

        // Event listeners
        this._setupAddModalEvents(modal, parentPath, type);

        return modal;
    }

    /**
     * Crea input simple para valores primitivos (sin selector de tipo)
     * @private
     */
    _createSimpleValueInput(value, type, inputId) {
        const escapedValue = Utils.escapeHtml(String(value));

        let inputHtml = '';

        switch (type) {
            case 'string':
                inputHtml = `<input type="text" id="${inputId}" value="${escapedValue}" class="form-input" placeholder="${this._t('modal.placeholders.newValue', null, 'Enter new value')}">`;
                break;
            case 'number':
                inputHtml = `<input type="number" id="${inputId}" value="${escapedValue}" class="form-input" step="any">`;
                break;
            case 'boolean':
                inputHtml = `
                    <select id="${inputId}" class="form-input">
                        <option value="true" ${value === true ? 'selected' : ''}>true</option>
                        <option value="false" ${value === false ? 'selected' : ''}>false</option>
                    </select>
                `;
                break;
            case 'null':
                inputHtml = `<input type="text" id="${inputId}" value="null" class="form-input" readonly>`;
                break;
            default:
                inputHtml = `<input type="text" id="${inputId}" value="${escapedValue}" class="form-input">`;
        }

        return inputHtml;
    }

    /**
     * Crea input apropiado para el tipo de valor
     * @private
     */
    _createValueInput(value, type, inputId) {
        const escapedValue = Utils.escapeHtml(String(value));

        const typeSelector = `
            <select class="value-type-selector" data-target="${inputId}">
                <option value="string" ${type === 'string' ? 'selected' : ''}>${(globalThis.I18n && I18n.t('types.string')) || 'String'}</option>
                <option value="number" ${type === 'number' ? 'selected' : ''}>${(globalThis.I18n && I18n.t('types.number')) || 'Number'}</option>
                <option value="boolean" ${type === 'boolean' ? 'selected' : ''}>${(globalThis.I18n && I18n.t('types.boolean')) || 'Boolean'}</option>
                <option value="null" ${type === 'null' ? 'selected' : ''}>${(globalThis.I18n && I18n.t('types.null')) || 'Null'}</option>
                <option value="object">${(globalThis.I18n && I18n.t('types.object')) || 'Object'}</option>
                <option value="array">${(globalThis.I18n && I18n.t('types.array')) || 'Array'}</option>
            </select>
        `;

        let inputHtml = '';

        switch (type) {
            case 'string':
                inputHtml = `<input type="text" id="${inputId}" value="${escapedValue}" class="form-input">`;
                break;
            case 'number':
                inputHtml = `<input type="number" id="${inputId}" value="${escapedValue}" class="form-input">`;
                break;
            case 'boolean':
                inputHtml = `
                    <select id="${inputId}" class="form-input">
                        <option value="true" ${value === true ? 'selected' : ''}>true</option>
                        <option value="false" ${value === false ? 'selected' : ''}>false</option>
                    </select>
                `;
                break;
            case 'null':
                inputHtml = `<input type="text" id="${inputId}" value="null" class="form-input" readonly>`;
                break;
            case 'object':
            case 'array':
                inputHtml = `<textarea id="${inputId}" class="form-textarea" rows="5" placeholder='${(globalThis.I18n && (type === 'object' ? I18n.t('modal.placeholders.objectExample') : I18n.t('modal.placeholders.arrayExample'))) || (type === 'object' ? '{"key": "value"}' : '[1, 2, 3]')}'>${escapedValue || ''}</textarea>`;
                break;
            default:
                inputHtml = `<input type="text" id="${inputId}" value="${escapedValue}" class="form-input">`;
        }

        return `
            <div class="value-input-group">
                ${typeSelector}
                ${inputHtml}
            </div>
        `;
    }

    /**
     * Configura eventos para modal de edición
     * @private
     */
    _setupModalEvents(modal, isSimpleValue) {
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const saveBtn = modal.querySelector('#save-btn');
        const deleteBtn = modal.querySelector('#delete-btn');

        // Cerrar modal
        closeBtn?.addEventListener('click', () => this.closeModal());
        cancelBtn?.addEventListener('click', () => this.closeModal());

        // Selector de tipo de valor
        const typeSelector = modal.querySelector('.value-type-selector');
        if (typeSelector) {
            typeSelector.addEventListener('change', (e) => {
                const targetId = e.target.dataset.target;
                const newType = e.target.value;
                const currentValue = this._getCurrentValue(modal, targetId);

                const formGroup = e.target.closest('.form-group');
                const valueContainer = formGroup.querySelector('.value-input-group');

                // Recrear input con nuevo tipo
                const newInput = this._createValueInput(currentValue, newType, targetId);
                valueContainer.innerHTML = newInput;

                // Reconfigurar eventos
                this._setupValueTypeSelector(valueContainer);
            });
        }

        // Guardar cambios
        saveBtn.addEventListener('click', () => {
            const newValue = this._getEditedValue(modal, isSimpleValue);
            if (newValue !== null && this.onSaveCallback) {
                this.onSaveCallback(this.currentNode, newValue);
                this.closeModal();
            }
        });

        // Eliminar
        deleteBtn?.addEventListener('click', () => {
            if (this.onDeleteCallback) {
                this.onDeleteCallback(this.currentNode);
                this.closeModal();
            }
        });
    }

    /**
     * Configura eventos para modal de agregar
     * @private
     */
    _setupAddModalEvents(modal, parentPath, type) {
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const saveBtn = modal.querySelector('#save-btn');

        // Cerrar modal
        closeBtn?.addEventListener('click', () => this.closeModal());
        cancelBtn?.addEventListener('click', () => this.closeModal());

        // Selector de tipo de valor
        const typeSelector = modal.querySelector('.value-type-selector');
        if (typeSelector) {
            typeSelector.addEventListener('change', (e) => {
                const targetId = e.target.dataset.target;
                const newType = e.target.value;

                const formGroup = e.target.closest('.form-group');
                const valueContainer = formGroup.querySelector('.value-input-group');

                // Recrear input con nuevo tipo
                const newInput = this._createValueInput('', newType, targetId);
                valueContainer.innerHTML = newInput;

                // Reconfigurar eventos
                this._setupValueTypeSelector(valueContainer);
            });
        }

        // Guardar nuevo elemento
        saveBtn.addEventListener('click', () => {
            const newData = this._getNewValue(modal, type);
            if (newData && this.onSaveCallback) {
                this.onSaveCallback(parentPath, newData);
                this.closeModal();
            }
        });
    }

    /**
     * Configura eventos del modal de renombrado
     * @private
     */
    _setupRenameModalEvents(modal) {
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('#cancel-btn');
        const saveBtn = modal.querySelector('#save-btn');
        const nameInput = modal.querySelector('#new-property-name');

        // Cerrar modal
        closeBtn?.addEventListener('click', () => this.closeModal());
        cancelBtn?.addEventListener('click', () => this.closeModal());

        // Seleccionar todo el texto al enfocar
        nameInput?.addEventListener('focus', (e) => {
            e.target.select();
        });

        // Guardar con Enter
        nameInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveBtn?.click();
            }
        });

        // Guardar nuevo nombre
        saveBtn?.addEventListener('click', () => {
            const newName = nameInput?.value.trim();
            
            if (!newName) {
                alert(this._t('modal.error.property_name_empty', null, 'Property name cannot be empty'));
                nameInput?.focus();
                return;
            }

            if (newName === this.currentNode.key) {
                this.closeModal();
                return;
            }

            if (this.onSaveCallback) {
                this.onSaveCallback(this.currentNode, newName);
                this.closeModal();
            }
        });
    }

    /**
     * Configura selector de tipo de valor
     * @private
     */
    _setupValueTypeSelector(container) {
        const typeSelector = container.querySelector('.value-type-selector');
        if (typeSelector) {
            typeSelector.addEventListener('change', (e) => {
                const targetId = e.target.dataset.target;
                const newType = e.target.value;
                const currentValue = this._getCurrentValue(container, targetId);

                // Recrear input con nuevo tipo
                const newInput = this._createValueInput(currentValue, newType, targetId);
                container.innerHTML = newInput;

                // Reconfigurar recursivamente
                this._setupValueTypeSelector(container);
            });
        }
    }

    /**
     * Obtiene el valor actual de un input
     * @private
     */
    _getCurrentValue(container, inputId) {
        const input = container.querySelector(`#${inputId}`);
        return input ? input.value : '';
    }

    /**
     * Obtiene el valor editado del modal
     * @private
     */
    _getEditedValue(modal, isSimpleValue) {
        try {
            if (isSimpleValue) {
                // Para valores simples sin selector de tipo
                const valueInput = modal.querySelector('#property-value') || modal.querySelector('#primitive-value');

                if (!valueInput) return null;

                // Inferir tipo del input
                const inputType = valueInput.type;
                let type, rawValue;

                if (inputType === 'number') {
                    type = 'number';
                    rawValue = valueInput.value;
                } else if (valueInput.tagName.toLowerCase() === 'select') {
                    type = 'boolean';
                    rawValue = valueInput.value;
                } else if (valueInput.value === 'null') {
                    type = 'null';
                    rawValue = 'null';
                } else {
                    type = 'string';
                    rawValue = valueInput.value;
                }

                let parsedValue;
                try {
                    parsedValue = this._parseValue(rawValue, type);
                } catch (e) {
                    alert(this._t('modal.error.parse_value', { message: e.message }, `Failed to parse value: ${e.message}`));
                    return null;
                }

                // Solo devolver el valor, no la estructura completa
                return parsedValue;
            } else {
                // Verificar si es un objeto/array complejo (tiene textarea)
                const jsonText = modal.querySelector('#json-text');
                if (jsonText) {
                    // Objeto o array complejo
                    return JSON.parse(jsonText.value);
                }

                // Para valores con selector de tipo
                const keyInput = modal.querySelector('#property-key');
                const valueInput = modal.querySelector('#property-value') || modal.querySelector('#primitive-value');

                if (!valueInput) return null;

                const type = this._getSelectedType(modal);
                const rawValue = valueInput.value;

                let parsedValue;
                try {
                    parsedValue = this._parseValue(rawValue, type);
                } catch (e) {
                    alert(this._t('modal.error.parse_value', { message: e.message }, `Failed to parse value: ${e.message}`));
                    return null;
                }

                if (keyInput) {
                    // Es una propiedad
                    return {
                        key: keyInput.value.trim(),
                        value: parsedValue
                    };
                } else {
                    // Es un valor primitivo
                    return parsedValue;
                }
            }
        } catch (e) {
            alert(this._t('modal.error.process_data', { message: e.message }, `Failed to process data: ${e.message}`));
            return null;
        }
    }

    /**
     * Obtiene el nuevo valor para agregar
     * @private
     */
    _getNewValue(modal, type) {
        try {
            if (type === 'property') {
                const keyInput = modal.querySelector('#new-property-key');
                const valueInput = modal.querySelector('#new-property-value');

                if (!keyInput || !valueInput || !keyInput.value.trim()) {
                    alert(this._t('modal.error.property_required', null, 'Property name is required'));
                    return null;
                }

                const selectedType = this._getSelectedType(modal);
                const rawValue = valueInput.value;

                let parsedValue;
                try {
                    parsedValue = this._parseValue(rawValue, selectedType);
                } catch (e) {
                    alert(this._t('modal.error.parse_value', { message: e.message }, `Failed to parse value: ${e.message}`));
                    return null;
                }

                return {
                    key: keyInput.value.trim(),
                    value: parsedValue
                };
            } else if (type === 'array-item') {
                const valueInput = modal.querySelector('#new-array-value');
                if (!valueInput) return null;

                const selectedType = this._getSelectedType(modal);
                const rawValue = valueInput.value;

                try {
                    return this._parseValue(rawValue, selectedType);
                } catch (e) {
                    alert(this._t('modal.error.parse_value', { message: e.message }, `Failed to parse value: ${e.message}`));
                    return null;
                }
            }
        } catch (e) {
            alert(this._t('modal.error.process_data', { message: e.message }, `Failed to process data: ${e.message}`));
            return null;
        }
        return null;
    }

    /**
     * Obtiene el tipo seleccionado en el selector
     * @private
     */
    _getSelectedType(modal) {
        const typeSelector = modal.querySelector('.value-type-selector');
        return typeSelector ? typeSelector.value : 'string';
    }

    /**
     * Parsea un valor según su tipo
     * @private
     */
    _parseValue(rawValue, type) {
        switch (type) {
            case 'string':
                return rawValue;
            case 'number': {
                const num = Number(rawValue);
                if (Number.isNaN(num)) throw new Error(this._t('modal.error.number_invalid', null, 'Invalid numeric value'));
                return num;
            }
            case 'boolean':
                if (rawValue === 'true') return true;
                if (rawValue === 'false') return false;
                throw new Error(this._t('modal.error.boolean_invalid', null, 'Boolean value must be "true" or "false"'));
            case 'null':
                return null;
            case 'object':
            case 'array':
                if (!rawValue.trim()) {
                    return type === 'object' ? {} : [];
                }
                return JSON.parse(rawValue);
            default:
                return rawValue;
        }
    }

    /**
     * Muestra un modal
     * @private
     */
    _showModal(modal) {
        this.currentModal = modal;
        this.overlay.innerHTML = '';
        this.overlay.appendChild(modal);
        this.overlay.style.display = 'flex';

        // Animación de entrada
        setTimeout(() => {
            modal.classList.add('modal-show');
        }, 10);

        // Focus en primer input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            firstInput.focus();
        }
    }

    /**
     * Cierra el modal actual
     */
    closeModal() {
        if (!this.currentModal) return;

        this.currentModal.classList.remove('modal-show');

        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.overlay.innerHTML = '';
            this.currentModal = null;
            this.currentNode = null;
            this.onSaveCallback = null;
            this.onDeleteCallback = null;
        }, 300);
    }

    /**
     * Verifica si hay un modal abierto
     */
    isModalOpen() {
        return this.currentModal !== null;
    }

    /**
     * Destruye el modal manager
     */
    destroy() {
        this.closeModal();
        if (this.overlay?.parentNode) {
            this.overlay.remove();
        }
    }
}

// Exportar para uso en módulos
globalThis.ModalManager = ModalManager;