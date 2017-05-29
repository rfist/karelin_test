class UserService {
  constructor() {
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
  getResults() {
    const results = {};
    results.user = this.user;
    results.assertions = this.assertions;
    results.selectedCircle = this.selectedCircle;
    results.witkin = this.witkin;
    return angular.toJson(results);
  }
  getFirstTestName() {
    return this.user.firstTest;
  }
}

export default UserService;

