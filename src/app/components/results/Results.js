class ResultsController {
  constructor($state, $window, $scope, $http) {
    this.isDataReady = false;
    this.isAuthorized = false;
    this.$window = $window;
    this.$scope = $scope;
    this.isCirclesSaved = false;
    this.isWitkinSaved = false;
    this.users = [];
    this.currentUser = {};
    this.currentUserId = 0;
    this.currentItem = {};
    this.currentItemId = 0;
    this.answerId = 0;
    this.answer = {};
    this.$http = $http;
    this.canvas = new fabric.Canvas('c');
    this.answers = [];
    this.layers = {};
    this.connectToServer();
  }
  setUser() {
    const filterById = user => parseInt(user.id, 10) === parseInt(this.currentUserId, 10);
    this.currentUser = R.filter(filterById, this.users)[0];
  }
  setItem() {
    this.canvas.clear();
    const filterById = item => parseInt(item.key, 10) === parseInt(this.currentItemId, 10);
    this.currentItem = R.filter(filterById, this.currentUser.history)[0];
    let i = 1;
    this.currentItem.data.forEach(answer => {
      answer.id = i;
      i++;
    });
    this.$http.get('tests/test' + this.currentItemId + '.json')
      .then(res => {
        const loadObj = res.data;
        this.canvas.loadFromJSON(loadObj, () => {
          console.log('load');
          this.initCanvas();
          this.refresh();
          this.answerId = 1;
          this.showAnswer();
        });
      });
    console.log('setItem', this.currentItem);
  }
  showAnswer(id = 1) {
    this.answerId = id;
    this.answer = this.currentItem.data[this.answerId - 1];
    let selectedItems = [];
    if (this.currentItem.data[this.answerId - 1] && this.currentItem.data[this.answerId - 1].selectedItems) {
      selectedItems = selectedItems.concat(this.currentItem.data[this.answerId - 1].selectedItems);
    }
    console.log('anwers', selectedItems);
    this.canvas.getObjects().forEach(obj => {
      if (selectedItems.includes(obj.label)) {
        obj.setFill('white');
        obj.setStroke('black');
        obj.colored = true;
      } else {
        if (obj.colored) {
          obj.setFill('black');
          obj.setStroke('');
        }
        obj.colored = false;
      }
    });
    this.refresh();
  }
  connectToServer() {
    if (this.$window.XMLHttpRequest) { // Mozilla, Safari, ...
      this.xhr = new XMLHttpRequest();
    } else if (this.$window.ActiveXObject) { // IE 8 and older
// eslint-disable-next-line no-undef
      this.xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }
    const data = 'command=get_info';
    this.xhr.open('POST', 'http://karelin.s-host.net/php/total.php', true);
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
      const desc = (a, b) => b.date - a.date;
      this.data = R.sort(desc, result);
      console.log('result', this.data);
      this.data.forEach(user => {
        const userData = angular.fromJson(user.data);
        user.name = user.id + '.' + userData.name;
        user.history = [];
        if (user.witkin) {
          const w = angular.fromJson(user.witkin).witkin;
          if (w.history) {
            const keys = R.keys(w.history);
            keys.forEach(key => {
              user.history.push({key, data: w.history[key]});
            });
          }
        }
        this.users.unshift(user);
      });
      const lastNumber = Math.max.apply(this, R.pluck('id')(result));
      this.id = lastNumber + 1;
      this.isDataReady = true;
      this.$scope.$digest();
      console.log('user id', this.id);
    });
  }
  saveCirclesResults() {
    const ids = [];
    const uniqe = [];
    const contextStatistics = {};
    this.data.forEach(obj => {
      ids.push(obj.id);
    });
    ids.forEach(id => {
      let count = 0;
      for (let i = 0; i < ids.length; ++i) {
        if (ids[i] === id) {
          count++;
        }
      }
      if (count === 1) {
        uniqe.push(id);
      }
    });
    const headers = ['ID', 'Ім\'я', 'Стать', 'Вік', 'Освіта', 'Професія', 'Сімейний стан', 'Місто', 'Електронна адреса', 'Дата заповнення'];
    for (let i = 1; i <= 133; i++) {
      headers.push(i);
    }
    headers.push('Контекст');
    headers.push('Тест Віткіна');
    const result = [headers];
    const defaultEmpty = R.defaultTo('Не вказано');
    const fields = ['name', 'sex', 'age', 'education', 'occupation', 'marital', 'city', 'email', 'time'];
    this.data.forEach(obj => {
      if (obj.data) {
        obj.data = angular.fromJson(obj.data);
      } else {
        obj.data = {};
      }
      if (obj.circles) {
        obj.circles = angular.fromJson(obj.circles);
      } else {
        obj.circles = {};
      }
      const item = [];
      item.push(obj.id);
      fields.forEach(field => {
        if (field === 'time') {
          item.push(moment(obj.data[field]).format(`Do MMM YY`));
        } else {
          item.push(defaultEmpty(obj.data[field]));
        }
      });
      // колонка, какой круг выбран
      if (obj.circles.assertions) {
        for (let i = 1; i <= 133; i++) {
          item.push(defaultEmpty(obj.circles.assertions[i]));
        }
      }
      const selectedCircle = defaultEmpty(obj.circles.selectedCircle);
      item.push(selectedCircle);
      if (obj.witkin !== '') {
        item.push('+');
      }
      if (uniqe.includes(obj.id)) {
        if (angular.isNumber(selectedCircle)) {
          if (contextStatistics[selectedCircle]) {
            contextStatistics[selectedCircle]++;
          } else {
            contextStatistics[selectedCircle] = 1;
          }
        } else if (contextStatistics['Не вказано']) {
          contextStatistics['Не вказано']++;
        } else {
          contextStatistics['Не вказано'] = 1;
        }
        result.push(item);
      }
    });
    result.push([]);
    result.push(['Статистика по обраному контексту:']);
    result.push(R.keys(contextStatistics));
    result.push(R.values(contextStatistics));
    console.log('saveCirclesResults', result);
    console.log('contextStatistics', contextStatistics);
    let dataString = '';
    let csvContent = '';
    result.forEach((infoArray, index) => {
      dataString = infoArray.join(';');
      csvContent += index < result.length ? dataString + '\n' : dataString;
    });

    const file = new File([csvContent], 'circles.csv', {type: 'text/csv;charset=utf-8,\uFEFF'});
    saveAs(file, 'circles.csv');
    this.isCirclesSaved = true;
  }
  saveWitkinResults() {
    const headers = ['ID', 'Ім\'я', 'Стать', 'Вік', 'Освіта', 'Професія', 'Сімейний стан', 'Місто', 'Електронна адреса', 'Дата заповнення'];
    for (let i = 1; i <= 24; i++) {
      headers.push(i);
    }
    headers.push('Контекст');
    headers.push('Кількість використаних підказок');
    headers.push('Середній час за перші 12 завдань');
    headers.push('Середній час за останні 12 завдань');
    headers.push('Сумарний час');
    // headers.push('Середній час, витрачений між натисканням кнопки «Фігуру знайдено» і кнопки «Перевірити»');
    const result = [headers];
    const fields = ['name', 'sex', 'age', 'education', 'occupation', 'marital', 'city', 'email', 'time'];
    let i = 0;
    const defaultNothing = R.defaultTo(0);
    const defaultEmpty = R.defaultTo('Не вказано');
    const ids = [];
    const uniqe = [];
    const contextStatistics = {};
    this.data.forEach(obj => {
      ids.push(obj.id);
    });
    ids.forEach(id => {
      let count = 0;
      for (let i = 0; i < ids.length; ++i) {
        if (ids[i] === id) {
          count++;
        }
      }
      if (count === 1) {
        uniqe.push(id);
      }
    });
    console.log('ids', ids);
    console.log('uniqe', uniqe);
    this.data.forEach(obj => {
      const item = [];
      item.push(obj.id);
      if (obj.data) {
        obj.data = angular.fromJson(obj.data);
      } else {
        obj.data = {};
      }
      if (obj.circles) {
        obj.circles = angular.fromJson(obj.circles);
      } else {
        obj.circles = {};
      }
      const selectedCircle = defaultEmpty(obj.circles.selectedCircle);
      fields.forEach(field => {
        if (field === 'time') {
          item.push(moment(obj.data[field]).format(`Do MMM YY`));
        } else {
          item.push(defaultEmpty(obj.data[field]));
        }
      });
      if (obj.witkin) {
        const witkin = R.values(angular.fromJson(obj.witkin).witkin);
        // console.log('witkin', witkin);
        if (witkin.length === 24) {
          let totalTime12 = 0;
          let totalTime24 = 0;
          let totalSelectedTime = 0;
          let hintCounts = 0;
          for (i = 0; i <= 11; i++) {
            item.push(witkin[i][0].toFixed(1));
            totalTime12 += witkin[i][0];
            hintCounts += defaultNothing(witkin[i][2]);
            totalSelectedTime += defaultNothing(witkin[i][1]);
          }
          for (i = 12; i <= 23; i++) {
            item.push(witkin[i][0].toFixed(1));
            totalTime24 += witkin[i][0];
            hintCounts += defaultNothing(witkin[i][2]);
            totalSelectedTime += defaultNothing(witkin[i][1]);
          }
          item.push(selectedCircle);
          item.push(hintCounts);
          item.push((totalTime12 / 12).toFixed(1));
          item.push((totalTime24 / 12).toFixed(1));
          item.push(totalTime12.toFixed(1) + totalTime24.toFixed(1));
          // item.push((totalSelectedTime / 24).toFixed(1));
          console.log('totalSelectedTime', totalSelectedTime);
        }
        if (uniqe.includes(obj.id)) {
          if (angular.isNumber(selectedCircle)) {
            if (contextStatistics[selectedCircle]) {
              contextStatistics[selectedCircle]++;
            } else {
              contextStatistics[selectedCircle] = 1;
            }
          } else if (contextStatistics['Не вказано']) {
            contextStatistics['Не вказано']++;
          } else {
            contextStatistics['Не вказано'] = 1;
          }
          result.push(item);
        }
      }
    });
    result.push([]);
    result.push(['Статистика по обраному контексту:']);
    result.push(R.keys(contextStatistics));
    result.push(R.values(contextStatistics));
    console.log('result', result);
    let dataString = '';
    let csvContent = '';
    result.forEach((infoArray, index) => {
      dataString = infoArray.join(';');
      csvContent += index < result.length ? dataString + '\n' : dataString;
    });

    const file = new File([csvContent], 'witkin.csv', {type: 'text/csv;charset=utf-8,\uFEFF'});
    saveAs(file, 'witkin.csv');
    this.isWitkinSaved = true;
  }
  checkIfAllSaved() {
    return !(this.isCirclesSaved && this.isWitkinSaved);
  }
  clearResults() {
    this.xhr.open('POST', 'http://karelin.s-host.net/php/truncate.php', true);
    this.xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    this.xhr.send();
  }

  login() {
    console.log('login', this.$scope.password);
    // eslint-disable-next-line
    if (CryptoJS.SHA256(this.$scope.password).toString() === '16d2b85db8b68ea3d0d8f6ed4d73724a51ad62d4cae0d5311abdf3541b94244c') {
      console.log('Authorized!');
      this.isAuthorized = true;
      this.connectToServer();
    }
    this.$scope.password = '';
  }

  refresh() {
    this.canvas.renderAll();
  }

  initCanvas() {
    const coordsX = [];
    const coordsY = [];
    let count = 0;
    this.canvas.getObjects().forEach(obj => {
      // console.log('obj.id', obj.id);
      obj.label = count;
      count++;
      this.addToLayer(obj);
      if (obj.id === 'lines' || obj.id.includes('answer') || obj.id.includes('multiple')) {
        if (obj.id.includes('answer') && this.answers.indexOf(obj.id) === -1) {
          this.answers.push(obj.id);
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
    this.showLayers(['background', 'lines', 'required'].concat(this.answers));
    this.zoomIt(500 / this.realSize);
    this.layers.required.forEach(o => {
      o.left += 500;
    });
    this.refresh();
    console.log('init complete');
  }
  addToLayer(obj) {
    const id = obj.id;
    if (!this.layers[id]) {
      this.layers[id] = [];
    }
    this.layers[id].push(obj);
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
}

ResultsController.$inject = ['$state', '$window', '$scope', '$http'];

export const results = {
  template: require('./Results.html'),
  controller: ResultsController
};

