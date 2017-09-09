class WitkinHelpController {
  constructor($state, $scope) {
    this.$state = $state;
    this.$scope = $scope;
    $scope.theBestVideo = 'pr9ehzEodw4';

    $scope.$on('youtube.player.ended', () => {
      console.log('youtube.player.ended');
      $scope.isVideoWatched = true;
      // $scope.$digest();
    });
  }
  startTest() {
    this.$state.go('witkin-before-start', {id: 1});
  }
}

WitkinHelpController.$inject = ['$state', '$scope', '$timeout'];

export const witkinHelp = {
  template: require('./WitkinHelp.html'),
  controller: WitkinHelpController
};

