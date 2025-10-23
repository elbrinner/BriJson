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
  const SUPPORTED_CODES = new Set(SUPPORTED.map(l => l.code));

  const RTL_LANGS = new Set(['ar','ur','fa','he']);

  const DEFAULT_LANG = 'en';

  const LANG_TO_OG_LOCALE = {
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    pt: 'pt_PT',
    ru: 'ru_RU',
    hi: 'hi_IN',
    zh: 'zh_CN',
    ar: 'ar_SA',
    bn: 'bn_BD',
    ur: 'ur_PK'
  };

  function normalize(lang){
    if(!lang) return DEFAULT_LANG;
    const lower = lang.toLowerCase();
    // extract primary subtag (e.g., 'es-ES' -> 'es')
    const primary = lower.split('-')[0];
    // map Chinese variants to 'zh'
    if (primary === 'zh') return 'zh';
    // ensure supported
    if (SUPPORTED_CODES.has(lower)) return lower;
    if (SUPPORTED_CODES.has(primary)) return primary;
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
    if (!params || typeof str !== 'string') return str;
    let out = '';
    let i = 0;
    while (i < str.length) {
      const start = str.indexOf('{', i);
      if (start === -1) { out += str.slice(i); break; }
      const end = str.indexOf('}', start + 1);
      if (end === -1) { out += str.slice(i); break; }
      out += str.slice(i, start);
      const key = str.slice(start + 1, end).trim();
      const v = params?.[key];
      out += (v === undefined || v === null) ? '' : String(v);
      i = end + 1;
    }
    return out;
  }

  class I18n {
    constructor(){
      this.lang = DEFAULT_LANG;
      this.dict = {};
    }

    async init(){
      const stored = localStorage.getItem('i18n.lang');
      const urlLang = this._getLangFromUrl();
      // Autodetección solo si no hay preferencia almacenada ni ?lang
      const nav = (typeof navigator !== 'undefined' && (navigator.language || navigator.languages?.[0])) || '';
      this.lang = normalize(urlLang || stored || nav || DEFAULT_LANG);
      // Persistir si vino por URL (para mantener preferencia) o si es primera vez sin stored
      await this.load(this.lang, { persist: !!urlLang || !stored });
      this._setupSelector();
      this.apply();
      this._updateSeoLinks(this.lang);
      this._updateOgLocale(this.lang);
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
      const raw = key.split('.').reduce((o,k)=> o?.[k], this.dict);
      if (typeof raw === 'string') return interpolate(raw, params);
      // Fallback: return key itself for debugging
      return key;
    }

    apply(){
      const applyFor = (selector, datasetKey, applier) => {
        for (const el of document.querySelectorAll(selector)) {
          const key = el.dataset?.[datasetKey];
          if (!key) continue;
          const val = this.t(key);
          if (val && val !== key) applier(el, val);
        }
      };

      // Text content
      applyFor('[data-i18n]', 'i18n', (el, val) => { el.textContent = val; });
      // Inner HTML (optional)
      applyFor('[data-i18n-html]', 'i18nHtml', (el, val) => { el.innerHTML = val; });
      // Placeholder
      applyFor('[data-i18n-placeholder]', 'i18nPlaceholder', (el, val) => { el.setAttribute('placeholder', val); });
      // Title
      applyFor('[data-i18n-title]', 'i18nTitle', (el, val) => { el.setAttribute('title', val); });
      // Meta description and other meta content tagged
      applyFor('meta[data-i18n-description]', 'i18nDescription', (el, val) => { el.setAttribute('content', val); });
      applyFor('meta[data-i18n-content]', 'i18nContent', (el, val) => { el.setAttribute('content', val); });

      // Document title if marked
      const titleEl = document.querySelector('title[data-i18n]');
      const titleKey = titleEl?.dataset?.i18n;
      if (titleKey) {
        const val = this.t(titleKey);
        if (val && val !== titleKey) document.title = val;
      }
    }

    async setLanguage(lang){
      // Cambios del usuario: persistir siempre
      await this.load(lang, { persist: true });
      this.apply();
      this._updateSelectorValue();
      this._setLangInUrl(this.lang);
      this._updateSeoLinks(this.lang);
      this._updateOgLocale(this.lang);
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

    _getLangFromUrl(){
      try {
        const params = new URLSearchParams(globalThis.location.search);
        const q = params.get('lang');
        return q ? normalize(q) : '';
      } catch { return ''; }
    }

    _setLangInUrl(lang){
      try {
        const url = new URL(globalThis.location.href);
        url.searchParams.set('lang', lang);
        history.replaceState(null, '', url);
      } catch {}
    }

    _updateSeoLinks(lang){
      try {
        if (!(globalThis.location.protocol === 'http:' || globalThis.location.protocol === 'https:')) return;
        const head = document.head;
        const mkUrl = (l) => {
          const u = new URL(globalThis.location.href);
          u.searchParams.set('lang', l);
          return u.href;
        };
        // Canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
          canonical = document.createElement('link');
          canonical.rel = 'canonical';
          head.appendChild(canonical);
        }
        canonical.href = mkUrl(lang);
        // og:url y twitter:url
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) ogUrl.setAttribute('content', mkUrl(lang));
        const twUrl = document.querySelector('meta[name="twitter:url"]');
        if (twUrl) twUrl.setAttribute('content', mkUrl(lang));
        // Limpiar alternates previas generadas
        for (const el of Array.from(document.querySelectorAll('link[rel="alternate"][data-generated="i18n-hreflang"]'))){
          el.remove();
        }
        // Agregar alternates para todos los idiomas soportados
        for (const {code} of SUPPORTED){
          const link = document.createElement('link');
          link.rel = 'alternate';
          link.hreflang = code;
          link.href = mkUrl(code);
          link.dataset.generated = 'i18n-hreflang';
          head.appendChild(link);
        }
        // x-default
        const xdef = document.createElement('link');
        xdef.rel = 'alternate';
        xdef.hreflang = 'x-default';
        xdef.href = mkUrl(DEFAULT_LANG);
        xdef.dataset.generated = 'i18n-hreflang';
        head.appendChild(xdef);
      } catch {}
    }

    _updateOgLocale(lang){
      try {
        const meta = document.querySelector('meta[property="og:locale"]');
        if (meta) meta.setAttribute('content', LANG_TO_OG_LOCALE[lang] || LANG_TO_OG_LOCALE[DEFAULT_LANG]);
      } catch {}
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
