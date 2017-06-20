class MainController {
  constructor($scope, $state, userService, $window) {
    this.$scope = $scope;
    this.$state = $state;
    this.userService = userService;
    this.$window = $window;
    this.text = 'My brand new component!';
    this.connectToServer();
    console.log('service test');
  }
  connectToServer() {
    let xhr;
    if (this.$window.XMLHttpRequest) { // Mozilla, Safari, ...
      xhr = new XMLHttpRequest();
    } else if (this.$window.ActiveXObject) { // IE 8 and older
// eslint-disable-next-line no-undef
      xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    const data = 'command=get_info';
    xhr.open('POST', 'http://karelin.s-host.net/php/db.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(data);
    const prom = new Promise(resolve => {
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
          resolve(angular.fromJson(xhr.responseText));
        }
      };
    });
    prom.then(result => {
      const lastNumber = Math.max.apply(this, R.pluck('id')(result));
      const isLast = n => n.id === lastNumber;
      this.firstTest = R.filter(isLast, result)[0].first_test;
      console.log('result', result);
      console.log('firstTest', this.firstTest);
      console.log('last number', lastNumber);
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
      time: moment().valueOf()
    };
    user.firstTest = 'circles'; // now circles always is first
    // if (this.firstTest === 'witkin') {
    //   user.firstTest = 'circles';
    // } else {
    //   user.firstTest = 'witkin';
    // }
    this.userService.setUser(user);
    this.$state.go(user.firstTest);
    console.log('user start', user.firstTest);
    // this.$state.go('witkin', {id: 1});
  }
}
MainController.$inject = ['$scope', '$state', 'userService', '$window'];

export const main = {
  template: require('./Main.html'),
  controller: MainController
};

