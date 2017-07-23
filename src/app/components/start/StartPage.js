class StartPageController {
  constructor($scope, $state, userService, $window) {
    this.$scope = $scope;
    this.$state = $state;
    this.userService = userService;
    this.$window = $window;
    this.checkState();
    console.log('service test', this.$state.current.name);
  }

  checkState() {
    this.userService.load();
    if (this.userService.lastState !== '' && this.userService.lastState !== this.$state.current.name) {
      this.$state.go(this.userService.lastState);
    }
  }

  startTest() {
    this.userService.innerId = moment().valueOf() + '_' + Math.floor((Math.random() * 1000) + 1);
    const user = {
      name: this.$scope.name,
      sex: this.$scope.sex,
      age: this.$scope.age,
      education: this.$scope.education,
      occupation: this.$scope.occupation,
      marital: this.$scope.marital,
      city: this.$scope.city,
      email: this.$scope.email,
      time: moment().valueOf()
    };
    user.firstTest = 'circles'; // now circles always is first
    this.userService.setUser(user);
    this.$state.go(user.firstTest);
  }
}
StartPageController.$inject = ['$scope', '$state', 'userService', '$window'];

export const startPage = {
  template: require('./StartPage.html'),
  controller: StartPageController
};

