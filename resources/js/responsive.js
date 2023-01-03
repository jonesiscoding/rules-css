let w = window;

class Viewport {
  // noinspection JSUnresolvedVariable
  mm = w.matchMedia || w.webkitMatchMedia || w.mozMatchMedia || w.oMatchMedia || w.msMatchMedia || false;

  /**
   * Performs a media match using the appropriate function for this browser.  If this browser has no media query
   * functionality, always returns false.
   *
   * @param   {string}   q    The media query to match.
   * @returns {boolean}
   */
  media(q) {
    return true === (this.mm && this.mm(q).matches);
  }

  breakpoint() {
    return getComputedStyle(document.documentElement).getPropertyValue('--viewport');
  }

  get touch() {
    return true === ( this.media( "(pointer:coarse)" ) || this.media( "screen and (-moz-touch-enabled)") );
  }

  /**
   * Returns the pixel width of the scrollbar.
   *
   * @returns {number}
   */
  get scrollbar() {
    let sb = document.createElement("div");
    sb.setAttribute("style","width:100px;height: 100px;overflow-y:scroll;position:absolute;top:-9999px;-ms-overflow-style:auto;");
    document.body.appendChild(sb);
    let width = sb.offsetWidth - sb.clientWidth;
    document.body.removeChild(sb);

    return width;
  }
}
