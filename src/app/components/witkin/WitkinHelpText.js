class WitkinHelpController {
  constructor($state) {
    this.$state = $state;
  }
  startTest() {
    this.$state.go('witkin-before-start', {id: 1});
  }
}

WitkinHelpController.$inject = ['$state'];

export const witkinHelpText = {
  template: require('./WitkinHelpText.html'),
  controller: WitkinHelpController
};

