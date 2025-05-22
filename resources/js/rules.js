class Rules {
  static components = {
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
    time: Time,
    filters: FilterFieldset,
  };

  fn = {};

  constructor() {
    this.fn = Rules.components;
  }

  _build(key, selector = null) {
    let func = this.fn[key];
    if(typeof(func) == 'function') {
      let sel = selector || func.selector;
      if(sel) {
        document.querySelectorAll(sel).forEach(el => {
          func.with(el);
        });
      }
    }
  }

  start(keys = [], exclude = true) {
    let self = this;
    Object.keys(keys).forEach(key => {
      if(exclude ? !keys.includes(key) : keys.includes(key)) {
        self._build(key);
      }
    });
  }
}

( function ( w ) {
  w.rules = new Rules();
}( window ) );