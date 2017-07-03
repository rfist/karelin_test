class ResultsController {
  constructor($state, userService, $window, $scope) {
    this.isDataReady = false;
    this.$window = $window;
    this.$scope = $scope;
    this.connectToServer();
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
      console.log('result', result);
      this.data = result;
      const lastNumber = Math.max.apply(this, R.pluck('id')(result));
      this.id = lastNumber + 1;
      this.isDataReady = true;
      this.$scope.$digest();
      console.log('user id', this.id);
    });
  }
  saveCirclesResults() {
    const headers = ['Ім\'я', 'Стать', 'Вік', 'Освіта', 'Професія', 'Сімейний стан', 'Місто', 'Електронна адреса', 'Дата заповнення'];
    for (let i = 1; i <= 133; i++) {
      headers.push(i);
    }
    headers.push('Контекст');
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
      item.push(defaultEmpty(obj.circles.selectedCircle));
      result.push(item);
    });
    console.log('result', result);
    let dataString = '';
    let csvContent = '';
    result.forEach((infoArray, index) => {
      dataString = infoArray.join(';');
      csvContent += index < result.length ? dataString + '\n' : dataString;
    });

    const file = new File([csvContent], 'circles.csv', {type: 'text/csv;charset=utf-8,\uFEFF'});
    saveAs(file, 'circles.csv');
  }
  saveWitkinResults() {
    const headers = ['Ім\'я', 'Стать', 'Вік', 'Освіта', 'Професія', 'Сімейний стан', 'Місто', 'Електронна адреса', 'Дата заповнення'];
    for (let i = 1; i <= 24; i++) {
      headers.push(i);
    }
    headers.push('Кількість використаних підказок');
    headers.push('Середній час за перші 12 завдань');
    headers.push('Середній час за останні 12 завдань');
    headers.push('Сумарний час');
    const result = [headers];
    const fields = ['name', 'sex', 'age', 'education', 'occupation', 'marital', 'city', 'email', 'time'];
    let i = 0;
    const defaultNothing = R.defaultTo(0);
    const defaultEmpty = R.defaultTo('Не вказано');
    this.data.forEach(obj => {
      const item = [];
      if (obj.data) {
        obj.data = angular.fromJson(obj.data);
      } else {
        obj.data = {};
      }
      fields.forEach(field => {
        if (field === 'time') {
          item.push(moment(obj.data[field]).format(`Do MMM YY`));
        } else {
          item.push(defaultEmpty(obj.data[field]));
        }
      });
      if (obj.witkin) {
        const witkin = R.values(angular.fromJson(obj.witkin).witkin);
        console.log('witkin', witkin);
        if (witkin.length === 24) {
          let totalTime12 = 0;
          let totalTime24 = 0;
          let hintCounts = 0;
          for (i = 0; i <= 11; i++) {
            item.push(witkin[i][0].toFixed(1));
            totalTime12 += witkin[i][0];
            hintCounts += defaultNothing(witkin[i][2]);
          }
          for (i = 12; i <= 23; i++) {
            item.push(witkin[i][0].toFixed(1));
            totalTime24 += witkin[i][0];
            hintCounts += defaultNothing(witkin[i][2]);
          }
          item.push(hintCounts);
          item.push((totalTime12 / 12).toFixed(1));
          item.push((totalTime24 / 12).toFixed(1));
          item.push(totalTime12.toFixed(1) + totalTime24.toFixed(1));
        }
      }
      result.push(item);
    });
    console.log('result', result);
    let dataString = '';
    let csvContent = '';
    result.forEach((infoArray, index) => {
      dataString = infoArray.join(';');
      csvContent += index < result.length ? dataString + '\n' : dataString;
    });

    const file = new File([csvContent], 'witkin.csv', {type: 'text/csv;charset=utf-8,\uFEFF'});
    saveAs(file, 'witkin.csv');
  }
}

ResultsController.$inject = ['$state', 'userService', '$window', '$scope'];

export const results = {
  template: require('./Results.html'),
  controller: ResultsController
};

