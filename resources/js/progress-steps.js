
class ProgressSteps extends Component {
  static selector = "div.progress";

  constructor( el ) {
    super( el );
    let progress = this.el.querySelector("progress");
    let max = progress.getAttribute("max");
    this.el.style.setProperty("--progress-max-", max);
  }
}