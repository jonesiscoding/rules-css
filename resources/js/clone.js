
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
      if(event.target !== self.target && event.target.tagName !== "a" && event.target.tagName !== "button") {
        let revent = new event.constructor(event.type, event);
        self.target.dispatchEvent(revent);
        event.stopPropagation();
      }
    });
  }
}

class TableRowClick extends Clone {
  static selector = 'tr[data-click] td';

  get target() {
    return this.el.querySelector('td:first-child > a:first-child');
  }
}