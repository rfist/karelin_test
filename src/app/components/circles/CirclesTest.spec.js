import angular from 'angular';
import 'angular-mocks';
import {circlesTest} from './CirclesTest';

describe('circlesTest component', () => {
  beforeEach(() => {
    angular
      .module('circlesTest', ['app/components/circles/CirclesTest.html'])
      .component('circlesTest', circlesTest);
    angular.mock.module('circlesTest');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<circlesTest></circlesTest>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
