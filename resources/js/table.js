class TableElement extends Component {
  get index() {
    return Array.from(this.el.parentNode.children).indexOf(this.el);
  }
}

class Td extends TableElement {
  static selector = "td";

  get header() {
    let table = this.el.closest("table");
    let thead = table.querySelector("thead");
    let tr = thead.querySelector("tr");
    let th = tr.children.item( this.index );
    if(th !== null) {
      return th.textContent || th.innerText || "col" + this.index;
    } else {
      return 'col' + this.index;
    }
  }

  get text() {
    let text = this.el.textContent || this.el.innerText;
    let abbr = this.el.querySelector('abbr');
    if(abbr) {
      let title = abbr.hasAttribute('title') ? abbr.getAttribute('title') : abbr.getAttribute('data-tooltip');
      if(null !== title && undefined !== title) {
        text = text + ' ' + title;
      }
    }

    return text.trim();
  }

  get data() {
    let data = {};
    let ds = ( typeof this.el.dataset === 'object' ) ? this.el.dataset : {};
    Object.keys(ds).forEach( trait => {
      if ( ds[ trait ] ) {
        data[trait] = ds[trait];
      }
    } );

    if(!data.hasOwnProperty('text')) {
      data['text'] = this.text;
    }
  }
}

class Tr extends TableElement {
  static selector = "tr";

  /**
   * Stores the original row index in the data-order attribute for later reference as nodes are re-ordered on sort.
   *
   * @param {HTMLElement} el
   */
  constructor(el) {
    super(el);

    // Store the original sort order in the attributes for later reference, as the object is destroyed on sort
    if(!this.el.hasAttribute('data-index')) {
      this.el.setAttribute('data-index', Array.from(this.el.parentNode.children).indexOf(this.el));
    }
  }

  /**
   * Returns the original order of this row within the tbody.
   *
   * @returns {number}
   */
  get order() {
    return parseFloat( this.el.getAttribute( 'data-index' ) );
  }

  get cells() {
    let cellElements = this.el.querySelectorAll("td, th");
    let cells = [];
    cellElements.forEach(cell => {
      cells.push(new Td(cell));
    });

    return cells;
  }

  /**
   * @returns {{}}
   */
  get data() {
    let data = {}
    let ds = ( typeof this.el.dataset === 'object' ) ? this.el.dataset : {};
    Object.keys(ds).forEach( trait => {
      if ( ds[ trait ] ) {
        data[trait] = ds[trait];
      }
    } );

    this.cells.forEach(cell => {
      let key = cell.header
      if(!data.hasOwnProperty(key)) {
        data[key] = cell.text;
      }
    });

    return data;
  }

  search(q) {
    let has  = false;
    let data = this.data
    let qq = q.toLowerCase();
    Object.keys(data).forEach( trait => {
      if(data[trait] && data[trait].toLowerCase().indexOf(qq) >= 0) {
        has = true;
        return null;
      }
    } );

    return has;
  }

  get(key) {
    if ( key && this.data.hasOwnProperty( key ) ) {
      return this.data[key];
    } else {
      return null
    }
  }
}

class TableSection extends TableElement {
  get rows() {
    let rowElements = this.el.querySelectorAll("tr");
    let rows = [];
    rowElements.forEach(row => {
      rows.push(new Tr(row));
    });

    return rows;
  }
}

class THead extends TableSection {
  static selector = "thead";
}

class TBody extends TableSection {
  static selector = "tbody";
}

class TFoot extends TableSection {
  static selector = "tfoot";
}

class Table extends Component {
  static selector = "table";

  options = { animateFor: 600, sorted: '-sorted' }
  sortKey = "none";
  sortOrder = "none";

  constructor( el ) {
    super( el );

    let table = this;

    // Prepare table for responsive, sorting, filtering
    let allGroups = table.el.querySelectorAll("thead, tbody, tfoot");
    let allRows = table.el.querySelectorAll("tr");
    let allCells = table.el.querySelectorAll("td");
    let allHeaders = table.el.querySelectorAll("th");
    allGroups.forEach(group => { group.setAttribute("role", "rowgroup" )});
    allRows.forEach(row => { row.setAttribute("role", "row" )});
    allCells.forEach(cell => { cell.setAttribute("role", "cell" )});
    allHeaders.forEach(header => { header.setAttribute("role", "columnheader" )});

    // Add EventListener for Sorting
    let sorters = [];
    if(table.head !== null) {
      table.head.rows.forEach(row => {
        row.cells.forEach(cell => {
          if ( cell.el.hasAttribute( "aria-sort" ) ) {
            sorters.push(cell);
          }
        })
      });
      sorters.forEach(cell => {
        let key = cell.text || 'col' + cell.index;
          cell.el.addEventListener('click', _ => {
            let order;
            switch(cell.el.getAttribute("aria-sort")) {
              case "none":
                order = "ascending";
                break;
              case "ascending":
                order = "descending";
                break;
              default:
                order = "none";
            }
          sorters.forEach(sib => {
              sib.el.setAttribute("aria-sort", "none");
          });

          if(order !== "none") {
            cell.el.setAttribute('aria-sort', order );
            table.sort(key, order);
          } else {
            table.sort(null, order);
          }
        });
      });
    }
  }

  /**
   * @returns {TBody}
   */
  get body() {
    let t = this.el.querySelector("tbody");
    if(t !== null) {
      return new TBody(t);
    }
  }

  get head() {
    let t = this.el.querySelector("thead");

    return t !== null ? new THead(t) : null;
  }

  get foot() {
    let tfoot = this.el.querySelector("tfoot");
    if(tfoot !== null) {
      return new TFoot(tfoot);
    }
  }

  filter(q) {
    this.body.rows.forEach(row => {
      row.el.toggleAttribute('hidden', q ? !row.search(q) : false);
    });
  }

  sort(sortKey, order) {
    let sortOrder = order || "ascending"
    let table = this;
    if ( table.sortKey !== sortKey || sortOrder !== table.sortOrder ) {
      table.body.el.setAttribute('aria-busy', "true");
      let sorted = table.body.rows;
      setTimeout( () => {
        if ( !sortKey ) {
          table.el.classList.remove(table.options.sorted);
          table.sortKey = null;
          table.sortOrder = null;
          sorted.sort( ( a, b ) => {
            if ( a.order === b.order ) { return 0; }
            return (a.order > b.order) ? 1 : -1;
          } );
        } else {
          table.el.classList.add(table.options.sorted);
          table.sortKey = sortKey;
          table.sortOrder = sortOrder;
          // Need to trigger event
          sorted.sort( ( a, b ) => {
            let aCrit = a.get(sortKey) || "";
            let bCrit = b.get(sortKey) || "";

            // If the same, fall back to first column with data
            if ( aCrit === bCrit ) {
              for(let x = 0; x < a.cells.length; x++) {
                let tCrit = a.cells[ x ].text || "";
                if ( tCrit !== "" ) {
                  aCrit = tCrit;
                  bCrit = b.cells[x].text || "";
                }
              }
            }

            if ( aCrit === "false" && bCrit !== "false" ) { return 1; }
            if ( aCrit !== "false" && bCrit === "false" ) { return -1; }
            if ( aCrit === bCrit ) { return 0; }

            // Convert to Numbers (if applicable)
            let aNum = aCrit.replace(',','') / 1;
            let bNum = bCrit.replace(',','') / 1;
            aCrit = ( isNaN( aNum ) ) ? aCrit.toLowerCase() : aNum;
            bCrit = ( isNaN( bNum ) ) ? bCrit.toLowerCase() : bNum;

            return (aCrit > bCrit) ? 1 : -1;
          } );

          if(sortOrder !== "ascending") {
            sorted = sorted.reverse();
          }
        }

        table.body.el.innerHTML = '';
        for(let sx=0; sx < sorted.length; sx++ ) {
          table.body.el.appendChild(sorted[sx].el);
        }

        setTimeout( () => { table.body.el.removeAttribute('aria-busy'); }, table.options.animateFor );
      }, table.options.animateFor );
    }
  }
}

/**
 * @property input {SearchInput}
 */
class TableFilter extends Component {
  static selector = "input[type=search][aria-controls^=table]";

  input;

  get _controls() {
    return this.el.getAttribute('aria-controls');
  }

  get target() {
    return this.el.closest('form').querySelector(this._controls);
  }

  constructor(el) {
    super(el);
    let self = this;
    self.input  = new SearchInput(el, { search: q => { self.filter(q); }, clear: () => { self.clear(); } });
  }

  filter(q) {
    this.target.fn['Table'].filter(q);
  }

  clear() {
    this.target.fn['Table'].filter();
  }
}