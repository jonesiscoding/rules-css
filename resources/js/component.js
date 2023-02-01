
class Component {
  el;
  constructor(el) {
    this.el = el;
  }

  get id() {
    return this.el.id;
  }
}