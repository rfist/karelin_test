import angular from 'angular';
import 'angular-mocks';
import {main} from './Main';

describe('main component', () => {
  beforeEach(() => {
    angular
      .module('main', ['app/components/Main.html'])
      .component('main', main);
    angular.mock.module('main');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<main></main>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
