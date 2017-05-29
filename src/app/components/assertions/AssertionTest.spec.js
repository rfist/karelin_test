import angular from 'angular';
import 'angular-mocks';
import {assertionTest} from './AssertionTest';

describe('assertionTest component', () => {
  beforeEach(() => {
    angular
      .module('assertionTest', ['app/components/assertions/AssertionTest.html'])
      .component('assertionTest', assertionTest);
    angular.mock.module('assertionTest');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<assertionTest></assertionTest>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
