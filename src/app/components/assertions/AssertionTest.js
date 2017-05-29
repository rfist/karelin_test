class AssertionTestController {
  constructor($http, $state, userService) {
    this.isTestStarted = false;
    this.$http = $http;
    this.$state = $state;
    this.userService = userService;
  }
  startTest() {
    this.isTestStarted = true;
    this.$http.get('tests/questions.txt')
      .then(res => {
        const questions = res.data.split(/\r?\n/);
        this.showTest(questions);
      });
  }
  showTest(questions) {
    Survey.Survey.cssType = 'bootstrap';
    Survey.defaultBootstrapCss.navigationButton = 'btn btn-green';
    Survey.defaultBootstrapCss.progressBar = 'bar-green';
    const surveyJSON = {locale: 'ru', pages: [], requiredText: '', showProgressBar: 'top', goNextPageAutomatic: true};
    const len = questions.length;
    for (let i = 0; i < len; i++) {
      if (questions[i].length > 0) {
        surveyJSON.pages.push(AssertionTestController.constructPage(i + 1, questions[i]));
      }
    }
    const survey = new Survey.Model(surveyJSON);
    // eslint-disable-next-line
    $('#surveyContainer').Survey({
      model: survey,
      onComplete: this.finishTest.bind(this)
    });
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
  finishTest(survey) {
    // const resultAsString = angular.toJson(survey.data);
    this.userService.setAssertions(survey.data);
    if (this.userService.getUser().firstTest === 'witkin') {
      this.$state.go('end');
    } else {
      this.$state.go('witkin');
    }
  }
}

AssertionTestController.$inject = ['$http', '$state', 'userService'];
export const assertionTest = {
  template: require('./AssertionTest.html'),
  controller: AssertionTestController
};

