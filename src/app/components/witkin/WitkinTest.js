class WitkinTestController {
  constructor($stateParams, $http, $timeout, $window, $state, userService) {
    this.TESTS_COUNT = 2;
    this.info = '';
    this.layers = {};
    this.answers = [];
    this.$timeout = $timeout;
    this.$state = $state;
    this.userService = userService;
    this.SHOW_TEST_TIME = 15000;
    this.SHOW_REQUIRED_TIME = 10000;
    this.startTime = 0;
    this.isTestStarted = false;
    this.isTimerStarted = false;
    this.canvas = new fabric.Canvas('c');
    this.id = parseInt($stateParams.id, 10);
    $http.get('tests/test' + this.id + '.json')
      .then(res => {
        const minSize = Math.min($window.innerHeight, $window.innerWidth);
        $('#c').css({
          height: minSize,
          width: minSize
        });
        this.canvas.setHeight(minSize);
        this.canvas.setWidth(minSize);
        const loadObj = res.data;
        this.canvas.loadFromJSON(loadObj, () => {
          this.refresh();
          console.log('load');
          this.init();
        });
      });
  }
  init() {
    const answersNumbers = [];
    const multipleAnswers = [];
    this.canvas.getObjects().forEach(obj => {
      // console.log('obj.id', obj.id);
      this.addToLayer(obj);
      if (obj.id === 'lines' || obj.id.includes('answer') || obj.id.includes('multiple')) {
        obj.on('mousemove', this.onMouseMove.bind(this));
        obj.on('mouseout', () => {
          this.onMouseOut(obj);
          this.refresh();
        });
        obj.on('mousedown', this.onMouseDown.bind(this));
        if (obj.id.includes('answer') && this.answers.indexOf(obj.id) === -1) {
          this.answers.push(obj.id);
          const number = obj.id.substr(7);
          if (!answersNumbers.includes(number)) {
            answersNumbers.push(number);
          }
        }
        if (obj.id.includes('multiple')) {
          multipleAnswers.push(obj);
        }
      }
      obj.selectable = false;
    });
    multipleAnswers.forEach(obj => {
      answersNumbers.forEach(answer => {
        if (obj.id.includes(answer)) {
          this.layers['answer_' + answer].push(obj);
        }
      });
    });
    this.showLayers(['background', 'lines'].concat(this.answers));
    this.info = 'Спочатку роздивіться складну фігуру';
    this.refresh();
    console.log('init complete');
    this.$timeout(this.showRequired.bind(this), this.SHOW_TEST_TIME);
  }
  showRequired() {
    this.showLayers(['required']);
    this.info = 'Тепер запам\'ятайте фігуру, яку треба знайти';
    this.refresh();
    this.$timeout(this.startTimer.bind(this), this.SHOW_REQUIRED_TIME);
  }
  startTimer() {
    this.showLayers(['background', 'lines'].concat(this.answers));
    this.startTime = this.getCurrentTime();
    this.info = '';
    this.isTimerStarted = true;
    this.refresh();
  }
  startTest() {
    this.totalTime = this.getCurrentTime() - this.startTime;
    this.info = this.totalTime;
    this.isTestStarted = true;
  }
  addToLayer(obj) {
    const id = obj.id;
    if (!this.layers[id]) {
      this.layers[id] = [];
    }
    this.layers[id].push(obj);
  }
  showLayers(layers) {
    this.hideAll();
    layers.forEach(layer => {
      this.layers[layer].forEach(obj => {
        obj.visible = true;
      });
    });
  }
  hideAll() {
    for (const id in this.layers) {
      if (this.layers[id].length > 0) {
        this.layers[id].forEach(obj => {
          obj.visible = false;
        });
      }
    }
  }
  onMouseMove(e) {
    if (this.isTestStarted && e.target.fill !== 'blue') {
      if (e.target.selected) {
        e.target.setFill('blue');
      } else {
        e.target.setFill('blue');
      }
      this.refresh();
    }
  }
  onMouseOut(obj) {
    if (this.isTestStarted) {
      if (obj.selected && obj.fill !== 'yellow') {
        obj.setFill('yellow');
        this.refresh();
      } else if (obj.fill !== 'black') {
        obj.setFill('black');
        this.refresh();
      }
    }
  }
  onMouseDown(e) {
    if (this.isTestStarted) {
      e.target.selected = !e.target.selected;
      if (e.target.selected) {
        e.target.setFill('blue');
      } else {
        e.target.setFill('blue');
      }
      this.refresh();
    }
  }
  refresh() {
    this.canvas.renderAll();
  }
  check() {
    if (this.checkSelectedFigure()) {
      this.selectedTime = this.getCurrentTime() - (this.startTime + this.totalTime);
      this.info = 'Відповідь вірна!';
      this.userService.setWitkinTest(this.id, this.totalTime, this.selectedTime);
      if (this.id < this.TESTS_COUNT) {
        const nextTest = this.id + 1;
        this.$state.go('witkin-start', {id: nextTest});
      } else if (this.userService.getFirstTestName() === 'circles') {
        this.$state.go('end');
      } else {
        this.$state.go('circles');
      }
    } else {
      this.info = 'Не вірно, спробуйте ще';
    }
  }
  checkSelectedFigure() {
    let haveCount = 0;
    let result = false;
    this.canvas.getObjects().forEach(obj => {
      if (obj.selected) {
        haveCount++;
      }
    });
    this.answers.forEach(answerLayer => {
      let needCount = 0;
      this.layers[answerLayer].forEach(obj => {
        if (obj.selected) {
          needCount++;
        }
      });
      console.log('result', haveCount, needCount);
      if (needCount === haveCount && this.layers[answerLayer].length === haveCount) {
        result = true;
      }
    });
    return result;
  }
  reset() {
    const l = this.answers.concat(['lines']);
    l.forEach(layer => {
      this.layers[layer].forEach(obj => {
        obj.selected = false;
        obj.setFill('black');
      });
    });
    this.info = '';
    this.refresh();
  }
  getCurrentTime() {
    return new Date().getTime() / 1000;
  }
}

WitkinTestController.$inject = ['$stateParams', '$http', '$timeout', '$window', '$state', 'userService'];

export const witkinTest = {
  template: require('./WitkinTest.html'),
  controller: WitkinTestController
};

