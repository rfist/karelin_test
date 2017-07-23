import angular from 'angular';

import 'angular-ui-router';
import routesConfig from './routes';

import {main} from './app/components/Main';
import {editor} from './app/components/editor/Editor';
import {witkinTest} from './app/components/witkin/WitkinTest';
import {witkinHelp} from './app/components/witkin/WitkinHelp';
import {witkinHelp2} from './app/components/witkin/WitkinHelp2';
import {assertionTest} from './app/components/assertions/AssertionTest';
import {results} from './app/components/results/Results';
import {circlesTest} from './app/components/circles/CirclesTest';
import {endTest} from './app/components/end/EndTest';
import './index.styl';
import UserService from './app/services/UserService';
import {user} from './app/components/user/User';
import {startPage} from './app/components/start/StartPage';
import {resume} from './app/components/resume/Resume';

export const app = 'app';

angular
  .module('app', ['ui.router'])
  .config(routesConfig)
  .service('userService', UserService)
  .component('app', main)
  .component('editor', editor)
  .component('visualTest', witkinTest)
  .component('witkinHelp', witkinHelp)
  .component('witkinHelp2', witkinHelp2)
  .component('assertionTest', assertionTest)
  .component('circlesTest', circlesTest)
  .component('results', results)
  .component('userComponent', user)
  .component('startPage', startPage)
  .component('resume', resume)
  .component('endTest', endTest);
