import angular from 'angular';
import 'angular-mocks';
import {resume} from './Resume';

describe('resume component', () => {
  beforeEach(() => {
    angular
      .module('resume', ['app/components/resume/Resume.html'])
      .component('resume', resume);
    angular.mock.module('resume');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<resume></resume>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
