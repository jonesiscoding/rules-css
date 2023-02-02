
class Component {
  el;
  constructor(el) {
    this.el = el;
  }

  get id() {
    return this.el.id;
  }

  static with(el, options) {
    el.fn = el.fn || {};
    if (undefined === el.fn[this.name]) {
      Object.defineProperty(el.fn, this.name, { value: new this(el, options) });
    }

    return el.fn[this.name];
  }
}