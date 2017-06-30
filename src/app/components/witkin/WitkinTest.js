class WitkinTestController {
  constructor($stateParams, $http, $timeout, $window, $state, userService) {
    this.TESTS_COUNT = 24;
    this.HIGHLIGHT_COLOR = 'grey';
    this.SELECT_COLOR = 'white';
    this.info = '';
    this.layers = {};
    this.answers = [];
    this.$timeout = $timeout;
    this.$state = $state;
    this.$window = $window;
    this.userService = userService;
    this.SHOW_TEST_TIME = 15000;
    this.SHOW_REQUIRED_TIME = 10000;
    this.startTime = 0;
    this.selectedTime = 0;
    this.totalTime = 0;
    this.isTestStarted = false;
    this.isTimerStarted = false;
    this.TEXT_STEP_1 = 'Складна фігура';
    this.TEXT_STEP_2 = 'Проста фігура';
    this.oneMoreTimeText = 'Ще раз подивитися просту фігуру';
    this.MAX_SEARCH_TIME = 120;
    this.canvas = new fabric.Canvas('c');
    this.id = parseInt($stateParams.id, 10);
    console.log('lastWitkinTest', userService.lastWitkinTest);
    if (this.id < userService.lastWitkinTest) {
      this.$state.go('witkin-start', {id: userService.lastWitkinTest});
    } else {
      userService.lastWitkinTest = this.id;
    }
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
      obj.hasControls = false;
      obj.lockMovementX = true;
      obj.lockMovementY = true;
      obj.lockRotation = true;
      obj.selectable = obj.id !== 'background';
    });
    multipleAnswers.forEach(obj => {
      answersNumbers.forEach(answer => {
        if (obj.id.includes(answer)) {
          this.layers['answer_' + answer].push(obj);
        }
      });
    });
    this.showLayers(['background', 'lines'].concat(this.answers));
    this.info = this.TEXT_STEP_1 + ' ' + this.id + ' з ' + this.TESTS_COUNT + ' - ' + (this.SHOW_TEST_TIME / 1000) + ' с. ';
    this.refresh();
    console.log('init complete');
    this.$timeout(this.showRequired.bind(this), 1000);
    if (this.id !== 11 && this.id !== 14 && this.id !== 17) {
      this.zoomIt(1.5);
    }
  }
  zoomIt(factor) {
    this.canvas.setHeight(this.canvas.getHeight() * factor);
    this.canvas.setWidth(this.canvas.getWidth() * factor);
    if (this.canvas.backgroundImage) {
      // Need to scale background images as well
      const bi = this.canvas.backgroundImage;
      bi.width *= factor;
      bi.height *= factor;
    }
    const objects = this.canvas.getObjects();
// eslint-disable-next-line
    for (let i in objects) {
      const scaleX = objects[i].scaleX;
      const scaleY = objects[i].scaleY;
      const left = objects[i].left;
      const top = objects[i].top;

      const tempScaleX = scaleX * factor;
      const tempScaleY = scaleY * factor;
      const tempLeft = left * factor;
      const tempTop = top * factor;

      objects[i].scaleX = tempScaleX;
      objects[i].scaleY = tempScaleY;
      objects[i].left = tempLeft;
      objects[i].top = tempTop;

      objects[i].setCoords();
    }
    this.canvas.renderAll();
    this.canvas.calcOffset();
  }
  showRequired() {
    this.SHOW_TEST_TIME -= 1000;
    if (this.SHOW_TEST_TIME === 0) {
      this.showLayers(['required']);
      this.info = this.TEXT_STEP_2 + ' ' + (this.SHOW_REQUIRED_TIME / 1000) + ' с. ';
      this.refresh();
      this.$timeout(this.startTimer.bind(this), 1000);
    } else {
      this.info = this.TEXT_STEP_1 + ' ' + this.id + ' з ' + this.TESTS_COUNT + ' - ' + (this.SHOW_TEST_TIME / 1000) + ' с. ';
      this.$timeout(this.showRequired.bind(this), 1000);
    }
  }
  startTimer() {
    this.SHOW_REQUIRED_TIME -= 1000;
    if (this.SHOW_REQUIRED_TIME === 0) {
      this.showLayers(['background', 'lines'].concat(this.answers));
      this.startTime = this.getCurrentTime();
      this.info = '';
      this.isTimerStarted = true;
      this.refresh();
      this.$timeout(this.showElapsedTime.bind(this), 1000);
    } else {
      this.info = this.TEXT_STEP_2 + ' ' + (this.SHOW_REQUIRED_TIME / 1000) + ' с. ';
      this.$timeout(this.startTimer.bind(this), 1000);
    }
  }
  showSimpleAgain() {
    if (this.SHOW_TEST_TIME > 0) {
      this.SHOW_TEST_TIME = 0;
      this.returnToTest();
    } else {
      this.oneMoreTimeText = 'Повернутися до складної фігури';
      this.SHOW_TEST_TIME = 10000;
      this.showLayers(['required']);
      this.refresh();
      this.showAgainTimer();
    }
  }
  showAgainTimer() {
    this.SHOW_TEST_TIME -= 1000;
    if (this.SHOW_TEST_TIME <= 0) {
      this.returnToTest();
    } else {
      this.$timeout(this.showAgainTimer.bind(this), 1000);
    }
  }
  returnToTest() {
    this.oneMoreTimeText = 'Ще раз подивитися просту фігуру';
    this.showLayers(['background', 'lines'].concat(this.answers));
    this.refresh();
  }
  showElapsedTime() {
    if (!this.isTestStarted) {
      const currentTime = parseInt(this.getCurrentTime() - this.startTime, 10);
      if (currentTime <= this.MAX_SEARCH_TIME) {
        this.info = `Пошук фігури: ${currentTime} с.`;
        this.$timeout(this.showElapsedTime.bind(this), 1000);
      } else {
        this.info = `Час вичерпано!`;
        this.userService.setWitkinTest(this.id, this.MAX_SEARCH_TIME, this.selectedTime);
        this.continueTest();
      }
    }
  }
  startTest() {
    this.totalTime += (this.getCurrentTime() - this.startTime);
    this.info = ''; // this.totalTime;
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
      if (this.layers[layer] && this.layers[layer].length > 0) {
        this.layers[layer].forEach(obj => {
          obj.visible = true;
        });
      }
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
    if (this.isTestStarted && e.target.fill !== this.HIGHLIGHT_COLOR) {
      if (e.target.selected) {
        e.target.setFill(this.HIGHLIGHT_COLOR);
      } else {
        e.target.setFill(this.HIGHLIGHT_COLOR);
      }
      this.refresh();
    }
  }
  onMouseOut(obj) {
    if (this.isTestStarted) {
      if (obj.selected && obj.fill !== this.SELECT_COLOR) {
        obj.setFill(this.SELECT_COLOR);
        obj.setStroke('black');
        this.refresh();
      } else if (obj.fill !== 'black') {
        obj.setFill('black');
        obj.setStroke('');
        this.refresh();
      }
    }
  }
  onMouseDown(e) {
    if (this.isTestStarted) {
      e.target.selected = !e.target.selected;
      if (e.target.selected) {
        e.target.setFill(this.HIGHLIGHT_COLOR);
      } else {
        e.target.setFill();
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
      this.continueTest();
    } else {
      this.reset();
      // this.startTime = this.getCurrentTime();
      this.isTestStarted = false;
      this.isTimerStarted = true;
      this.info = 'Не вірно, спробуйте знов';
      this.showElapsedTime();
    }
  }
  continueTest() {
    if (this.id < this.TESTS_COUNT) {
      const nextTest = this.id + 1;
      this.$state.go('witkin-start', {id: nextTest});
    } else {
      this.saveResults();
    }
  }
  saveResults() {
    if (this.$window.XMLHttpRequest) { // Mozilla, Safari, ...
      this.xhr = new XMLHttpRequest();
    } else if (this.$window.ActiveXObject) { // IE 8 and older
// eslint-disable-next-line no-undef
      this.xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    const id = this.userService.getUser().id;
    const data = 'data=' + this.userService.getWitkinResults() + '&id=' + id + '&test=witkin';
    this.xhr.open('POST', 'http://karelin.s-host.net/php/save_result.php', true);
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
      console.log('witkin test finished');
      this.$state.go('end');
    });
  }
  checkSelectedFigure() {
    let haveCount = 0;
    let result = false;
    this.canvas.getObjects().forEach(obj => {
      if (obj.selected) {
        haveCount++;
      }
    });
    const MAX_ANSWERS = 10;
    let answer = 0;
    while (answer <= MAX_ANSWERS) {
      let needCount = 0;
      // eslint-disable-next-line
      this.answers.forEach(answerLayer => {
        if (answerLayer.indexOf('_' + answer) > -1) {
          this.layers[answerLayer].forEach(obj => {
            if (obj.selected) {
              needCount++;
            }
          });
        }
      });
      if (needCount === haveCount) {
        result = true;
      }
      console.log('answer', answer, 'needCount', needCount);
      answer++;
    }
    // this.answers.forEach(answerLayer => {
    //   let needCount = 0;
    //   this.layers[answerLayer].forEach(obj => {
    //     if (obj.selected) {
    //       needCount++;
    //     }
    //   });
    //   console.log('result', haveCount, needCount, this.layers[answerLayer].length);
    //   if (needCount === haveCount && this.layers[answerLayer].length === haveCount) {
    //     result = true;
    //   }
    // });
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

