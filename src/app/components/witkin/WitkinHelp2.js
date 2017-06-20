class WitkinHelpController {
  constructor($state) {
    this.$state = $state;
  }
  startTest() {
    this.$state.go('witkin-start', {id: 1});
  }
}

WitkinHelpController.$inject = ['$state'];

export const witkinHelp2 = {
  template: require('./WitkinHelp2.html'),
  controller: WitkinHelpController
};

