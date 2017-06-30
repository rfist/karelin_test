class MainController {
  constructor($scope, $state, userService, $window) {
    this.$scope = $scope;
    this.$state = $state;
    this.userService = userService;
    this.$window = $window;
    this.id = -1;
    this.connectToServer();
    console.log('service test');
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
    const user = {
      name: this.$scope.name,
      sex: this.$scope.sex,
      age: this.$scope.age,
      education: this.$scope.education,
      occupation: this.$scope.occupation,
      marital: this.$scope.marital,
      city: this.$scope.city,
      email: this.$scope.email,
      id: this.id,
      time: moment().valueOf()
    };
    user.firstTest = 'circles'; // now circles always is first
    // if (this.firstTest === 'witkin') {
    //   user.firstTest = 'circles';
    // } else {
    //   user.firstTest = 'witkin';
    // }
    this.userService.setUser(user);
    const data = 'data=' + angular.toJson(user) + '&id=' + this.id + '&date=' + moment().valueOf() + '&first_test=' + this.userService.getFirstTestName();
    this.xhr.open('POST', 'http://karelin.s-host.net/php/add.php', true);
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
      console.log('user start', user.firstTest);
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

