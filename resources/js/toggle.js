
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