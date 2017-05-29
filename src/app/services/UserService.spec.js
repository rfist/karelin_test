import angular from 'angular';
import 'angular-mocks';
import UserService from './UserService';

describe('UserService service', () => {
  beforeEach(() => {
    angular
      .module('UserService', [])
      .service('UserService', UserService);
    angular.mock.module('UserService');
  });

  it('should', angular.mock.inject(UserService => {
    expect(UserService.getData()).toEqual(3);
  }));
});
