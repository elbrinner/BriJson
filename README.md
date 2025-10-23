# 🌟 BriJson - Visualizador y Editor JSON

[![Disponible en](https://img.shields.io/badge/Disponible%20en-www.elbrinner.com%2Fjson-blue)](https://www.elbrinner.com/json)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-green.svg)](LICENSE)
[![Sin publicidad](https://img.shields.io/badge/Sin-Publicidad-brightgreen.svg)](https://www.elbrinner.com/json)

Una herramienta web moderna y sin publicidad para visualizar, editar y validar archivos JSON de forma interactiva.

🔗 **[Accede ahora: www.elbrinner.com/json](https://www.elbrinner.com/json)**

---

## 🎯 ¿Por qué BriJson?

En el mundo del desarrollo, los visualizadores JSON son herramientas esenciales. Sin embargo, muchas de las opciones disponibles están saturadas de **publicidad invasiva** que interrumpe el flujo de trabajo y compromete la privacidad.

**BriJson nace como respuesta a este problema**: una alternativa **100% libre de publicidad**, rápida, y centrada en la productividad del desarrollador.

### Problemas que resuelve:
- ✅ **Sin anuncios**: Trabaja sin distracciones ni publicidad invasiva
- ✅ **Sin seguimiento**: Tu privacidad es importante, no rastreamos ni almacenamos tus datos
- ✅ **Rápido y ligero**: Sin scripts publicitarios que ralenticen tu navegador
- ✅ **100% funcional**: Todas las características son gratuitas y accesibles

---

## ✨ Características Principales

### 📝 Editor JSON Avanzado
- **Edición en tiempo real** con validación automática
- **Autocompletado** y detección de errores de sintaxis
- **Formateo automático** con indentación configurable
- **Minificación** para optimizar el tamaño del JSON
- **Búsqueda inteligente** dentro del JSON

### 🌲 Visualización en Árbol
- **Vista jerárquica** con profundidad ilimitada
- **Expansión/colapso** de nodos individuales o todos a la vez
- **Iconos visuales** que distinguen objetos, arrays y primitivos
- **Colores sintácticos**:
  - 🟣 Claves/propiedades en morado
  - 🔵 Índices de arrays en azul
  - 🔴 Strings en rojo
  - 🔵 Números en azul
  - ⚫ Booleanos y valores null en gris
- **Modo pantalla completa** para visualizar JSONs complejos

### ✏️ Edición Interactiva
- **Menú contextual** (clic derecho) con 6 acciones:
  - ✏️ Editar valor
  - 🏷️ Editar nombre de propiedad
  - ➕ Agregar nueva propiedad
  - 🗑️ Eliminar nodo
  - 📋 Copiar ruta completa
  - 📄 Copiar valor
- **Modales inteligentes**:
  - Modal simplificado para valores primitivos (string, number, boolean)
  - Modal avanzado para objetos y arrays complejos
  - Modal dedicado para renombrar propiedades
- **Validación en tiempo real** al editar valores

### 📊 Estadísticas en Tiempo Real
- **Tamaño del archivo** (en bytes, KB, MB)
- **Número de líneas**
- **Cantidad de claves**
- **Número de objetos y arrays**
- **Profundidad máxima del árbol**
- Presentación visual con colores y diseño moderno

### 🚀 Funcionalidades Adicionales
- **Cargar archivos JSON** desde tu equipo
- **Copiar JSON** al portapapeles con un clic (con formateo automático)
- **Búsqueda global** en claves y valores
- **Atajos de teclado**:
  - `Ctrl/Cmd + O`: Abrir archivo
  - `Ctrl/Cmd + S`: Formatear JSON
  - `Ctrl/Cmd + F`: Enfocar búsqueda
  - `ESC`: Cerrar modales

---

## 🖥️ Capturas de Pantalla

### Editor y Visualizador
![BriJson Interface](docs/images/main-interface.png)

### Edición con Modal Simplificado
![Edit Modal](docs/images/edit-modal.png)

### Menú Contextual
![Context Menu](docs/images/context-menu.png)

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Tailwind CSS 3.4.0
- **Iconos**: Font Awesome 6.4.0
- **Arquitectura**: Modular con 6 módulos JavaScript
- **Workers**: Web Workers para procesamiento en segundo plano

### Estructura del Proyecto
```
BriJson/
├── index.html              # Interfaz principal
├── css/
│   └── styles.css         # Estilos personalizados (660+ líneas)
├── js/
│   ├── core.js            # Coordinador principal (1070 líneas)
│   ├── json-parser.js     # Parser y validador JSON
│   ├── tree-renderer.js   # Renderizador del árbol (540+ líneas)
│   ├── modal-manager.js   # Sistema de modales (540+ líneas)
│   ├── utils.js           # Utilidades compartidas
│   └── json-worker.js     # Web Worker para JSON pesados
├── data/
│   └── sample.json        # JSON de ejemplo
└── README.md              # Este archivo
```

### Módulos JavaScript

#### 1. **core.js** - Coordinador Principal
- Inicialización de la aplicación
- Gestión de eventos del DOM
- Coordinación entre módulos
- Manejo de estado global

#### 2. **json-parser.js** - Parser y Validador
- Parsing asíncrono con Web Workers
- Validación de sintaxis JSON
- Estadísticas del archivo (tamaño, claves, profundidad)
- Búsqueda en JSON

#### 3. **tree-renderer.js** - Renderizador del Árbol
- Construcción del árbol jerárquico
- Expansión/colapso de nodos
- Visualización con colores sintácticos
- Manejo de profundidad ilimitada

#### 4. **modal-manager.js** - Sistema de Modales
- Modal simplificado para valores primitivos
- Modal avanzado para objetos/arrays
- Modal de renombrado de propiedades
- Validación y conversión de tipos

#### 5. **utils.js** - Utilidades
- Debounce y throttle
- Formateo de bytes
- Copia al portapapeles
- Escape de HTML

#### 6. **json-worker.js** - Web Worker
- Procesamiento en segundo plano
- Parsing de JSONs grandes (100k+ líneas)
- Cálculo de estadísticas
- Búsqueda paralela

---

## 🚀 Uso

### Online (Recomendado)
Accede directamente desde tu navegador:
👉 **[www.elbrinner.com/json](https://www.elbrinner.com/json)**

### Local
1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/tuusuario/BriJson.git
   cd BriJson
   ```

2. **Inicia un servidor local**:
   ```bash
   # Con Python 3
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server -p 8000
   
   # Con PHP
   php -S localhost:8000
   ```

3. **Abre en tu navegador**:
   ```
   http://localhost:8000
   ```

---

## 📖 Ejemplos de Uso

### 1. Cargar y Visualizar un JSON
```json
{
  "usuario": {
    "id": 12345,
    "nombre": "María García",
    "email": "maria@example.com",
    "activo": true
  },
  "roles": ["admin", "editor"]
}
```
1. Pega el JSON en el editor
2. Haz clic en "Validar JSON"
3. Explora el árbol expandiendo nodos

### 2. Editar un Valor
1. Haz **clic derecho** en cualquier propiedad
2. Selecciona **"Editar valor"**
3. Modifica el valor en el modal
4. Guarda los cambios

### 3. Renombrar una Propiedad
1. Haz **clic derecho** en una propiedad
2. Selecciona **"Editar nombre"**
3. Escribe el nuevo nombre
4. Confirma el cambio

### 4. Agregar una Nueva Propiedad
1. Haz **clic derecho** en un objeto
2. Selecciona **"Agregar propiedad"**
3. Define nombre y valor
4. Guarda

---

## 🔧 Configuración Avanzada

### Personalizar Colores Sintácticos
Edita `css/styles.css`:
```css
.json-string { color: #c41a16; }  /* Strings en rojo */
.json-number { color: #1c00cf; }  /* Números en azul */
.json-key { color: #881391; }     /* Claves en morado */
```

### Ajustar Profundidad de Expansión
En `js/core.js`, modifica:
```javascript
this.treeRenderer.expandToDepth(3); // Expande 3 niveles por defecto
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si deseas mejorar BriJson:

1. **Fork** el repositorio
2. Crea una **rama** para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. **Commit** tus cambios (`git commit -m 'Añade nueva funcionalidad'`)
4. **Push** a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request**

### Áreas de Mejora
- [ ] Edición inline (doble clic en valores)
- [ ] Historial de cambios (Ctrl+Z)
- [ ] Exportar JSON modificado
- [ ] Diff entre versiones de JSON
- [ ] Tema oscuro/claro
- [ ] Soporte para JSON Schema validation

---

## 🐛 Reportar Errores

Si encuentras un error:
1. Verifica que no esté ya reportado en [Issues](https://github.com/tuusuario/BriJson/issues)
2. Crea un nuevo issue con:
   - Descripción del problema
   - Pasos para reproducirlo
   - Navegador y versión
   - JSON de ejemplo (si aplica)

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- **Iconos**: Font Awesome
- **Framework CSS**: Tailwind CSS
- **Comunidad**: Todos los desarrolladores que sufren con JSONs complejos

---

## 📞 Contacto

- **Web**: [www.elbrinner.com](https://www.elbrinner.com)
- **Herramienta**: [www.elbrinner.com/json](https://www.elbrinner.com/json)
- **Email**: contacto@elbrinner.com

---

## 🌟 ¿Te gusta BriJson?

Si encuentras útil esta herramienta:
- ⭐ Dale una estrella en GitHub
- 🔗 Compártela con otros desarrolladores
- 💬 Deja tus comentarios y sugerencias
- 🐛 Reporta bugs para ayudarnos a mejorar
- 🔧 **Contribuye con mejoras** - Este proyecto está abierto a sugerencias y Pull Requests
- 🚀 **Propón nuevas funcionalidades** - Tus ideas son bienvenidas

### 💡 ¿Tienes una idea?
BriJson es un proyecto de código abierto que **acepta Pull Requests**. Si tienes una mejora, corrección o nueva funcionalidad en mente:
1. Revisa las [áreas de mejora sugeridas](#🤝-contribuir)
2. Propón tu idea en un Issue
3. Desarrolla tu mejora
4. Envía un Pull Request

¡Tu contribución puede ayudar a miles de desarrolladores! 💪

---

**BriJson** - Desarrollado con ❤️ para la comunidad de desarrolladores

*Sin publicidad. Sin seguimiento. Solo código limpio.*

[![Visita www.elbrinner.com/json](https://img.shields.io/badge/Visita-www.elbrinner.com%2Fjson-blue?style=for-the-badge)](https://www.elbrinner.com/json)
