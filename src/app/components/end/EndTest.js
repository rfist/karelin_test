class EndTestController {
  constructor(userService, $window) {
    this.userService = userService;
    this.$window = $window;
    this.userService.clear();
    // this.connectToServer();
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
      const lastNumber = (Math.max.apply(this, R.pluck('id')(result)));
      this.currentNumber = lastNumber + 1;
      const isLast = n => n.id === lastNumber;
      this.firstTest = R.filter(isLast, result)[0].first_test;
      this.saveResults();
    });
  }
  saveResults() {
    const data = 'data=' + this.userService.getResults() + '&id=' + this.currentNumber + '&date=' + moment().valueOf() + '&first_test=' + this.userService.getFirstTestName();
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
    });
  }
}

EndTestController.$inject = ['userService', '$window'];

export const endTest = {
  template: require('./EndTest.html'),
  controller: EndTestController
};

