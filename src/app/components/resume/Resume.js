class ResumeController {
  constructor($state, userService) {
    this.$state = $state;
    this.lastStep = 1;
    if (userService.witkin && !R.isEmpty(userService.witkin)) {
      this.lastStep = userService.lastWitkinTest; // Math.max.apply(null, R.map(x => parseInt(x, 10), R.keys(R.omit(['history'], userService.witkin))));
    }
  }
  startTest() {
    this.$state.go('witkin-start', {id: this.lastStep});
  }
}

ResumeController.$inject = ['$state', 'userService'];
export const resume = {
  template: require('./Resume.html'),
  controller: ResumeController
};

