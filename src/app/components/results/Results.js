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
    const headers = ['Ім\'я', 'Стать', 'Вік', 'Освіта', 'Професія', 'Сімейний стан', 'Місто', 'Електронна адреса', 'Дата заповнення', 'Обраний варіант з колом'];
    for (let i = 1; i <= 133; i++) {
      headers.push(i);
    }
    const result = [headers];
    const defaultNothing = R.defaultTo('Не вказано');
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
          item.push(defaultNothing(obj.data[field]));
        }
      });
      // колонка, какой круг выбран
      item.push(defaultNothing(obj.circles.selectedCircle));
      if (obj.circles.assertions) {
        for (let i = 1; i <= 133; i++) {
          item.push(defaultNothing(obj.circles.assertions[i]));
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

    const file = new File([csvContent], 'circles.csv', {type: 'text/csv;charset=utf-8'});
    saveAs(file, 'circles.csv');
  }
}

ResultsController.$inject = ['$state', 'userService', '$window', '$scope'];

export const results = {
  template: require('./Results.html'),
  controller: ResultsController
};

