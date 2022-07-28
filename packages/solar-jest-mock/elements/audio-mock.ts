class Player {
  private element: HTMLVideoElement

  private duration: number

  private progress: number

  private intervalId: any

  constructor(dom: HTMLElement) {
    this.element = dom as any;
    this.duration = navigator.userAgent === 'OldBrowser' ? undefined : 3.22;
    this.progress = 0;
    const element2 = this.element as any;
    setTimeout(() => {
      element2.duration = this.duration;
      this.dispatch('loadedmetadata', { duration: this.duration });
    }, 100);
  }

  dispatch(name: string, data?: any) {
    let event = new Event(name);
    event = Object.assign(event, data);
    this.element.dispatchEvent(event);
  }

  play() {
    const offset = 100;
    this.dispatch('play');
    const total = this.duration * 1000;
    this.intervalId = setInterval(() => {
      this.progress = this.progress + offset;
      this.dispatch('playing');
      this.dispatch('progress');
      if (this.progress >= total) {
        this.dispatch('ended');
        clearInterval(this.intervalId);
      }
    }, offset);
  }

  pause() {
    clearInterval(this.intervalId);
    this.dispatch('pause');
  }
}

export default function() {
  const div = document.createElement('div') as any;
  const player = new Player(div);

  div.play = function() {
    player.play();
  };

  div.pause = function() {
    player.pause();
  };
  return div;
}
