class ScoreSystem {
  constructor() {
    this.score = 0;
    this.kills = 0;
  }

  add(points) {
    this.score += points;
    this.kills += 1;
  }

  spend(amount) {
    if (this.score < amount) return false;
    this.score -= amount;
    return true;
  }
}