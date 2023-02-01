
( function ( w, d ) {
  let rules = {
    tab: Tab,
    tabs: TabList,
    toggle: ToggleButton,
    dialog: DialogToggle,
    confirm: ConfirmToggle,
    menu: MenuToggle,
    clone: Clone,
    steps: ProgressSteps,
    trclick: TableRowClick,
    tooltip: Tooltip
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
  initialize('confirm');
  initialize( 'trclick' );
  initialize('tooltip');

  w.rules = rules;
}( window, document ) );