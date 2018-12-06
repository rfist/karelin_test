class AssertionTestController {
  constructor($http, $state, userService, $window) {
    this.isTestStarted = false;
    this.$http = $http;
    this.$state = $state;
    this.$window = $window;
    this.userService = userService;
    this.checkState();
  }
  checkState() {
    this.userService.load();
    if (this.userService.lastState !== '') {
      this.$state.go(this.userService.lastState);
    } else if (this.userService.user.unregistered) {
      this.$state.go('app');
    }
  }
  startTest(event = null) {
    if (event && event.ctrlKey && event.altKey) { // CHEATS
      console.log('keys', event.ctrlKey, event.altKey);
      const survey = {};
      survey.data = {1: '1', 2: '1', 3: '1', 4: '1', 5: '1', 6: '1', 7: '1', 8: '1', 9: '1', 10: '1', 11: '1', 12: '1', 13: '1', 14: '5', 15: '4', 16: '4', 17: '3', 18: '3', 19: '2', 20: '1', 21: '1', 22: '3', 23: '2', 24: '2', 25: '1', 26: '1', 27: '1', 28: '1', 29: '1', 30: '1', 31: '2', 32: '2', 33: '2', 34: '2', 35: '1', 36: '1', 37: '1', 38: '2', 39: '1', 40: '1', 41: '1', 42: '2', 43: '2', 44: '2', 45: '1', 46: '2', 47: '1', 48: '2', 49: '1', 50: '2', 51: '3', 52: '1', 53: '1', 54: '1', 55: '1', 56: '1', 57: '1', 58: '1', 59: '1', 60: '4', 61: '1', 62: '1', 63: '1', 64: '1', 65: '1', 66: '1', 67: '1', 68: '1', 69: '1', 70: '1', 71: '1', 72: '1', 73: '1', 74: '1', 75: '1', 76: '1', 77: '3', 78: '3', 79: '1', 80: '2', 81: '2', 82: '2', 83: '2', 84: '2', 85: '5', 86: '2', 87: '2', 88: '2', 89: '2', 90: '2', 91: '2', 92: '2', 93: '2', 94: '2', 95: '2', 96: '2', 97: '2', 98: '2', 99: '2', 100: '2', 101: '2', 102: '4', 103: '2', 104: '2', 105: '2', 106: '2', 107: '5', 108: '2', 109: '2', 110: '2', 111: '2', 112: '2', 113: '2', 114: '2', 115: '2', 116: '4', 117: '2', 118: '2', 119: '2', 120: '2', 121: '2', 122: '5', 123: '2', 124: '2', 125: '2', 126: '2', 127: '2', 128: '2', 129: '2', 130: '2', 131: '2', 132: '2', 133: '2'};
      this.registerUser(survey);
    } else {
      this.isTestStarted = true;
      this.$http.get('tests/questions.txt')
        .then(res => {
          const questions = res.data.split(/\r?\n/);
          this.showTest(questions);
        });
    }
  }
  showTest(questions) {
    // Survey.Survey.cssType = 'bootstrap';
    Survey.defaultBootstrapCss.navigationButton = 'btn btn-green';
    Survey.defaultBootstrapCss.progressBar = 'bar-green';
    const surveyJSON = {locale: 'ru', pages: [], requiredText: '', showProgressBar: 'top', goNextPageAutomatic: false};
    const len = questions.length;
    for (let i = 0; i < len; i++) {
      if (questions[i].length > 0) {
        surveyJSON.pages.push(AssertionTestController.constructPage(i + 1, questions[i]));
      }
    }
    const survey = new Survey.Model(surveyJSON);
    let lastPage = '';
    if (!R.isEmpty(this.userService.assertions)) {
      survey.data = this.userService.assertions;
      lastPage = 'page' + (Math.max.apply(null, R.keys(survey.data)) + 1);
    }
    // eslint-disable-next-line
    $('#surveyContainer').Survey({
      model: survey,
      onCurrentPageChanged: this.onPageChanged.bind(this),
      onComplete: this.registerUser.bind(this)
    });
    // для прокрутки теста до последнего отвеченного вопроса, но, видимо, это функционал не пригодиться
    if (lastPage !== '') {
      while (survey.currentPage.name !== lastPage) {
        survey.nextPage();
      }
    }
  }
  onPageChanged(survey) {
    this.userService.setAssertions(survey.data);
  }
  static constructPage(index, question) {
    return {
      elements: [
        {
          type: 'radiogroup',
          choices: [
            {
              value: '1',
              text: '1 - абсолютно не про мене'
            },
            {
              value: '2',
              text: '2 - мало схоже на мене'
            },
            {
              value: '3',
              text: '3 - водночас і схоже, і несхоже на мене'
            },
            {
              value: '4',
              text: '4 - схоже на мене'
            },
            {
              value: '5',
              text: '5 - точно про мене'
            }
          ],
          isRequired: true,
          name: String(index),
          title: question
        }
      ],
      name: 'page' + index
    };
  }
  registerUser(survey) {
    if (this.$window.XMLHttpRequest) { // Mozilla, Safari, ...
      this.xhr = new XMLHttpRequest();
    } else if (this.$window.ActiveXObject) { // IE 8 and older
// eslint-disable-next-line no-undef
      this.xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    const data = 'data=' + angular.toJson(this.userService.getUser()) + '&inner_id=' + this.userService.innerId + '&date=' + moment().valueOf() + '&first_test=' + this.userService.getFirstTestName();
    this.xhr.open('POST', 'http://karelin.s-host.net/php/register.php', true);
    this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    this.xhr.send(data);
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
      this.finishTest(survey);
    });
  }
  finishTest(survey) {
    this.userService.setAssertions(survey.data);
    const data = 'data=' + this.userService.getCirclesResults() + '&id=' + this.userService.id + '&inner_id=' + this.userService.innerId + '&test=circles';
    this.xhr.open('POST', 'http://karelin.s-host.net/php/update.php', true);
    this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    this.xhr.send(data);
    const prom = new Promise(resolve => {
      this.xhr.onreadystatechange = () => {
        if (this.xhr.readyState === 4 && this.xhr.status === 200) {
          resolve(this.xhr.responseText);
        }
      };
    });
    prom.then(result => {
      console.log('circles test finished', result);
      // this.userService.lastState = 'restore';
      this.userService.save();
      this.$state.go('info');
    });
  }
}

AssertionTestController.$inject = ['$http', '$state', 'userService', '$window'];
export const assertionTest = {
  template: require('./AssertionTest.html'),
  controller: AssertionTestController
};

