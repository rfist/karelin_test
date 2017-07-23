class MainController {
  constructor($scope, $state, userService, $window) {
    this.$scope = $scope;
    this.$state = $state;
    this.userService = userService;
    this.$window = $window;
    this.id = -1;
    this.connectToServer();
    this.checkState();
    console.log('service test', this.$state.current.name);
  }
  checkState() {
    this.userService.load();
    if (this.userService.lastState !== '' && this.userService.lastState !== this.$state.current.name) {
      this.$state.go(this.userService.lastState);
    }
  }
  connectToServer() {
    if (this.$window.XMLHttpRequest) { // Mozilla, Safari, ...
      this.xhr = new XMLHttpRequest();
    } else if (this.$window.ActiveXObject) { // IE 8 and older
// eslint-disable-next-line no-undef
      this.xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    const data = 'command=get_info';
    this.xhr.open('POST', 'http://karelin.s-host.net/php/db.php', true);
    this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    this.xhr.send(data);
    const prom = new Promise(resolve => {
      this.xhr.onreadystatechange = () => {
        if (this.xhr.readyState === 4 && this.xhr.status === 200) {
          resolve(angular.fromJson(this.xhr.responseText));
        }
      };
    });
    prom.then(result => {
      const lastNumber = Math.max.apply(this, R.pluck('id')(result));
      this.id = lastNumber + 1;
      console.log('user id', this.id);
    });
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
    // if (this.firstTest === 'witkin') {
    //   user.firstTest = 'circles';
    // } else {
    //   user.firstTest = 'witkin';
    // }
    this.userService.setUser(user);
    const data = 'data=' + angular.toJson(user) + '&inner_id=' + this.userService.innerId + '&date=' + moment().valueOf() + '&first_test=' + this.userService.getFirstTestName();
    this.xhr.open('POST', 'http://karelin.s-host.net/php/register.php', true);
    this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    this.xhr.send(data);
    console.log('data', data);
    const prom = new Promise(resolve => {
      this.xhr.onreadystatechange = () => {
        if (this.xhr.readyState === 4 && this.xhr.status === 200) {
          resolve(this.xhr.responseText);
        }
      };
    });
    prom.then(result => {
      console.log('save results to server', result);
      result = angular.fromJson(result);
      this.userService.id = result[0].id;
      console.log('user', this.userService.id, user.firstTest);
      this.userService.lastState = user.firstTest;
      this.userService.save();
      this.$state.go(user.firstTest);
    });
    // this.$state.go('witkin', {id: 1});
  }
}
MainController.$inject = ['$scope', '$state', 'userService', '$window'];

export const main = {
  template: require('./Main.html'),
  controller: MainController
};

