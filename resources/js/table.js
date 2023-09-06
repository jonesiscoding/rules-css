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
    let th = thead.children.item(this.index)
    if(th !== null) {
      return th.textContent || th.innerText;
    } else {
      return 'col' + this.index;
    }
  }

  get text() {
    return this.el.textContent || this.el.innerText;
  }

  get data() {
    let data = {};
    let ds = ( typeof this.el.dataset === 'object' ) ? this.el.dataset : {};
    Object.keys(ds).forEach(function(trait) {
      if ( ds[ trait ] ) {
        data[trait] = ds[trait];
      }
    });

    if(!data.hasOwnProperty('text')) {
      data['text'] = this.text;
    }
  }
}

class Tr extends TableElement {
  static selector = "tr";

  get cells() {
    let cellElements = this.el.querySelectorAll("td");
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
    Object.keys(ds).forEach(function(trait) {
      if ( ds[ trait ] ) {
        data[trait] = ds[trait];
      }
    });

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
    Object.keys(data).forEach(function(trait) {
      if(data[trait] && data[trait].toLowerCase().indexOf(qq) >= 0) {
        has = true;
        return null;
      }
    });

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

  options = { animateFor: 600, filtered: '-filtered', sorted: '-sorted', matched: '-match' }
  sortKey = "none";

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
    let sorters = table.el.querySelectorAll("[aria-sort]")
    sorters.forEach(cell => {
      let key = cell.text || 'col' + cell.index;
      cell.addEventListener('click', event => {
        sorters.forEach(sib => {
          sib.setAttribute("aria-sort", "none");
        });
        cell.setAttribute('aria-sort', 'ascending');
        table.sort(key);
      });
    });
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
    if(t !== null) {
      return new THead(t);
    }
  }

  get foot() {
    let tfoot = this.el.querySelector("tfoot");
    if(tfoot !== null) {
      return new TFoot(tfoot);
    }
  }

  filter(q) {
    if(q) {
      let cls = this.options.matched;
      this.body.rows.forEach(row => {
        row.el.classList.toggle( cls, row.search( q ) );
      });
      this.el.classList.add( this.options.filtered );
    } else {
      this.el.classList.remove(this.options.filtered);
    }
  }

  sort(sortKey) {
    let table = this;
    if ( table.sortKey !== sortKey ) {
      table.el.classList.add('fade');
      setTimeout( function () {
        if ( !sortKey ) {
          table.body.rows.forEach(row => {
            // remove CSS order
            row.style.order = null;
          });
          table.el.classList.remove(table.options.sorted);
          table.sortKey = null;
        } else {
          table.el.classList.add(table.options.sorted);
          table.sortKey = sortKey;
          // Need to trigger event
          let sorted = table.body.rows
          sorted.sort(function(a,b) {
            let aCrit = a.get(sortKey) || "";
            let bCrit = b.get(sortKey) || "";

            // If the same, fall back to first column with data
            if ( aCrit === bCrit ) {
              for(let x = 0; x < a.cells.length; x++) {
                var tCrit = a.cells[x] || "";
                if ( tCrit !== "" ) {
                  aCrit = tCrit;
                  bCrit = b.cells[x] || "";
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
          });

          for(let sx=0; sx < sorted.length; sx++ ) {
            let order = sx - sorted.length - 100;
            sorted[sx].style.order = String(order);
          }
        }

        setTimeout( function () {
          table.el.classList.add('in');
        }, table.options.animateFor );
      }, table.options.animateFor );
    }
  }
}