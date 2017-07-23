import angular from 'angular';
import 'angular-mocks';
import {user} from './User';

describe('user component', () => {
  beforeEach(() => {
    angular
      .module('user', ['app/components/user/User.html'])
      .component('user', user);
    angular.mock.module('user');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<user></user>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
