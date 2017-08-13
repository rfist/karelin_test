class WitkinTestController {
  constructor($http, $timeout, $window, $state, userService, $scope) {
    this.TESTS_COUNT = 12;
    this.HIGHLIGHT_COLOR = 'grey';
    this.SELECT_COLOR = 'white';
    this.info = '';
    this.layers = {};
    this.answers = [];
    this.history = [];
    this.$timeout = $timeout;
    this.$state = $state;
    this.$window = $window;
    this.userService = userService;
    this.SHOW_TEST_TIME = 15000;
    this.SHOW_REQUIRED_TIME = 10000;
    this.startTime = 0;
    this.isTestStarted = false;
    this.isTimerStarted = false;
    this.TEXT_STEP_1 = 'Складна фігура';
    this.TEXT_STEP_2 = 'Проста фігура';
    this.oneMoreTimeText = 'Назад';
    this.MAX_SEARCH_TIME = 120;
    this.canvas = new fabric.Canvas('c');
    this.countOfUsedHint = 0;
    this.timeBeforeFirstClick = 0;
    this.isTestFinished = false;
    this.isTestPassed = false;
    this.id = parseInt($state.params.id, 10);
    this.userService.load();
    this.isMouseDown = false;
    this.$scope = $scope;
    console.log('lastWitkinTest', userService.lastWitkinTest, $state);
    if (this.$state.current.name === 'example') {
      this.id = 0;
    } else {
      if (this.userService.user.unregistered) {
        this.$state.go('app');
      }
      if (this.id < userService.lastWitkinTest) {
        this.$state.go('witkin-start', {id: userService.lastWitkinTest});
      } else {
        userService.lastWitkinTest = this.id;
      }
    }
    $http.get('tests/test' + this.id + '.json')
      .then(res => {
        const minSize = Math.min($window.innerHeight, $window.innerWidth);
        this.minSize = minSize;
        console.log('minSize', minSize);
        angular.element('#c').css({
          height: minSize,
          width: minSize,
          top: 60
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
    const coordsX = [];
    const coordsY = [];
    this.isDrawing = false;
    let count = 0;
    this.canvas.getObjects().forEach(obj => {
      // console.log('obj.id', obj.id);
      obj.label = count;
      count++;
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
      obj.selectable = false;
      coordsX.push(obj.left);
      coordsX.push(obj.left + obj.width);
      coordsY.push(obj.top);
      coordsY.push(obj.top + obj.height);
    });
    const w = Math.max.apply(null, coordsX) - Math.min.apply(null, coordsX);
    const h = Math.max.apply(null, coordsY) - Math.min.apply(null, coordsY);
    this.realSize = Math.max(h, w) + 90;
    console.log('realSize', this.realSize);
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
    this.zoomIt(this.minSize / this.realSize);
    this.canvas.on('mouse:up', this.onMouseUp.bind(this));
  }
  onMouseUp() {
    this.isMouseDown = false;
  }
  zoomIt(factor) {
    // this.canvas.setHeight(this.canvas.getHeight() * factor);
    // this.canvas.setWidth(this.canvas.getWidth() * factor);
    console.log('zoom to', factor);
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
      this.countOfUsedHint++;
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
    this.oneMoreTimeText = 'Назад';
    this.showLayers(['background', 'lines'].concat(this.answers));
    this.refresh();
  }
  showElapsedTime() {
    if (!this.isTestStarted) {
      const currentTime = parseInt(this.getCurrentTime() - this.startTime, 10);
      if (currentTime <= this.MAX_SEARCH_TIME) {
        this.info = `Час пошуку: ${currentTime} с.`;
        this.$timeout(this.showElapsedTime.bind(this), 1000);
      } else {
        console.log('Time expired', currentTime, this.MAX_SEARCH_TIME);
        toastr.warning(`Час вичерпано!`);
        this.continueTest();
      }
    }
  }
  startTest() {
    this.passedTime = this.getCurrentTime() - this.startTime;
    this.info = '';
    this.isTestStarted = true;
    this.timeBeforeFirstClick = 0;
    this.timeButtonFindWasClicked = this.getCurrentTime();
    this.showLayers(['background', 'lines', 'circles'].concat(this.answers));
    this.refresh();
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
    if (this.isTestStarted && e.target && e.target.fill !== this.HIGHLIGHT_COLOR) {
      if (this.isMouseDown && !e.target.selected) {
        const pointer = this.canvas.getPointer(e.e);
        const pointer2 = e.target.getCenterPoint();
        const h = e.target.height / 3;
        const w = e.target.width / 3;
        const xx = Math.abs(pointer.x - pointer2.x);
        const yy = Math.abs(pointer.y - pointer2.y);
        const max = Math.max(h, w);
        if (xx < max && yy < max) {
          e.target.overCount = 0;
          e.target.selected = true;
          e.target.setFill(this.HIGHLIGHT_COLOR);
          this.refresh();
        }
      } else {
        if (e.target.selected) {
          e.target.setFill(this.HIGHLIGHT_COLOR);
        } else {
          e.target.setFill(this.HIGHLIGHT_COLOR);
        }
        this.refresh();
      }
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
    this.isMouseDown = true;
    if (this.isTestStarted) {
      if (this.timeBeforeFirstClick === 0) {
        this.timeBeforeFirstClick = this.getCurrentTime() - this.timeButtonFindWasClicked;
      }
      e.target.selected = !e.target.selected;
      if (e.target.selected) {
        e.target.setFill(this.HIGHLIGHT_COLOR);
      } else {
        e.target.setFill('black');
        e.target.setStroke('');
      }
      this.refresh();
    }
  }
  refresh() {
    this.canvas.renderAll();
  }
  check() {
    const result = this.checkSelectedFigure();
    if (result) {
      this.history.push(result);
    }
    if (result && result.isCorrect) {
      toastr.success('Відповідь вірна!');
      this.isTestPassed = true;
      this.continueTest();
    } else {
      this.showLayers(['background', 'lines'].concat(this.answers));
      this.reset();
      this.startTime = this.getCurrentTime() - this.passedTime;
      this.isTestStarted = false;
      this.isTimerStarted = true;
      toastr.options.closeButton = true;
      toastr.error('Невірно, спробуйте знов');
      this.showElapsedTime();
    }
  }
  continueTest() {
    this.userService.setWitkinHistory(this.id, this.history);
    if (this.id < this.TESTS_COUNT) {
      this.userService.lastWitkinTest = this.id + 1;
      this.userService.save();
      this.saveResults();
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
    const data = 'data=' + this.userService.getWitkinResults() + '&id=' + this.userService.id + '&inner_id=' + this.userService.innerId + '&test=witkin';
    this.xhr.open('POST', 'http://karelin.s-host.net/php/update.php', true);
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
      console.log('saveResults');
      this.isTestFinished = true;
      this.$scope.$digest();
    });
  }
  next() {
    if (this.id < this.TESTS_COUNT) {
      this.$state.go('witkin-start', {id: this.userService.lastWitkinTest});
    } else {
      this.$state.go('end');
    }
  }
  checkSelectedFigure() {
    let haveCount = 0;
    let isCorrect = false;
    let sparesCount = 0;
    let correctPercents = 0;
    const selectedItems = [];
    this.canvas.getObjects().forEach(obj => {
      if (obj.selected) {
        haveCount++;
        selectedItems.push(obj.label);
        if (obj.id.indexOf('answer') === -1) {
          sparesCount++;
        }
      }
    });
    if (haveCount === 0) {
      console.log('nothing selected');
      return null;
    }
    const MAX_ANSWERS = 10;
    let answer = 0;
    while (answer <= MAX_ANSWERS) {
      let currentSelectedFromNeeded = 0;
      let totalElementsCount = 0;
      // eslint-disable-next-line
      this.answers.forEach(answerLayer => {
        if (answerLayer.indexOf('_' + answer) > -1) {
          this.layers[answerLayer].forEach(obj => {
            totalElementsCount++;
            if (obj.selected) {
              currentSelectedFromNeeded++;
            }
          });
        }
      });
      if (totalElementsCount > 0) {
        const percent = (currentSelectedFromNeeded / totalElementsCount) * 100;
        if (sparesCount <= 3 && percent >= 58) {
          isCorrect = true;
          correctPercents = percent;
        } else if (percent > correctPercents) {
          correctPercents = percent; // сохраняем наилучший результат для статистики
        }
      }
      answer++;
    }
    const resultObj = {selectedItems, isCorrect, sparesCount, correctPercents};
    resultObj.passedTime = this.passedTime;
    resultObj.selectedTime = this.getCurrentTime() - (this.startTime + this.passedTime);
    resultObj.countOfUsedHint = this.countOfUsedHint;
    resultObj.timeBeforeFirstClick = this.timeBeforeFirstClick;
    return resultObj;
  }
  reset() {
    const l = this.answers.concat(['lines']);
    l.forEach(layer => {
      this.layers[layer].forEach(obj => {
        obj.selected = false;
        obj.setFill('black');
        obj.setStroke('');
      });
    });
    this.info = '';
    this.refresh();
  }
  getCurrentTime() {
    return new Date().getTime() / 1000;
  }
}

WitkinTestController.$inject = ['$http', '$timeout', '$window', '$state', 'userService', '$scope'];

export const witkinTest = {
  template: require('./WitkinTest.html'),
  controller: WitkinTestController
};

