
class Dialog extends Component {
  static selector = 'dialog';

  get isOpen() {
    if(this.el.hasAttribute('open')) {
      let openAttr = this.el.getAttribute('open');
      return ('false' !== openAttr && '0' !== openAttr);
    }

    return false;
  }

  get isMenu() {
    return this.el.getAttribute( 'role' ) === 'menu';
  }

  get content() {
    return this.el.querySelector('article');
  }

  toggle(state = null) {
    let newState = state || !this.isOpen();
    if(newState) {
      this.show();
    } else {
      this.close();
    }
  }

  show() {
    let self = this;
    let clb = self.el.querySelectorAll('button[aria-label="close" i]');
    clb.forEach(cb => { cb.addEventListener('click', _ => { self.close(); }); });
    document.addEventListener('click', function(event) {
      const content = self.content;
      const isInside = content && content.contains(event.target);
      !isInside && self.close();
    }, { once: self.isMenu });
    document.addEventListener('keydown', function(event) {
      if(27 === event.keyCode) {
        self.close();
        event.stopPropagation();
      }
    });
    self.el.dispatchEvent(new CustomEvent('rules.dialog.show'))
    self.el.show();
  }

  close() {
    this.el.close();
    this.el.dispatchEvent(new CustomEvent('rules.dialog.close'))
  }
}

class DialogToggle extends Toggle {
  static selector = '[aria-haspopup="dialog"]';

  toggleable = Dialog

  constructor( el ) {
    super( el );

    let self = this;

    this.el.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();
      self.toggle(true).targets.forEach(function(target) {
        target.show();
      });
    });
  }

  toggle( state ) {
    return super.toggle( state );
  }
}

class MenuToggle extends DialogToggle {
  static selector = '[aria-haspopup="menu"]'
}

class ConfirmToggle extends DialogToggle {
  static selector = '[aria-haspopup="alertdialog"]';

  constructor(el) {
    super(el);

    let self = this;

    this.targets.forEach(function(target) {
      let targetEl = target.el;
      let cancelButtons = targetEl.querySelectorAll( 'button[data-cancel]' );
      cancelButtons.forEach(function(cb) {
        cb.addEventListener('click', function(e) {
          target.close();
        });
      });

      let confirmButtons = targetEl.querySelectorAll( 'button[data-confirm]' );
      confirmButtons.forEach(function(cb) {
        cb.addEventListener('click', function(e) {
          let href = self.el.getAttribute('href');
          if(typeof href !== 'undefined') {
            // Go to the link
            window.location = href;
          } else {
            // Attempt to trigger the original action.
            self.dispatchEvent('click');
          }
        });
      });
    });
  }
}