
class Time extends Component {
  static selector = 'time[datetime]';

  constructor( el ) {
    super( el );

    let font =  window.getComputedStyle(el, null).fontSize;
    font = font === "0px" ? window.getComputedStyle(el.parentElement, null).fontSize : font;
    el.style.setProperty('--font-size-time', font);
    let date = Date.parse(el.getAttribute('datetime'));
    let sizes = ['xs','sm','md'];
    sizes.forEach(sz => {
      let attr = el.getAttribute('data-options-' + sz);
      if(attr) {
        let opt =  JSON.parse(attr.replace(/'/g, '"'));
        let fmt = Intl.DateTimeFormat('en-US', opt);
        el.setAttribute('data-' + sz, fmt.format(date));
      }
    });
  }
}
