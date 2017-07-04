class CirclesTestController {
  constructor($state, userService) {
    this.$state = $state;
    this.userService = userService;
    this.selected = 0;
  }
  select(number) {
    this.selected = number;
  }
  nextTest() {
    if (this.selected !== 0) {
      this.userService.setCircle(this.selected);
      this.$state.go('assertions');
    }
  }
  finishTest() {
    // TODO: rejected test
    this.$state.go('end');
  }
}

CirclesTestController.$inject = ['$state', 'userService'];

export const circlesTest = {
  template: require('./CirclesTest.html'),
  controller: CirclesTestController
};

