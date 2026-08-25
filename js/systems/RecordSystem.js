class RecordSystem extends Phaser.Events.EventEmitter {
  constructor() {
    super();
    this.STORAGE_KEY = 'shooting_stars_hiScore';
    const stored = localStorage.getItem(this.STORAGE_KEY);
    this.highScore = stored ? parseInt(stored, 10) || 0 : 0;
  }

  get highScore() {
    return this._highScore;
  }

  set highScore(v) {
    this._highScore = v;
  }

  submit(score) {
    if (score > this.highScore) {
      this.highScore = score;
      localStorage.setItem(this.STORAGE_KEY, String(score));
      this.emit('new-record', score);
      return true;
    }
    return false;
  }
}