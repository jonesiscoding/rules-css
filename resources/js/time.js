( function ( w, d ) {
  function TimeInput(el) {
    let input = this;
    let dialogEl = el.parentNode.querySelectorAll('dialog')[0];
    let dialog = new TimeDialog(dialogEl);

    dialog.el.addEventListener('shown', onOpen);
    dialog.el.addEventListener('closed', onClose);

    function onOpen(event) {
      let time = _parseTime(input.el.value);
      dialog.h.value = time.h;
      dialog.i.value = _padTime(time.i);
      if(time.a === 'pm') {
        dialog.am.setAttribute('aria-pressed', "false");
        dialog.pm.setAttribute('aria-pressed', "true");
      } else {
        dialog.am.setAttribute('aria-pressed', "true");
        dialog.pm.setAttribute('aria-pressed', "false");
      }
    }

    function onClose(event) {
      let h = dialog.h.value;
      let i = dialog.i.value;
      // noinspection EqualityComparisonWithCoercionJS
      if(12 == h) { h = "0"; }
      // noinspection EqualityComparisonWithCoercionJS
      if(dialog.pm.getAttribute('aria-pressed') == "true") {
        let hh = 12 + parseInt(h,10);
        h = (hh === 24 && hh > 0) ? "0" : hh.toString();
      }
      input.el.value = [_padTime(h),_padTime(i)].join(':');
    }

    /**
     * @param {string|int|null} val
     * @returns {string}
     */
    function _padTime(val) {
      if(val === 0 || val === null) {
        return "00";
      } else {
        let str = val.toString();

        return (str.length < 2) ? "0" + str.toString() : str;
      }
    }

    function _parseTime(val) {
      let s = val.split(':');
      let h = parseInt(s[0]) || 0;
      let a = 'am';

      if(h >= 12) {
        h = (h === 12) ? 12 : h - 12;
        a = 'pm';
      } else if(0 === h) {
        h = 12;
      }

      return {
        h: h,
        i: parseInt((s.length > 1) ? s[1] : 0),
        s: parseInt((s.length > 2) ? s[2] : 0),
        a: a
      };
    }

    this.el = el;
  }

  function TimeDialog(el) {
    function _onMeridiem(event) {
      let target = event.target;
      let parent = target.parentElement;
      let siblings = parent.querySelectorAll("[aria-pressed]");
      siblings.forEach(function(sibling) {
        if ( sibling !== target ) {
          sibling.setAttribute('aria-pressed', "false");
        } else {
          sibling.setAttribute('aria-pressed', "true");
        }
      });
    }

    this.el = el;
    this.h = el.querySelectorAll('input[type="number"][aria-label="hour"]')[0];
    this.i = el.querySelectorAll('input[type="number"][aria-label="minute"]')[0];
    this.am = el.querySelectorAll('button[value="am"]')[0];
    this.pm = el.querySelectorAll('button[value="pm"]')[0];
    this.am.addEventListener('click', _onMeridiem);
    this.pm.addEventListener('click', _onMeridiem);
  }

  document.querySelectorAll('input[type="time"]').forEach(function(inputEl) {
    Object.defineProperty(inputEl, 'fn', { value: new TimeInput(inputEl) });
  })
}(window, document));