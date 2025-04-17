
class TimeInput extends Component {
  static selector = 'input[type="time"]';

  val;
  step;
  timeout;
  dialog;
  select = { h: null, i: null, a: null };

  constructor(el) {
    super(el);

    let self = this;
    let isNative = self.el.getAttribute('data-native') === "true" || false;
    self.val = self.el.value;
    self.step = self.el.getAttribute( 'step' ) || 60;

    if(isNative) {
      el.addEventListener('keyup', e => { self.onKeyup(e); } );
      el.addEventListener('change', e => { self.onChange(e); } );
      el.addEventListener('click', e => { self.onClick(e); });
    }

    self.dialog = self.el.closest('div').querySelector('dialog');
    self.select.h = self.makeSelect({ min: 1, max: 12, step: 1});
    self.select.i = self.makeSelect({ min: 0, max: 59, step: this.step / 60 });
    self.select.a = self.makeSelect({ options: { 'am': 'am', 'pm': 'pm' }});
    self.dialog.append( self.select.h );
    self.dialog.append(self.select.i);
    self.dialog.append(self.select.a);
    self.el.addEventListener('click', e => {
      self.onClick(e);
    });
  };

  isPm() {
    return this.parse24Hr(this.el.value).h >= 12;
  }

  onClick(e) {
    this.dialog.setAttribute('open', 'open');
  };

  /**
   * @param {string} text
   * @param {string} value
   * @returns {HTMLOptionElement}
   */
  createOption(text, value) {
    let opt = document.createElement( 'option' );

    opt.text = text;
    opt.value = value;

    return opt;
  }

  /**
   * @param {object} options
   * @returns {HTMLSelectElement}
   */
  makeSelect(options) {
    let self = this;
    let sel = document.createElement("select");
    sel.add(this.createOption('--','--'));
    if(options.options) {
      Object.keys(options.options).forEach(function(key) {
        sel.add(self.createOption(options.options[key], key));
      });
    } else {
      for(let x = options.min || 0; x <= options.max; x = x + options.step) {
        let val = (x < 10) ? '0' + x : x;
        sel.add(this.createOption(val,val));
      }
    }

    sel.addEventListener('change', e => {
      self.onSelect(e);
    });

    return sel;
  };

  onKeyup(e) {
    let key = parseFloat(e.key);
    let self = this;
    if(e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && isNaN(key)) {
      self.onChange( e );
    } else {
      self.timeout = setTimeout(function() {
        self.onChange(e);
      }, 1800);
    }
  }

  onSelect(e) {
    let a = ( this.select.a.value !== '--' && this.select.a.value.length ) ? this.select.a.value : null;
    let h = ( this.select.h.value !== '--' && this.select.h.value.length ) ? this.select.h.value : null;
    let i = ( this.select.i.value !== '--' && this.select.i.value.length ) ? this.select.i.value : null;
    let s = ( this.select.s && this.select.s.value !== '--' && this.select.s.value.length ) ? this.select.s.value : '00';

    if ( a.length && i.length && (h && h.length) ) {
      if('12' === h) { h = "00"; }
      if ( 'am' !== a.toLowerCase() ) {
        let hh = 12 + parseInt(h,10);
        h = (hh === 24 && hh > 0) ? "0" : hh.toString();
      }

      this.val = this.el.value = [this.pad(h),this.pad(i), this.pad(s)].join(":");
      this.dialog.removeAttribute('open');
    } else if(!a && !h && !i) {
      this.val = this.el.value = '';
      this.dialog.removeAttribute('open');
    }
  }

  onChange(e) {
    if(!this.val || this.val !== this.el.value) {
      clearTimeout(this.timeout);
      this.val = this.el.value;
      let step = this.el.getAttribute( 'step' );
      let t = this.parse24Hr( this.el.value );
      if ( step && step > 60 && step < 3600 ) {
        let minStep = Math.floor( step / 60 );
        let corrected = Math.round(t.i / minStep) * minStep;
        if(corrected !== t.i) {
          this.el.value = [
            t.h.toString().padStart( 2, '0' ),
            corrected.toString().padStart( 2, '0' ),
            t.s.toString().padStart( 2, '0' )
          ].join(':');
        }
      }

      this.select.i.value = this.pad(t.i);
      if ( this.isPm() ) {
        this.select.h.value = t.h !== 12 ? this.pad((t.h - 12)) : '12';
        this.select.a.value = 'pm';
      } else {
        this.select.a.value = 'am';
        this.select.h.value = this.pad(t.h);
      }
    }
  }

  pad(val) {
    return typeof val === "string" ? val.padStart(2, '0') : val.toString().padStart(2, '0');
  }

  parse24Hr(val) {
    let s = val.split(':');
    return {
      h: parseInt( s[0] ),
      i: parseInt((s.length > 1) ? s[1] : 0),
      s: parseInt((s.length > 2) ? s[2] : 0),
    };
  }
}