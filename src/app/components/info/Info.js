class InfoController {
  constructor($state) {
    this.$state = $state;
  }
  startTest() {
    this.$state.go('survey1');
  }
}

InfoController.$inject = ['$state'];
export const info = {
  template: require('./Info.html'),
  controller: InfoController
};

