

( function ( w, d ) {
  class Component {
    el;
    constructor(el) {
      this.el = el;
    }

    get id() {
      return this.el.id;
    }
  }

  class Toggle extends Component {
    toggleable = Toggleable;

    get targets() {
      let self = this;
      let tStr = this.el.getAttribute( 'aria-controls' ) || this.el.getAttribute( 'href' );
      tStr = tStr ? tStr.replace( '#', '' ) : null;
      let targets = [];
      if(tStr) {
        tStr.split( ' ' ).forEach(function(id) {
          let el = document.getElementById(id);
          if(el) {
            targets.push(new self.toggleable(el));
          }
        });
      }

      Object.defineProperty(this, 'targets', {
        value: targets,
        writable: false,
        configurable: false,
        enumerable: true
      });

      return targets;
    }

    /**
     * @param {boolean} state
     */
    toggle(state) {
      return this;
    }
  }

  class Toggleable extends Component {
    toggle(state) {
      if(state) {
        this.el.removeAttribute('hidden');
      } else {
        this.el.setAttribute('hidden', "true");
      }

      return this;
    }
  }

  class ToggleButton extends Toggle {
    static selector = '[aria-pressed]'

    constructor( el ) {
      super( el );

      let self = this;

      this.el.addEventListener('click', function(event) {
        self.toggle(!self.pressed);
        event.stopPropagation();
      })
    }

    get pressed() {
      return this.el.getAttribute('aria-pressed') === 'true';
    }

    toggle( state ) {
      this.el.setAttribute('aria-pressed', state ? "true" : "false");
      this.el.setAttribute('aria-expanded', state ? "true" : "false");

      this.targets.forEach(function(target) {
        target.toggle(state);
      });

      return this;
    }
  }

  class TabPanel extends Toggleable {
    static selector = '[role="tabpanel"]'
  }

  class Tab extends Toggle {
    static selector = '[role="tab"]'

    toggleable = TabPanel;

    toggle( state ) {
      super.toggle( state );

      this.el.setAttribute('aria-selected', state);

      this.targets.forEach(function(target) {

        target.toggle(state);
      });

      return this;
    }
  }

  class TabList extends Component {
    static selector = '[role="tablist"]';

    tabs = [];

    constructor( el ) {
      super( el );
      let self = this;
      this.el.querySelectorAll( Tab.selector ).forEach( function ( t ) {
        self.tabs.push( new Tab( t ) );
        t.addEventListener( 'click', function ( event ) {
          event.preventDefault();
          event.stopPropagation();
          self.select( t.id );
          t.dispatchEvent(new Event('shown.rules.tab', {}))
        } );
      } );
    }

    /**
     * @param {string} id
     */
    select( id ) {
      let selected;
      this.tabs.forEach( function ( tab ) {
        if(tab.id === id) {
          selected = tab;
        }
        tab.toggle( false );
      } );
      selected.toggle(true);
    }
  }

  class DialogToggle extends Toggle {
    static selector = '[aria-haspopup="dialog"]'

    toggleable = Dialog

    constructor( el ) {
      super( el );

      let self = this;

      this.el.addEventListener('click', function(event) {
        console.log( 'yep' );
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

  class Dialog extends Component {
    static selector = 'dialog';

    get isOpen() {
      if(this.el.hasAttribute('open')) {
        let openAttr = modal.getAttribute('open');
        return ('false' !== openAttr && '0' !== openAttr);
      }

      return false;
    }

    get isMenu() {
      return this.el.getAttribute( 'role' ) === 'menu';
    }

    get coklntent() {
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
      self.el.show();
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
    }

    close() {
      this.el.close();
    }
  }

  class Clone extends Component {
    static selector = 'label[role="button"]';

    /**
     * @returns {HTMLElement}
     */
    get target() {
      let tStr = this.el.getAttribute( 'aria-controls' ) || this.el.getAttribute( 'href' );
      tStr = tStr ? tStr.replace( '#', '' ) : null;
      return document.getElementById(tStr);
    }

    constructor( el ) {
      super( el );

      let self = this;

      this.el.addEventListener('click', function(event) {
        let revent = new event.constructor(event.type, event)
        self.target.dispatchEvent(revent);
        event.stopPropagation();
      })
    }
  }

  class Tooltip extends Component {
    static selector = "[title]:not(.-tipless)";

    constructor( el ) {
      super(el);

      let title = el.getAttribute('title') || null;
      if (title) {
        el.setAttribute('data-tooltip', title);
      }
    }
  }

  class ProgressSteps extends Component {
    static selector = "div.progress";

    constructor( el ) {
      super( el );
      let progress = this.el.querySelector("progress");
      let max = progress.getAttribute("max");
      this.el.style.setProperty("--progress-max-", max);
    }
  }

  let rules = {
    tab: Tab,
    tabs: TabList,
    toggle: ToggleButton,
    dialog: DialogToggle,
    menu: MenuToggle,
    clone: Clone,
    steps: ProgressSteps,
  };

  function initialize(key, selector = null) {
    let func = rules[key];
    if(typeof(func) == 'function') {
      let sel = selector || func.selector;
      if(sel) {
        d.querySelectorAll(sel).forEach(function(el) {
          Object.defineProperty(el, 'fn', { value: new func(el) });
        });
      }
    }
  }

  initialize( 'tabs' );
  initialize( 'toggle' );
  initialize( 'dialog' );
  initialize( 'menu' );
  initialize( 'clone' );
  initialize( 'steps' );

  w.rules = rules;
}( window, document ) );