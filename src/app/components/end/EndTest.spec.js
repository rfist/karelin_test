import angular from 'angular';
import 'angular-mocks';
import {endTest} from './EndTest';

describe('endTest component', () => {
  beforeEach(() => {
    angular
      .module('endTest', ['app/components/end/EndTest.html'])
      .component('endTest', endTest);
    angular.mock.module('endTest');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<endTest></endTest>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
