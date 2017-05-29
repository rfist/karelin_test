import angular from 'angular';

import 'angular-ui-router';
import routesConfig from './routes';

import {main} from './app/components/Main';
import {editor} from './app/components/editor/Editor';
import {witkinTest} from './app/components/witkin/WitkinTest';
import {witkinHelp} from './app/components/witkin/WitkinHelp';
import {assertionTest} from './app/components/assertions/AssertionTest';
import {circlesTest} from './app/components/circles/CirclesTest';
import {endTest} from './app/components/end/EndTest';
import './index.styl';
import UserService from './app/services/UserService';

export const app = 'app';

angular
  .module('app', ['ui.router'])
  .config(routesConfig)
  .service('userService', UserService)
  .component('app', main)
  .component('editor', editor)
  .component('visualTest', witkinTest)
  .component('witkinHelp', witkinHelp)
  .component('assertionTest', assertionTest)
  .component('circlesTest', circlesTest)
  .component('endTest', endTest);
