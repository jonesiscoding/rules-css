
class TabPanel extends Toggleable {
  static selector = '[role="tabpanel"]'
}

class Tab extends Toggle {
  static selector = '[role="tab"]:not([href])'

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