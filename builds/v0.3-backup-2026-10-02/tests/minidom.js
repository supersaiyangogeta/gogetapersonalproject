// A small DOM for headless UI tests: elements with a real class list, style, children, hidden,
// textContent, and an innerHTML parser that understands the game's own markup (spans, icons,
// SVG with self-closing paths). Enough to attach the real HUD and screens to a headless battle
// and read what they put on screen. Not a browser: no layout, no CSS, no events.
//
//   const dom = require('./minidom').create();
//   gg.ctx.document = dom.document;   // before loading src/ui scripts
const { makeStub } = require('./headless');
const VOID = new Set(['img', 'br', 'input', 'path', 'circle', 'rect', 'line', 'polygon', 'ellipse']);

class ClassList {
  constructor(e) {
    this.e = e;
  }
  _get() {
    return new Set(String(this.e.className || '').split(/\s+/).filter(Boolean));
  }
  _set(s) {
    this.e.className = [...s].join(' ');
  }
  add(...c) {
    const s = this._get();
    c.forEach((x) => s.add(x));
    this._set(s);
  }
  remove(...c) {
    const s = this._get();
    c.forEach((x) => s.delete(x));
    this._set(s);
  }
  toggle(c, force) {
    const s = this._get();
    const on = force === undefined ? !s.has(c) : !!force;
    if (on) s.add(c);
    else s.delete(c);
    this._set(s);
    return on;
  }
  contains(c) {
    return this._get().has(c);
  }
}

class Text {
  constructor(t) {
    this.nodeType = 3;
    this.textContent = String(t);
    this.parentNode = null;
  }
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
}

class Element {
  constructor(tag) {
    this.nodeType = 1;
    this.tagName = String(tag).toUpperCase();
    this.className = '';
    this.classList = new ClassList(this);
    this.style = { setProperty(k, v) { this[k] = v; }, getPropertyValue(k) { return this[k] || ''; }, removeProperty(k) { delete this[k]; } };
    this.childNodes = [];
    this.parentNode = null;
    this.hidden = false;
    this.dataset = {};
    this.attrs = {};
    this.offsetWidth = 0;
    // canvases (textures the engine paints) draw into a do-anything stub
    this.width = 256;
    this.height = 256;
  }
  getContext() {
    return makeStub('ctx2d');
  }
  toDataURL() {
    return '';
  }
  get children() {
    return this.childNodes.filter((c) => c.nodeType === 1);
  }
  get firstChild() {
    return this.childNodes[0] || null;
  }
  get lastChild() {
    return this.childNodes[this.childNodes.length - 1] || null;
  }
  get childElementCount() {
    return this.children.length;
  }
  appendChild(c) {
    if (c.parentNode) c.parentNode.removeChild(c);
    c.parentNode = this;
    this.childNodes.push(c);
    return c;
  }
  append(...cs) {
    for (const c of cs) this.appendChild(typeof c === 'string' ? new Text(c) : c);
  }
  removeChild(c) {
    const i = this.childNodes.indexOf(c);
    if (i >= 0) this.childNodes.splice(i, 1);
    c.parentNode = null;
    return c;
  }
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
  get textContent() {
    return this.childNodes.map((c) => c.textContent).join('');
  }
  set textContent(v) {
    for (const c of this.childNodes) c.parentNode = null;
    this.childNodes = [];
    if (v !== '' && v !== null && v !== undefined) this.appendChild(new Text(v));
  }
  get innerHTML() {
    return this.childNodes.map(serialize).join('');
  }
  set innerHTML(html) {
    this.textContent = '';
    parseInto(this, String(html));
  }
  insertAdjacentHTML(pos, html) {
    parseInto(this, String(html));
  }
  setAttribute(k, v) {
    this.attrs[k] = String(v);
    if (k === 'class') this.className = String(v);
    else if (k === 'id') this.id = String(v);
    else if (k === 'style') this.style.cssText = String(v);
    else if (k.startsWith('data-')) this.dataset[k.slice(5)] = String(v);
    else this[k] = String(v);
  }
  getAttribute(k) {
    return k in this.attrs ? this.attrs[k] : null;
  }
  addEventListener() {}
  removeEventListener() {}
  scrollIntoView() {}
  focus() {}
  getBoundingClientRect() {
    return { left: 0, top: 0, right: 1280, bottom: 720, width: 1280, height: 720 };
  }
  /** Every descendant element, depth first. */
  all() {
    const out = [];
    const walk = (e) => {
      for (const c of e.children) {
        out.push(c);
        walk(c);
      }
    };
    walk(this);
    return out;
  }
  matches(sel) {
    // "tag", ".a", "tag.a.b"
    const m = /^([a-zA-Z0-9]*)((?:\.[\w-]+)*)$/.exec(sel.trim());
    if (!m) throw new Error('minidom: unsupported selector ' + sel);
    if (m[1] && this.tagName !== m[1].toUpperCase()) return false;
    return m[2].split('.').filter(Boolean).every((c) => this.classList.contains(c));
  }
  querySelectorAll(sel) {
    const parts = sel.trim().split(/\s+/);
    let set = [this];
    for (const p of parts) {
      const next = [];
      for (const root of set) for (const e of root.all()) if (e.matches(p) && !next.includes(e)) next.push(e);
      set = next;
    }
    return set;
  }
  querySelector(sel) {
    return this.querySelectorAll(sel)[0] || null;
  }
}

function serialize(n) {
  if (n.nodeType === 3) return n.textContent;
  const tag = n.tagName.toLowerCase();
  const cls = n.className ? ' class="' + n.className + '"' : '';
  return '<' + tag + cls + '>' + n.childNodes.map(serialize).join('') + '</' + tag + '>';
}

function parseInto(parent, html) {
  const re = /<!--[\s\S]*?-->|<\/([a-zA-Z0-9]+)\s*>|<([a-zA-Z0-9]+)((?:\s+[^\s=>/]+(?:\s*=\s*"[^"]*")?)*)\s*(\/?)>|([^<]+)/g;
  const stack = [parent];
  let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[1]) {
      if (stack.length > 1) stack.pop();
    } else if (m[2]) {
      const e = new Element(m[2]);
      const ar = /([^\s=]+)(?:\s*=\s*"([^"]*)")?/g;
      let a;
      while ((a = ar.exec(m[3] || ''))) e.setAttribute(a[1], a[2] === undefined ? '' : a[2]);
      top.appendChild(e);
      if (!m[4] && !VOID.has(m[2].toLowerCase())) stack.push(e);
    } else if (m[5]) top.appendChild(new Text(m[5]));
  }
}

function create() {
  const byId = new Map();
  const document = {
    createElement: (t) => new Element(t),
    createElementNS: (ns, t) => new Element(t),
    createTextNode: (t) => new Text(t),
    getElementById(id) {
      if (!byId.has(id)) {
        const e = new Element('div');
        e.id = id;
        byId.set(id, e);
      }
      return byId.get(id);
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener() {},
    removeEventListener() {},
    body: new Element('body'),
    head: new Element('head'),
    documentElement: new Element('html'),
    hidden: false,
    pointerLockElement: null,
    exitPointerLock() {},
  };
  return { document, Element };
}

module.exports = { create };
