
class Tooltip extends Component {
  static selector = "[title]:not(.-tipless)";

  constructor( el ) {
    super(el);

    let title = el.getAttribute('title') || null;
    if (title) {
      el.setAttribute('data-tooltip', title);
    }
  }
}