class UserService {
  constructor() {
    this.lastWitkinTest = 0;
    this.lastNumber = 0;
    this.selectedCircle = 0;
    this.user = {firstTest: 'unknown', unregistered: true};
    this.assertions = {};
    this.witkin = {};
    this.id = 0;
    this.innerId = 0;
    this.lastState = '';
    this.loaded = false;
  }
  get currentNumber() {
    return this.lastNumber + 1;
  }
  setUser(user) {
    this.user = user;
  }
  getUser() {
    return this.user;
  }
  setCircle(cirlceNumber) {
    this.selectedCircle = cirlceNumber;
  }
  setWitkinTest(number, totalTime, selectedTime, countOfUsedHint, timeBeforeFirstClick) {
    this.witkin[number] = [totalTime, selectedTime, countOfUsedHint, timeBeforeFirstClick];
  }
  setWitkinHistory(number, wrongAnswers, rightAnswer, percent) {
    if (!this.witkin.history) {
      this.witkin.history = {};
    }
    this.witkin.history[number] = {wrongAnswers, rightAnswer, percent};
  }
  setAssertions(assertions) {
    this.assertions = assertions;
  }
  getCirclesResults() {
    const results = {};
    results.assertions = this.assertions;
    results.selectedCircle = this.selectedCircle;
    return angular.toJson(results);
  }
  getWitkinResults() {
    const results = {};
    results.witkin = this.witkin;
    return angular.toJson(results);
  }
  getFirstTestName() {
    return this.user.firstTest;
  }
  save() {
    localStorage.setItem('user', angular.toJson(this));
  }
  load() {
    if (!this.loaded) {
      Object.assign(this, angular.fromJson(localStorage.getItem('user')));
      this.loaded = true;
      console.log('load user', this);
    }
  }
  clear() {
    localStorage.removeItem('user');
    this.lastWitkinTest = 0;
    this.lastNumber = 0;
    this.selectedCircle = 0;
    this.user = {firstTest: 'unknown'};
    this.assertions = {};
    this.witkin = {};
    this.id = 0;
    this.innerId = 0;
    this.lastState = '';
    this.loaded = true;
  }
}

export default UserService;

