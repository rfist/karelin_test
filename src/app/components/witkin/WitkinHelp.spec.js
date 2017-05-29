import angular from 'angular';
import 'angular-mocks';
import {witkinHelp} from './WitkinHelp';

describe('witkinHelp component', () => {
  beforeEach(() => {
    angular
      .module('witkinHelp', ['app/components/witkin/WitkinHelp.html'])
      .component('witkinHelp', witkinHelp);
    angular.mock.module('witkinHelp');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<witkinHelp></witkinHelp>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
