
class ToggleButton extends Toggle {
  static selector = '[aria-pressed]'

  constructor( el ) {
    super( el );

    let self = this;

    this.el.addEventListener('click', function(event) {
      self.toggle(!self.pressed);
      event.stopPropagation();
    })
  }

  get pressed() {
    return this.el.getAttribute('aria-pressed') === 'true';
  }

  toggle( state ) {
    this.el.setAttribute('aria-pressed', state ? "true" : "false");
    this.el.setAttribute('aria-expanded', state ? "true" : "false");

    this.targets.forEach(function(target) {
      target.toggle(state);
    });

    return this;
  }
}