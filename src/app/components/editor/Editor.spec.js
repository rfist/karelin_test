import angular from 'angular';
import 'angular-mocks';
import {editor} from './Editor';

describe('editor component', () => {
  beforeEach(() => {
    angular
      .module('editor', ['app/components/editor/Editor.html'])
      .component('editor', editor);
    angular.mock.module('editor');
  });

  it('should...', angular.mock.inject(($rootScope, $compile) => {
    const element = $compile('<editor></editor>')($rootScope);
    $rootScope.$digest();
    expect(element).not.toBeNull();
  }));
});
