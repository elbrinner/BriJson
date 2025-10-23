(function(){
  const SUPPORTED = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'zh', name: '中文' },
    { code: 'ar', name: 'العربية' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ur', name: 'اردو' }
  ];

  const RTL_LANGS = new Set(['ar','ur','fa','he']);

  const DEFAULT_LANG = 'en';

  function normalize(lang){
    if(!lang) return DEFAULT_LANG;
    const lower = lang.toLowerCase();
    // extract primary subtag (e.g., 'es-ES' -> 'es')
    const primary = lower.split('-')[0];
    // map Chinese variants to 'zh'
    if (primary === 'zh') return 'zh';
    // ensure supported
    const supportedCodes = SUPPORTED.map(l=>l.code);
    if (supportedCodes.includes(lower)) return lower;
    if (supportedCodes.includes(primary)) return primary;
    return DEFAULT_LANG;
  }

  async function fetchLocale(lang){
    const code = normalize(lang);
    try {
      const res = await fetch(`locales/${code}.json`, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    } catch(e){
      if (code !== DEFAULT_LANG) {
        const res = await fetch(`locales/${DEFAULT_LANG}.json`, { cache: 'no-store' });
        if (res.ok) return await res.json();
      }
      console.warn('No locale available, continuing without translations', e);
      return {};
    }
  }

  function setLangAttributes(lang){
    const code = normalize(lang);
    document.documentElement.lang = code;
    document.documentElement.dir = RTL_LANGS.has(code) ? 'rtl' : 'ltr';
  }

  function interpolate(str, params){
    if (!params) return str;
    return str.replace(/\{(.*?)\}/g, (_, k) => {
      const v = params[k.trim()];
      return (v === undefined || v === null) ? '' : String(v);
    });
  }

  class I18n {
    constructor(){
      this.lang = DEFAULT_LANG;
      this.dict = {};
    }

    async init(){
      const stored = localStorage.getItem('i18n.lang');
      // Autodetección solo si no hay preferencia almacenada
      const nav = (typeof navigator !== 'undefined' && (navigator.language || (navigator.languages && navigator.languages[0]))) || '';
      this.lang = normalize(stored || nav || DEFAULT_LANG);
      // Persistir solo si no hay preferencia previa (primera vez)
      await this.load(this.lang, { persist: !stored });
      this._setupSelector();
      this.apply();
    }

    async load(lang, opts){
      const { persist = false } = opts || {};
      this.lang = normalize(lang);
      setLangAttributes(this.lang);
      this.dict = await fetchLocale(this.lang);
      if (persist) {
        localStorage.setItem('i18n.lang', this.lang);
      }
    }

    t(key, params){
      const raw = key.split('.').reduce((o,k)=> (o && o[k] != null) ? o[k] : undefined, this.dict);
      if (typeof raw === 'string') return interpolate(raw, params);
      // Fallback: return key itself for debugging
      return key;
    }

    apply(){
      // Text content
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = this.t(key);
        if (val && val !== key) el.textContent = val;
      });

      // Inner HTML (optional)
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const val = this.t(key);
        if (val && val !== key) el.innerHTML = val;
      });

      // Placeholder
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const val = this.t(key);
        if (val && val !== key) el.setAttribute('placeholder', val);
      });

      // Title
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const val = this.t(key);
        if (val && val !== key) el.setAttribute('title', val);
      });

      // Meta description and other meta content tagged
      document.querySelectorAll('meta[data-i18n-description]').forEach(el => {
        const key = el.getAttribute('data-i18n-description');
        const val = this.t(key);
        if (val && val !== key) el.setAttribute('content', val);
      });
      document.querySelectorAll('meta[data-i18n-content]').forEach(el => {
        const key = el.getAttribute('data-i18n-content');
        const val = this.t(key);
        if (val && val !== key) el.setAttribute('content', val);
      });

      // Document title if marked
      const titleEl = document.querySelector('title[data-i18n]');
      if (titleEl) {
        const key = titleEl.getAttribute('data-i18n');
        const val = this.t(key);
        if (val && val !== key) document.title = val;
      }
    }

    async setLanguage(lang){
      // Cambios del usuario: persistir siempre
      await this.load(lang, { persist: true });
      this.apply();
      this._updateSelectorValue();
    }

    _setupSelector(){
      const select = document.getElementById('language-select');
      if (!select) return;
      // Populate options
      select.innerHTML = '';
      for (const {code, name} of SUPPORTED){
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = name;
        select.appendChild(opt);
      }
      this._updateSelectorValue();
      select.addEventListener('change', (e)=>{
        this.setLanguage(e.target.value);
      });
    }

    _updateSelectorValue(){
      const select = document.getElementById('language-select');
      if (select) select.value = this.lang;
    }
  }

  const i18n = new I18n();
  globalThis.I18n = i18n;

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=> i18n.init());
  } else {
    i18n.init();
  }
})();
