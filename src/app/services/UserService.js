class UserService {
  constructor() {
    this.lastWitkinTest = 0;
    this.lastNumber = 0;
    this.selectedCircle = 0;
    this.user = {firstTest: 'unknown'};
    this.assertions = {};
    this.witkin = {};
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
  setWitkinTest(number, totalTime, selectedTime) {
    this.witkin[number] = [totalTime, selectedTime];
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
}

export default UserService;

