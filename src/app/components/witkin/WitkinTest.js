class WitkinTestController {
  constructor($stateParams, $http, $timeout, $window, $state, userService) {
    this.TESTS_COUNT = 24;
    this.HIGHLIGHT_COLOR = 'grey';
    this.SELECT_COLOR = 'white';
    this.info = '';
    this.layers = {};
    this.answers = [];
    this.wrongAnswers = [];
    this.rightAnswer = [];
    this.$timeout = $timeout;
    this.$state = $state;
    this.$window = $window;
    this.userService = userService;
    this.SHOW_TEST_TIME = 1000;
    this.SHOW_REQUIRED_TIME = 1000;
    this.startTime = 0;
    this.selectedTime = 0;
    this.isTestStarted = false;
    this.isTimerStarted = false;
    this.TEXT_STEP_1 = 'Складна фігура';
    this.TEXT_STEP_2 = 'Проста фігура';
    this.oneMoreTimeText = 'Назад';
    this.MAX_SEARCH_TIME = 120;
    this.canvas = new fabric.Canvas('c');
    this.countOfUsedHint = 0;
    this.timeBeforeFirstClick = 0;
    this.percent = 0;
    this.id = parseInt($stateParams.id, 10);
    this.userService.load();
    console.log('lastWitkinTest', userService.lastWitkinTest);
    if (this.userService.user.unregistered) {
      this.$state.go('app');
    }
    if (this.id < -1) {
      this.$state.go('witkin-start', {id: userService.lastWitkinTest});
    } else {
      userService.lastWitkinTest = this.id;
    }
    $http.get('tests/test' + this.id + '.json')
      .then(res => {
        const minSize = Math.min($window.innerHeight, $window.innerWidth);
        this.minSize = minSize;
        console.log('minSize', minSize);
        $('#c').css({
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
    this.circles = [];
    this.circlesObjects = [];
    this.drawedLines = [];
    this.isDrawing = false;
    let count = 0;
    this.canvas.getObjects().forEach(obj => {
      // console.log('obj.id', obj.id);
      obj.label = count;
      count++;
      this.addToLayer(obj);
      if (obj.id === 'lines' || obj.id.includes('answer') || obj.id.includes('multiple')) {
        this.addCirclesToLine(obj);
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
    this.canvas.on('mouse:move', this.onCanvasMove.bind(this));
    this.canvas.on('mouse:down', this.onCanvasDown.bind(this));
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
  addCirclesToLine(line) {
    const longSide = line.width > line.height ? line.width : line.height;
    const circle = new fabric.Circle({
      left: line.left,
      top: line.top,
      radius: 3,
      strokeWidth: 1,
      fill: 'green',
      stroke: 'white',
      selectable: false,
      originX: 'center', originY: 'center'
    });
    // eslint-disable-next-line
    Number.prototype.toRad = function () { return this * Math.PI / 180; }
    const R = Math.abs(line.left + (longSide * line.scaleX) - line.left);
    let x1;
    let y1;
    if (line.width > line.height) {
      y1 = line.top + (R * Math.sin(line.angle.toRad()));
      x1 = line.left + (R * Math.cos(line.angle.toRad()));
    } else {
      y1 = line.top + (R * Math.sin((line.angle + 90).toRad()));
      x1 = line.left + (R * Math.cos((line.angle + 90).toRad()));
    }
    const circle2 = new fabric.Circle({
      left: x1,
      top: y1,
      radius: 3,
      strokeWidth: 1,
      fill: 'green',
      stroke: 'white',
      selectable: false,
      originX: 'center', originY: 'center'
    });
    if (this.addToCircleMatrix(circle.left, circle.top)) {
      this.canvas.add(circle);
      this.circlesObjects.push(circle);
      circle.on('mousemove', this.onMouseCircleMove.bind(this));
      circle.on('mouseout', () => {
        this.onMouseCircleOut(circle);
        this.refresh();
      });
      circle.on('mousedown', this.onMouseCircleDown.bind(this));
    }
    if (this.addToCircleMatrix(circle2.left, circle2.top)) {
      this.canvas.add(circle2);
      this.circlesObjects.push(circle2);
      circle2.on('mousemove', this.onMouseCircleMove.bind(this));
      circle2.on('mouseout', () => {
        this.onMouseCircleOut(circle2);
        this.refresh();
      });
      circle2.on('mousedown', this.onMouseCircleDown.bind(this));
    }
  }
  addToCircleMatrix(x, y) {
    let isUniquePosition = true;
    this.circles.forEach(circle => {
      if (Math.abs(circle.x - x) < 5 && Math.abs(circle.y - y) < 5) {
        isUniquePosition = false;
      }
    });
    if (isUniquePosition) {
      this.circles.push({x, y});
    }
    return isUniquePosition;
  }
  onCanvasDown() {
    const date = new Date();
    const now = date.getTime();
    if (now - this.lastTime < 500) {
      this.isDrawing = false;
      this.line.remove();
    }
    this.lastTime = now;
  }
  onCanvasMove(o) {
    if (!this.isDrawing) {
      return;
    }
    const pointer = this.canvas.getPointer(o.e);
    this.line.set({x2: pointer.x, y2: pointer.y});
    this.refresh();
  }
  onMouseCircleMove(e) {
    if (this.isTestStarted && e.target.fill !== this.HIGHLIGHT_COLOR) {
      if (e.target.selected) {
        e.target.setFill('yellow');
      } else {
        e.target.setFill('blue');
      }
      this.refresh();
    }
  }
  onMouseCircleOut(obj) {
    if (this.isTestStarted) {
      console.log('onMouseCircleOut', obj);
      if (obj.selected && obj.fill !== 'yellow') {
        obj.setFill('yellow');
        this.refresh();
      } else if (!obj.selected && obj.fill !== 'green') {
        obj.setFill('green');
        this.refresh();
      }
    }
  }
  onMouseCircleDown(e) {
    if (this.isTestStarted) {
      if (this.timeBeforeFirstClick === 0) {
        this.timeBeforeFirstClick = this.getCurrentTime() - this.timeButtonFindWasClicked;
      }
      // e.target.selected = !e.target.selected;
      // if (e.target.selected) {
      //   e.target.setFill('yellow');
      if (this.isDrawing) {
        this.line.selectable = true;
        this.line.hasControls = true;
        this.drawedLines.push(this.line);
        const lineObj = new fabric.Line([120, 182, 820, 182], {
          stroke: 'red',
          strokeWidth: 8
        });
        this.canvas.add(lineObj);
        this.circlesObjects.forEach(circle => {
          if (lineObj.intersectsWithObject(circle)) {
            circle.setFill('red');
          }
          console.log('intersectsWithObject', lineObj.intersectsWithObject(circle));
        });
        lineObj.remove();
      }
      this.isDrawing = true;
      const pointer = this.canvas.getPointer(e.e);
      const points = [pointer.x, pointer.y, pointer.x, pointer.y];
      this.line = new fabric.Line(points, {
        strokeWidth: 5,
        fill: 'red',
        stroke: 'red',
        originX: 'center',
        originY: 'center',
        padding: 30
      });
      this.line.on('mousedown', this.onMouseDown.bind(this));
      this.canvas.add(this.line);
      // } else {
      //   e.target.setFill('green');
      // }
      this.refresh();
    }
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
        this.userService.setWitkinTest(this.id, this.MAX_SEARCH_TIME, this.selectedTime, this.countOfUsedHint, this.timeBeforeFirstClick);
        this.userService.setWitkinHistory(this.id, this.wrongAnswers, this.rightAnswer, 0);
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
    e.target.remove();
    if (this.isTestStarted) {
      if (this.timeBeforeFirstClick === 0) {
        this.timeBeforeFirstClick = this.getCurrentTime() - this.timeButtonFindWasClicked;
      }
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
      this.selectedTime = this.getCurrentTime() - (this.startTime + this.passedTime);
      toastr.success('Відповідь вірна!');
      this.userService.setWitkinTest(this.id, this.passedTime, this.selectedTime, this.countOfUsedHint, this.timeBeforeFirstClick);
      this.userService.setWitkinHistory(this.id, this.wrongAnswers, this.rightAnswer, this.percent);
      // console.log(`Час на розшук ${this.passedTime} час на виділення ${this.selectedTime}`);
      this.continueTest();
    } else {
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
    if (this.id < this.TESTS_COUNT) {
      this.userService.lastWitkinTest = this.id + 1;
      this.userService.save();
      this.saveResults(false);
    } else {
      this.saveResults();
    }
  }
  saveResults(exitAfter = true) {
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
      if (exitAfter) {
        this.$state.go('end');
      } else {
        this.$state.go('witkin-start', {id: this.userService.lastWitkinTest});
      }
    });
  }
  checkSelectedFigure() {
    let haveCount = 0;
    let result = false;
    let isSpared = false;
    const selectedItems = [];
    this.canvas.getObjects().forEach(obj => {
      if (obj.selected) {
        haveCount++;
        selectedItems.push(obj.label);
        if (obj.id.indexOf('answer') === -1) {
          isSpared = true;
        }
      }
    });
    if (haveCount === 0) {
      return false;
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
      const percent = (currentSelectedFromNeeded / totalElementsCount) * 100;
      // if (currentSelectedFromNeeded === haveCount && totalElementsCount === haveCount) {
      if (!isSpared && percent >= 65) {
        result = true;
        this.percent = percent;
        this.rightAnswer = selectedItems;
      }
      console.log('answer', answer, 'currentSelectedFromNeeded', currentSelectedFromNeeded, 'totalElements', totalElementsCount);
      console.log('percent', percent, 'isSpared', isSpared);
      console.log('selectedItems', selectedItems);
      answer++;
    }
    if (!result) {
      this.wrongAnswers.push(selectedItems);
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
        obj.setStroke('');
      });
    });
    this.info = '';
// TODO: example of selected lines
    // const answer = [7, 8, 25, 73, 44, 45, 81];
    // this.canvas.getObjects().forEach(obj => {
    //   if (answer.includes(obj.label)) {
    //     obj.setFill('green');
    //   }
    // });
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

