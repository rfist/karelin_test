class CirclesTestController {
  constructor($state, userService, $window) {
    this.$state = $state;
    this.userService = userService;
    this.$window = $window;
    this.selected = 0;
    this.checkState();
  }
  select(number) {
    this.selected = number;
  }
  checkState() {
    this.userService.load();
    if (this.userService.lastState !== '' && this.userService.lastState !== this.$state.current.name) {
      this.$state.go(this.userService.lastState);
    } else if (this.userService.user.unregistered) {
      this.$state.go('app');
    }
  }
  nextTest() {
    if (this.selected !== 0) {
      this.userService.setCircle(this.selected);
      this.$state.go('assertions');
    }
  }
  finishTest() {
    if (this.$window.XMLHttpRequest) { // Mozilla, Safari, ...
      this.xhr = new XMLHttpRequest();
    } else if (this.$window.ActiveXObject) { // IE 8 and older
// eslint-disable-next-line no-undef
      this.xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    const data = 'command=skip';
    this.xhr.open('POST', 'http://karelin.s-host.net/php/skip.php', true);
    this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    this.xhr.send(data);
    const prom = new Promise(resolve => {
      this.xhr.onreadystatechange = () => {
        if (this.xhr.readyState === 4 && this.xhr.status === 200) {
          resolve();
        }
      };
    });
    prom.then(() => {
      this.$state.go('end');
    });
  }
}

CirclesTestController.$inject = ['$state', 'userService', '$window'];

export const circlesTest = {
  template: require('./CirclesTest.html'),
  controller: CirclesTestController
};

