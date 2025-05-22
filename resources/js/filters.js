class FilterInput extends Component {
  targetEl;
  attribute = "data-match";
  radio = false;
  rule = "";
  prefix = "data";

  get value() {
    return this.el.value;
  }

  get checked() {
    return this.el.checked;
  }

  constructor(el) {
    super(el);

    this.radio  = this.el.type === "radio";
    this.not    = this.el.hasAttribute('data-not');
    this.only   = this.el.hasAttribute('data-only');
    this.name   = this.el.getAttribute("name");
    this.target = this.el.getAttribute('aria-controls');
    this.targetEl = this.el.form.querySelector(this.target);

    if (this.el.hasAttribute('data-attribute')) {
      this.attribute = this.el.getAttribute("data-attribute");
    }

    if (this.only) {
      this.prefix = "data-only";
      this.rule = this.target + `[${this.prefix}-${this.value}] > tbody > tr:not([${this.attribute}~="${this.value}"]) { display: none; }`;
    } else if (this.not) {
      this.prefix = "data-not";
      this.rule = this.target + `[${this.prefix}-${this.value}] > tbody > tr[${this.attribute}~="${this.value}"] { display: none; }`;
    } else {
      this.rule = this.target + `[${this.prefix}-${this.value}] > tbody > tr:not([${this.attribute}~="${this.value}"]) { display: none; }`;
    }
  }

  clear(input) {
    if (!this.radio || input.name === this.name) {
      this.targetEl.toggleAttribute(`${this.prefix}-${this.value}`, false);
    }
  }

  toggle(input) {
    if (this.radio) {
      if (this.name === input.getAttribute('name')) {
        this.toggleRadio(this.targetEl);
      }
    } else {
      this.toggleCheckbox(this.targetEl, input.value);
    }
  }

  toggleCheckbox(targetEl) {
    let val = this.value;
    if ((this.only && val) || (this.not && val) || (!this.only && !this.not)) {
      targetEl.toggleAttribute(`${this.prefix}-${val}`, this.checked);
    }
  }

  toggleRadio(targetEl) {
    let val = this.value;
    if (val !== "") {
      targetEl.toggleAttribute(`${this.prefix}-${val}`, this.checked);
    }
  }
}

class FilterFieldset extends Component {
  static selector = 'form fieldset.filters';

  timing = { interval: 100, timeout: 5000 }
  toggles = [];
  rows = [];
  form;
  table;
  container;
  counter;

  constructor(el, options) {
    super(el);

    this.form = options.form ?? this.el.closest('form');
    if(options.table) {
      this.table = options.table;
    } else {
      let controls = options.controls ?? this.el.getAttribute("aria-controls") ?? "table";
      this.table = this.form.querySelector(controls);
    }

    this.container = this.table.closest("section, article") || this.table;
    this.rows = this.table.querySelectorAll('& > tbody > tr');
    this.counter = this.form.querySelector('.filters-count > span');

    if(options.timing) {
      this.timing = options.timing;
    }

    let styleEl = document.createElement("style");
    document.head.appendChild(styleEl);

    let self = this;
    this.el.querySelectorAll('input').forEach(input => {
      let toggle = FilterInput.with(input);

      if (toggle.radio && toggle.value === "") {
        toggle.el.addEventListener("input", (e) => {
          return self.clear(toggle);
        });
      } else {
        styleEl.sheet.insertRule(toggle.rule);
        toggle.el.addEventListener("input", (e) => {
          return self.toggle(toggle);
        })
      }

      this.toggles.push(toggle);
    });
  }

  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  count() {
    let self = this;
    let count = 0;
    self.rows.forEach(row => {
      if (self.isVisible(row)) {
        count++;
      }
    });
    return count;
  }

  hide() {
    let self = this;
    let tbody = self.table.querySelectorAll('tbody');
    tbody = tbody ? Array.from(tbody) : tbody;

    this.container.setAttribute("aria-busy", "true");

    return new Promise((resolve) => {
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const allHidden = tbody.every(element => {
          return !element || !self.isVisible(element);
        });

        if (allHidden) {
          clearInterval(checkInterval);
          resolve();
        } else if (self.timing.timeout && (Date.now() - startTime) > self.timing.timeout) {
          clearInterval(checkInterval);
          resolve(false); // Indicate timeout
        }
      }, self.timing.interval);
    });
  }

  show() {
    let self = this;
    let tbody = self.table.querySelectorAll('tbody');
    tbody = tbody ? Array.from(tbody) : tbody;
    this.container.removeAttribute("aria-busy");

    return new Promise((resolve) => {
      const startTime = Date.now();
      const checkInterval = setInterval(() => {
        const allShown = tbody.every(element => {
          return element && self.isVisible(element);
        });

        if (allShown) {
          clearInterval(checkInterval);
          self.form.querySelector('.table-filter-count > span').innerText = self.count();
          resolve();
        } else if (self.timing.timeout && (Date.now() - startTime) > self.timing.timeout) {
          clearInterval(checkInterval);
          self.form.querySelector('.table-filter-count > span').innerText = self.count();
          resolve(false); // Indicate timeout
        }
      }, self.timing.interval);
    });
  }

  clear(input) {
    let self = this;
    self.hide().then(() => {
      self.toggles.forEach(t => {
        t.clear(input);
      });
    }).finally(() => {
      return self.show();
    });
  }

  toggle(input) {
    let self = this;
    return self.hide().then(() => {
      if (input.type === "radio") {
        self.toggles.forEach(t => {
          t.toggle(input)
        });
      } else {
        input.toggle(input);
      }
    }).finally(() => {
      return self.show();
    });
  }
}
