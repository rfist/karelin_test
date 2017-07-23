class UserController {
  constructor($state, userService, $scope) {
    userService.load();
    this.userName = userService.user.name;
    this.$state = $state;
    this.userService = userService;
    $scope.isCirlcesComplete = false;
    $scope.$watch(() => this.userService.lastState,
      () => {
        $scope.isCirlcesComplete = this.userService.lastState !== '';
      }
    );
  }
  finishTest() {
    console.log('interrupt');
    toastr.options = {
      positionClass: 'toast-top-center',
      showDuration: 300,
      extendedTimeOut: 5000,
      timeOut: 5000
    };
    toastr.options.onclick = e => {
      console.log('clicked', e.target.id);
      if (e.target.id === 'okBtn') {
        this.reset();
      }
      if (e.target.id === 'stayBtn') {
        toastr.remove();
      }
    };
    toastr.warning('Ви впевнені, що бажаєте закінчити тестування? Весь прогрес буде втрачено. <br><br>' +
      '<div style="text-align: center;"><button type="button" id="stayBtn" class="btn btn-primary">Продовжити</button>&nbsp' +
      '<button type="button" id="okBtn" class="btn btn-primary">Закінчити</button>' +
      '</div>');
  }
  reset() {
    toastr.remove();
    this.userService.clear();
    this.$state.go('app');
    console.log('reset');
  }
}

UserController.$inject = ['$state', 'userService', '$scope'];

export const user = {
  template: require('./User.html'),
  controller: UserController
};

