import angular from 'angular';
import 'angular-mocks';
import {startPage} from './StartPage';

describe('startPage component', () => {
  beforeEach(() => {
    angular
      .module('startPage', ['app/start/StartPage.html'])
      .component('startPage', startPage);
    angular.mock.module('startPage');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<startPage></startPage>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
