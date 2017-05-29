import angular from 'angular';
import 'angular-mocks';
import {witkinTest} from './WitkinTest';

describe('witkinTest component', () => {
  beforeEach(() => {
    angular
      .module('witkinTest', ['app/components/witkin/WitkinTest.html'])
      .component('witkinTest', witkinTest);
    angular.mock.module('witkinTest');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<witkinTest></witkinTest>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
