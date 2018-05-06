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
    // this.connectToServer();
    this.statistics = {allTests: 0, allTestsPassInfo: {}};
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
      this.users = [];
      const ids = [];
      const desc = (a, b) => b.date - a.date;
      this.data = R.sort(desc, result);
      console.log('result', this.data);
      this.data.forEach(user => {
        if (ids.includes(user.inner_id)) {
          console.error('inner_id error', user, user.inner_id);
        } else {
          ids.push(user.inner_id);
        }
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
      this.makeStatistics();
    });
  }
  makeStatistics() {
    console.log('this.users', this.users.length);
    this.statistics.allTests = 0;
    this.statistics.allTestsPassInfo = {};
    this.users.forEach(user => {
      if (user.history.length === 12) {
        this.statistics.allTests++;
        const context = angular.fromJson(user.circles).selectedCircle;
        if (this.statistics.allTestsPassInfo[context]) {
          this.statistics.allTestsPassInfo[context]++;
        } else {
          this.statistics.allTestsPassInfo[context] = 1;
        }
      }
    }
  );
    this.$scope.$digest();
  }
  findMedianOfSelection(users) {
    const statistics = [
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      [],
      []
    ];
    users.forEach(user => {
      if (user.circles) {
        if (user.history.length === 12) {
          for (let i = 0; i < 12; i++) {
            const step = user.history[i];
            const stepData = step.data[step.data.length - 1];
            const selectedTime = parseInt((R.defaultTo({selectedTime: 0})(stepData)).selectedTime, 10);
            if (selectedTime > 0) {
              statistics[i].push(selectedTime);
            }
          }
        }
      }
    });
    return R.map(R.median, statistics);
  }
  saveResults() {
    const asc = (a, b) => a.id - b.id;
    const inputUsers = R.sort(asc, this.users);
    // const inputUsers = R.sort(asc, this.users.splice(0, 10));
    // const inputUsers = [].concat(this.users);
    // const inputUsers = this.users.splice(0, 10);
    const medianValues = this.findMedianOfSelection(inputUsers);
    const defaultEmpty = R.defaultTo('Не вказано');
    console.log('users', inputUsers);
    const contextStatistic = {};
    const witkinStatistic = {};
    const headers1 = ['ID', 'Ім\'я', 'Стать', 'Вік', 'Освіта', 'Професія', 'Сімейний стан', 'Місто', 'Електронна адреса', 'Дата заповнення', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', 'Контекст', 'Тест Віткіна'];
    const headers2 = ['ID', 'Ім\'я', 'Стать', 'Вік', 'Освіта', 'Професія', 'Сімейний стан', 'Місто', 'Електронна адреса', 'Дата заповнення', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Контекст', 'TOTAL', 'Кількість використаних підказок', 'Підсумковий час', '', '', 'Потребує аналізу (<5 с)', 'ID', 'Сумарний час пошуку', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '', '', 'Потребує аналізу (>5 с)', 'ID', 'Сумарний час простою', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '', '', 'Потребує аналізу (поза нормою ' + medianValues.join() + ' )', 'ID', 'Сумарний час виділення', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '', '', 'ID', 'Сумарна кількість спроб', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '', '', 'ID', 'Сумарний відкорегований час', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'Середній час пошуку'];
    let allRows = [];
    const witkinResults = [];
    const incompleteWitkinResults = [];
    const incompleteWitkinResultsHeaders = ['ID', 'Ім\'я', 'Стать', 'Вік', 'Освіта', 'Професія', 'Сімейний стан', 'Місто', 'Електронна адреса', 'Дата заповнення', 'Контекст', '', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '', 'Кількість використаних підказок'];
    const TOTAL_TIME_POSITION = 23;
    const HINTS_AMOUNT_POSITION = 24;
    allRows.push(headers1);
    inputUsers.forEach(user => {
      const userData = [];
      const info = angular.fromJson(user.data);
      if (user.circles) {
        const {assertions, selectedCircle} = angular.fromJson(user.circles);
        if (contextStatistic[selectedCircle]) {
          contextStatistic[selectedCircle] += 1;
        } else {
          contextStatistic[selectedCircle] = 1;
        }
        userData.push(user.id);
        userData.push(defaultEmpty(info.name));
        userData.push(defaultEmpty(info.sex === 'female' ? 'жінка' : 'чоловік'));
        userData.push(defaultEmpty(info.age));
        userData.push(defaultEmpty(info.education));
        userData.push(defaultEmpty(info.occupation));
        userData.push(defaultEmpty(info.marital));
        userData.push(defaultEmpty(info.city));
        userData.push(defaultEmpty(info.email));
        userData.push(moment(info.time).format(`Do MMM YY`));
        for (let i = 1; i <= 133; i++) {
          userData.push(defaultEmpty(assertions[i]));
        }
        userData.push(selectedCircle);
        if (user.history.length === 12) {
          userData.push('+');
          if (witkinStatistic[selectedCircle]) {
            witkinStatistic[selectedCircle] += 1;
          } else {
            witkinStatistic[selectedCircle] = 1;
          }
          const witkinData = [];
          let countOfAnswersLessFiveSeconds = 0;
          let countOfTimeBeforeFirstClickMoreFiveSeconds = 0;
          let countOfNotMedianSelectValues = 0;
          let totalTimeBeforeFirstClick = 0;
          let totalSelectedTime = 0;
          const timeBeforeFirstClickData = [];
          const selectedTimeData = [];
          const triesCount = [];
          const fixedTotalTimeDueSelectedTime = [];
          for (let i = 0; i < 12; i++) {
            fixedTotalTimeDueSelectedTime.push(0);
          }
          let amountOfPenaltySecondsToTotalTime = 0;
          let countOfUsedHint = 0;
          const sparesData = [];
          witkinData.push(user.id);
          witkinData.push(defaultEmpty(info.name));
          witkinData.push(defaultEmpty(info.sex === 'female' ? 'жінка' : 'чоловік'));
          witkinData.push(defaultEmpty(info.age));
          witkinData.push(defaultEmpty(info.education));
          witkinData.push(defaultEmpty(info.occupation));
          witkinData.push(defaultEmpty(info.marital));
          witkinData.push(defaultEmpty(info.city));
          witkinData.push(defaultEmpty(info.email));
          witkinData.push(moment(info.time).format(`Do MMM YY`));
          const passedData = [];
          const totalPassedTimeCalculated = [];
          let level = 0;
          user.history.forEach(step => {
            let passedTimeCalculated = 0;
            const stepData = step.data[step.data.length - 1];
            // compare with median value
            const selectedTime = parseInt((R.defaultTo({selectedTime: 0})(stepData)).selectedTime, 10);
            const medianValue = medianValues[level];
            if (selectedTime / medianValue > 1.5) {
              countOfNotMedianSelectValues++;
            }
            level++;
            // end
            triesCount.push(step.data.length);
            let joinedTimeBeforFirstClick = step.data.reduce((prev, current, index) => {// считаем время простоя
              current = (((R.defaultTo({timeBeforeFirstClick: 0})(current)).timeBeforeFirstClick).toFixed(2)) / 1; // чтоб не было стрингов
              if (current >= 5) {
                countOfTimeBeforeFirstClickMoreFiveSeconds++;// todo: для больше 5 секунд для всех попыток
                passedTimeCalculated += (current - 4);
              }
              current = parseInt(current, 10);
              totalTimeBeforeFirstClick += current;
              let result = prev + current;
              if (index < (step.data.length - 1)) {
                result += '/';
              }
              return result;
            }, '');
            if (joinedTimeBeforFirstClick.length === 0) {
              joinedTimeBeforFirstClick = 0;
            }
            timeBeforeFirstClickData.push(joinedTimeBeforFirstClick);
            let joinedSelectedTime = step.data.reduce((prev, current, index) => {
              current = parseInt((R.defaultTo({selectedTime: 0})(current)).selectedTime, 10);
              if (current > medianValue) {
                fixedTotalTimeDueSelectedTime[level - 1] += (current - medianValue);
              }
              totalSelectedTime += current;
              let result = prev + current;
              if (index < (step.data.length - 1)) {
                result += '/';
              }
              return result;
            }, '');
            // amountOfPenaltySecondsToTotalTime += fixedTotalTimeDueSelectedTime[level - 1];
            if (joinedSelectedTime.length === 0) {
              joinedSelectedTime = 0;
            }
            selectedTimeData.push(joinedSelectedTime);
            const passedTime = (((R.defaultTo({passedTime: 120})(stepData)).passedTime).toFixed(2)) / 1;//  потраченное время во время последней попытки
            if (passedTime < 5) {
              countOfAnswersLessFiveSeconds++;
            }
            passedTimeCalculated += passedTime;
            const sparesCount = (R.defaultTo({sparesCount: 0})(stepData)).sparesCount;
            countOfUsedHint += (R.defaultTo({countOfUsedHint: 0})(stepData)).countOfUsedHint;
            if (passedTimeCalculated > 120 || passedTimeCalculated === 0) {
              passedTimeCalculated = 120;
            }
            witkinData.push(passedTimeCalculated);
            totalPassedTimeCalculated.push(passedTimeCalculated);
            //
            const oldValue = passedTimeCalculated;
            fixedTotalTimeDueSelectedTime[level - 1] += passedTimeCalculated;
            if (fixedTotalTimeDueSelectedTime[level - 1] >= 120) {
              fixedTotalTimeDueSelectedTime[level - 1] = 120;
              if (oldValue < 120) {
                amountOfPenaltySecondsToTotalTime += (120 - oldValue);
              }
            } else {
              amountOfPenaltySecondsToTotalTime += (fixedTotalTimeDueSelectedTime[level - 1] - passedTimeCalculated);
            }
            passedData.push(passedTime);
            sparesData.push(sparesCount);
          });
          witkinData.push(selectedCircle);
          witkinData.push('');
          witkinData.push(countOfUsedHint);
          const reducedTotalPassedTimeCalculated = totalPassedTimeCalculated.reduce((prev, current) => parseFloat(prev) + parseFloat(current));
          witkinData.push(reducedTotalPassedTimeCalculated);// Підсумковий час
          witkinData.push('');
          witkinData.push('');
          if (countOfAnswersLessFiveSeconds > 1) {
            witkinData.push('*');
          } else {
            witkinData.push('');
          }
          witkinData.push(user.id);
          witkinData.push(passedData.reduce((prev, current) => parseFloat(prev) + parseFloat(current)));// sum of first 12
          passedData.forEach(p => witkinData.push(parseInt(p, 10)));// repeat first 12
          witkinData.push('');
          witkinData.push('');
          if (countOfTimeBeforeFirstClickMoreFiveSeconds > 0) {
            witkinData.push('*');
          } else {
            witkinData.push('');
          }
          witkinData.push(user.id);
          witkinData.push(totalTimeBeforeFirstClick);// todo: Только удачные попытки
          timeBeforeFirstClickData.forEach(t => witkinData.push(t));// all times before first click
          witkinData.push('');
          witkinData.push('');
          if (countOfNotMedianSelectValues > 1) {
            witkinData.push('*');
          } else {
            witkinData.push('');
          }
          witkinData.push(user.id);
          witkinData.push(totalSelectedTime);
          selectedTimeData.forEach(s => witkinData.push(s));// all times before first click
          witkinData.push('');
          witkinData.push('');
          witkinData.push(user.id);
          witkinData.push(triesCount.reduce((prev, current) => prev + current));
          triesCount.forEach(tr => witkinData.push(tr));// all times before first click
          witkinResults.push(witkinData);
          witkinData.push('');
          witkinData.push('');
          witkinData.push(user.id);
          const totalTime = reducedTotalPassedTimeCalculated + amountOfPenaltySecondsToTotalTime;
          witkinData.push(totalTime);
          witkinData[TOTAL_TIME_POSITION] = totalTime + (witkinData[HINTS_AMOUNT_POSITION] * 10);
          if (witkinData[TOTAL_TIME_POSITION] > 1440) {
            witkinData[TOTAL_TIME_POSITION] = 1440;
          }
          fixedTotalTimeDueSelectedTime.forEach(f => witkinData.push(f));// all times before first click
          witkinData.push((witkinData[TOTAL_TIME_POSITION] / 12).toFixed(2));
        } else if (user.history.length > 0) {
          let incompleteWitkinData = [];
          incompleteWitkinData.push(user.id);
          incompleteWitkinData.push(defaultEmpty(info.name));
          incompleteWitkinData.push(defaultEmpty(info.sex === 'female' ? 'жінка' : 'чоловік'));
          incompleteWitkinData.push(defaultEmpty(info.age));
          incompleteWitkinData.push(defaultEmpty(info.education));
          incompleteWitkinData.push(defaultEmpty(info.occupation));
          incompleteWitkinData.push(defaultEmpty(info.marital));
          incompleteWitkinData.push(defaultEmpty(info.city));
          incompleteWitkinData.push(defaultEmpty(info.email));
          incompleteWitkinData.push(moment(info.time).format(`Do MMM YY`));
          // console.log('user.history', incompleteWitkinData, user.history);
          let level = 0;
          let countOfUsedHint = 0;
          const selectedTimes = new Array(12).fill('');
          user.history.forEach(step => {
            const stepData = step.data[step.data.length - 1];
            console.log('stepData', stepData, level);
            if (stepData && stepData.selectedTime) {
              selectedTimes[level] = stepData.selectedTime.toFixed(2);
              // console.log('ffffff', stepData.selectedTime.toFixed(2));
            } else {
              selectedTimes[level] = 120;
            }
            level++;
            countOfUsedHint += (R.defaultTo({countOfUsedHint: 0})(stepData)).countOfUsedHint;
          });
          incompleteWitkinData.push(selectedCircle);
          incompleteWitkinData.push('');
          incompleteWitkinData = incompleteWitkinData.concat(selectedTimes);
          incompleteWitkinData.push('');
          incompleteWitkinData.push(countOfUsedHint);
          incompleteWitkinResults.push(incompleteWitkinData);
        }
        allRows.push(userData);
      } else {
        console.error('No circles information!', user);
      }
    });
    allRows.push([]);
    allRows.push([]);
    allRows.push(['Опитувальник: статистика за контекстами']);
    allRows.push(Object.keys(contextStatistic));
    allRows.push(Object.values(contextStatistic));
    // witkin
    allRows.push([]);
    allRows.push([]);
    allRows.push(headers2);
    allRows = allRows.concat(witkinResults);
    allRows.push([]);
    allRows.push([]);
    allRows.push(['Віткін: статистика за контекстами']);
    allRows.push(Object.keys(witkinStatistic));
    allRows.push(Object.values(witkinStatistic));
    allRows.push([]);
    allRows.push([]);
    allRows.push(incompleteWitkinResultsHeaders);
    incompleteWitkinResults.forEach(i => allRows.push(i));
    let dataString = '';
    let csvContent = '';
    allRows.forEach((infoArray, index) => {
      infoArray.forEach((s, i, arr) => {
        if (angular.isString(s)) {
          arr[i] = s.replace(/;/g, ' ');
        }
      }); // escape all ';' symbols
      dataString = infoArray.join(';');
      csvContent += index < allRows.length ? dataString + '\n' : dataString;
    });

    const file = new File([csvContent], 'results.csv', {type: 'text/csv;charset=utf-8,\uFEFF'});
    saveAs(file, 'results.csv');
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

