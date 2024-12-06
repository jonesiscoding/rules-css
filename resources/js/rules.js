
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
    tooltip: Tooltip,
    table: Table,
    timeInput: TimeInput,
    time: Time
  };

  function initialize(key, selector = null) {
    let func = rules[key];
    if(typeof(func) == 'function') {
      let sel = selector || func.selector;
      if(sel) {
        d.querySelectorAll(sel).forEach(function(el) {
          func.with(el)
        });
      }
    }
  }

  Object.keys(rules).forEach(k => { initialize(k); });

  w.rules = rules;
}( window, document ) );