# 🌟 BriJson - JSON Viewer and Editor

[![Available at](https://img.shields.io/badge/Available%20at-www.elbrinner.com%2Fjson-blue)](https://www.elbrinner.com/json)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Ad-free](https://img.shields.io/badge/Ad--free-brightgreen.svg)](https://www.elbrinner.com/json)

A modern, ad-free web tool for interactively viewing, editing, and validating JSON files.

🔗 Access now: https://www.elbrinner.com/json

---

## 🎯 Why BriJson?

In the development world, JSON viewers are essential. However, many options out there are saturated with invasive ads that interrupt workflows and compromise privacy.

BriJson is a response to this problem: a 100% ad-free alternative that’s fast and focused on developer productivity.

### Problems it solves
- ✅ No ads: Work without distractions or invasive advertising
- ✅ No tracking: Your privacy matters — we don’t track or store your data
- ✅ Fast and lightweight: No ad scripts slowing your browser
- ✅ Fully functional: All features are free and accessible

---

## ✨ Main Features

### 📝 Advanced JSON Editor
- Real-time editing with automatic syntax validation
- Autocompletion and error detection
- Automatic formatting with configurable indentation
- Minification to optimize JSON size
- Smart search within JSON

### 🌲 Tree Visualization
- Hierarchical view with unlimited depth
- Expand/collapse individual nodes or all nodes
- Visual icons for objects, arrays, and primitives
- Syntax colors:
  - 🟣 Keys/properties in purple
  - 🔵 Array indices in blue
  - 🔴 Strings in red
  - 🔵 Numbers in blue
  - ⚫ Booleans and null in gray
- Full-screen mode for complex JSONs

### ✏️ Interactive Editing
- Context menu (right-click) with 6 actions:
  - ✏️ Edit value
  - 🏷️ Rename property
  - ➕ Add new property
  - 🗑️ Delete node
  - 📋 Copy full path
  - 📄 Copy value
- Smart modals:
  - Simplified modal for primitive values (string, number, boolean)
  - Advanced modal for complex objects and arrays
  - Dedicated modal for renaming properties
- Real-time validation when editing values

### 📊 Real-time Statistics
- File size (bytes, KB, MB)
- Number of lines
- Number of keys
- Number of objects and arrays
- Maximum tree depth
- Clean, modern visual presentation

### 🚀 Additional Features
- Load JSON files from your device
- Copy formatted JSON to the clipboard (one click)
- Global search in keys and values
- Keyboard shortcuts:
  - Ctrl/Cmd + O: Open file
  - Ctrl/Cmd + S: Format JSON
  - Ctrl/Cmd + F: Focus search
  - Enter (in search): Next match
  - F3: Next match
  - Ctrl/Cmd + G: Next match
  - ESC: Close modals

### 🌐 Internationalization (i18n)
- Automatic language detection with persistence
- Language selector in the footer
- URL parameter to force language: `?lang=es|en|fr|de|pt|ru|hi|zh|ar|bn|ur`
- Fallback to English if a string is missing
- RTL support for languages like Arabic and Urdu

Included languages: Spanish (es), English (en), French (fr), German (de), Portuguese (pt), Russian (ru), Hindi (hi), Chinese (zh), Arabic (ar), Bengali (bn), Urdu (ur).

How to contribute a translation:
1) Duplicate `locales/en.json` as `locales/<code>.json`  
2) Translate the values while keeping the keys  
3) Verify it’s valid JSON  
4) Test with `?lang=<code>` or use the footer selector

### 🔎 Advanced Search
- Search in keys and values across nested structures
- Automatically expands collapsed branches to reveal matches
- Highlights results and allows navigation with a “Next” button
- Cyclic navigation (wraps to start)
- Shortcuts: `Enter` (in search), `F3`, `Ctrl/Cmd + G`

### 🧴 Discreet Notifications (toasts)
- Bottom-right stack with orderly layout
- Time-to-live and opacity adjusted by type (success, info, error)
- i18n-compatible strings

---

## 🖥️ Screenshots

### Editor and Viewer
![BriJson Interface](docs/images/main-interface.png)

### Edit Modal
![Edit Modal](docs/images/edit-modal.png)

### Context Menu
![Context Menu](docs/images/context-menu.png)

---

## 🏗️ Technical Architecture

### Technology Stack
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- UI Framework: Tailwind CSS 3.4.0
- Icons: Font Awesome 6.4.0
- Architecture: Modular with 6 JavaScript modules
- Workers: Web Workers for background processing

### Project Structure
```
BriJson/
├── index.html              # Main interface
├── css/
│   └── styles.css         # Custom styles (660+ lines)
├── js/
│   ├── i18n.js            # Internationalization engine (auto-detect, selector, dynamic SEO)
│   ├── core.js            # Main coordinator (1070 lines)
│   ├── json-parser.js     # JSON parser and validator
│   ├── tree-renderer.js   # Tree renderer (540+ lines)
│   ├── modal-manager.js   # Modal system (540+ lines)
│   ├── utils.js           # Shared utilities
│   └── json-worker.js     # Web Worker for large JSONs
├── data/
│   └── sample.json        # Sample JSON
├── locales/               # Translation files (en, es, fr, de, pt, ru, hi, zh, ar, bn, ur)
│   └── *.json
├── docs/
│   └── images/            # Images used in README
└── README.md              # This file
```

### JavaScript Modules

#### 0. `i18n.js` — Internationalization
- Language auto-detection + URL override (`?lang=xx`) + persistence
- Footer language selector
- Dynamic meta/SEO update

#### 1. `core.js` — Main Coordinator
- App initialization
- DOM event management
- Coordination across modules
- Global state management

#### 2. `json-parser.js` — Parser and Validator
- Asynchronous parsing via Web Workers
- Syntax validation
- File statistics (size, keys, depth)
- JSON search

#### 3. `tree-renderer.js` — Tree Renderer
- Hierarchical tree construction
- Node expand/collapse
- Colored visualization
- Unlimited depth

#### 4. `modal-manager.js` — Modal System
- Simplified modal for primitive values
- Advanced modal for objects/arrays
- Property rename modal
- Validation and type conversion

#### 5. `utils.js` — Utilities
- Debounce and throttle
- Byte formatting
- Clipboard copy
- HTML escaping

#### 6. `json-worker.js` — Web Worker
- Background processing
- Parsing large JSONs (100k+ lines)
- Statistics calculation
- Parallel search

---

## 🚀 Usage

### Online (Recommended)
Open directly in your browser:  
👉 https://www.elbrinner.com/json

### Local
1. Clone the repository:
   ```bash
   git clone https://github.com/elbrinner/BriJson.git
   cd BriJson
   ```

2. Start a local server:
   ```bash
   # With Python 3 (macOS / Linux)
   python3 -m http.server 8000

   # With Node.js (http-server)
   npx http-server -p 8000

   # With PHP
   php -S localhost:8000
   ```

   Optional (VS Code): use the “Live Server” extension and open `index.html`.

   Tips:
   - If the port is busy, use `8080` or `12345` instead of `8000`.
   - To force a language during testing: `http://localhost:8000/?lang=fr`.

3. Open in your browser:
   ```
   http://localhost:8000
   ```

---

## 📖 Usage Examples

### 1) Load and Visualize a JSON
```json
{
  "user": {
    "id": 12345,
    "name": "María García",
    "email": "maria@example.com",
    "active": true
  },
  "roles": ["admin", "editor"]
}
```
1. Paste the JSON into the editor  
2. Click “Validate JSON”  
3. Explore the tree by expanding nodes

### 2) Edit a Value
1. Right-click any property  
2. Select “Edit value”  
3. Modify the value in the modal  
4. Save

### 3) Rename a Property
1. Right-click a property  
2. Select “Rename”  
3. Enter the new name  
4. Confirm

### 4) Add a New Property
1. Right-click an object  
2. Select “Add property”  
3. Define name and value  
4. Save

### 5) Search and Navigate Matches
1. Type in the search field to find matches in keys/values  
2. Use the “Next” button or keys `Enter` (in search), `F3`, or `Ctrl/Cmd + G`  
3. The tree expands automatically to show the result

---

## 🔧 Advanced Configuration

### Customize Syntax Colors
Edit `css/styles.css`:
```css
.json-string { color: #c41a16; }  /* Strings in red */
.json-number { color: #1c00cf; }  /* Numbers in blue */
.json-key { color: #881391; }     /* Keys in purple */
```

### Adjust Expansion Depth
In `js/core.js`, modify:
```javascript
this.treeRenderer.expandToDepth(3); // Expand 3 levels by default
```

### Change Language via URL or Selector
- Footer selector (persistent across sessions)
- Force via URL: `?lang=es|en|fr|de|pt|ru|hi|zh|ar|bn|ur` — e.g., `?lang=fr`
- Automatic fallback to English if a key is missing

---

## 🤝 Contributing

Contributions are welcome! If you want to improve BriJson:

1. Fork the repository  
2. Create a branch for your feature (`git checkout -b feature/new-functionality`)  
3. Commit your changes (`git commit -m 'Add new functionality'`)  
4. Push to the branch (`git push origin feature/new-functionality`)  
5. Open a Pull Request

### Areas for Improvement
- [x] Advanced search with automatic path expansion and cyclic navigation
- [x] Full-screen mode with compact toolbar
- [x] Complete internationalization (11 languages) with auto-detection and persistence
- [x] Discreet notifications (toasts) with stacking and TTL per type
- [x] Large JSON processing via background Web Workers
- [x] Real-time statistics (size, lines, keys, depth)
- [x] Copy full path and value to clipboard
- [x] Automatic JSON formatting and minification
- [x] Real-time JSON syntax validation
- [x] Load JSON files from the local system
- [ ] Inline editing (double-click on values)
- [ ] Change history (Ctrl+Z / undo)
- [ ] Export modified JSON as a file
- [ ] Visual diff between JSON versions
- [ ] Dark/light theme with persistence
- [ ] Support for JSON Schema validation
- [ ] Import/export custom configurations
- [ ] Customizable keyboard shortcuts
- [ ] Side-by-side comparison mode
- [ ] REST API integration for remote loading
- [ ] Automatic JSON Schema generation from data
- [ ] Batch mode for processing multiple files

---

## 🐛 Report Bugs

If you find a bug:
1. Check if it’s already reported in [Issues](https://github.com/elbrinner/BriJson/issues)  
2. Create a new issue with:
   - Problem description  
   - Steps to reproduce  
   - Browser and version  
   - Sample JSON (if applicable)

---

## 📜 License

This project is under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## 📝 Recent Changelog

### 2025-10-24
- Complete internationalization (i18n): auto-detection, footer selector, `?lang=xx`, fallback to English, RTL support.
- Integrated documentation (SEO Content) about editing/adding nodes and searching within JSON (multilingual).
- Advanced search: automatic path expansion, match highlighting, “Next” button, and shortcuts (Enter/F3/Cmd+G).
- Improved full-screen mode with compact toolbar.
- Refined toasts: placement, stacking, and TTL/opacity by type.
- Updated translations: es, en, fr, de, pt, ru, hi, zh, ar, bn, ur.

---

## 🙏 Acknowledgments

- Icons: Font Awesome  
- CSS Framework: Tailwind CSS  
- Community: All developers dealing with complex JSONs

---

## 📞 Contact

- Web: https://www.elbrinner.com  
- Tool: https://www.elbrinner.com/json  
- Email: elbrinner@elbrinner.com

---

## 🌟 Do you like BriJson?

If you find this tool useful:
- ⭐ Star it on GitHub  
- 🔗 Share it with other developers  
- 💬 Leave your comments and suggestions  
- 🐛 Report bugs to help us improve  
- 💻 Contribute improvements — this project accepts Pull Requests  
- 🚀 Propose new features — your ideas are welcome

### 💡 Have an idea?
BriJson is an open-source project that accepts Pull Requests. If you have an improvement, fix, or new functionality in mind:
1. Check the suggested improvement areas  
2. Propose your idea in an Issue  
3. Build your improvement  
4. Send a Pull Request

Your contribution can help thousands of developers! 💪

---

**BriJson** — Built with ❤️ for the developer community

*Ad-free. No tracking. Just clean code.*

[![Visit www.elbrinner.com/json](https://img.shields.io/badge/Visit-www.elbrinner.com%2Fjson-blue?style=for-the-badge)](https://www.elbrinner.com/json)
