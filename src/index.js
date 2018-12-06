import angular from 'angular';

import 'angular-ui-router';
import routesConfig from './routes';

import {main} from './app/components/Main';
import {editor} from './app/components/editor/Editor';
import {witkinTest} from './app/components/witkin/WitkinTest';
import {witkinHelp} from './app/components/witkin/WitkinHelp';
import {witkinHelpText} from './app/components/witkin/witkinHelpText';
import {witkinHelp2} from './app/components/witkin/WitkinHelp2';
import {assertionTest} from './app/components/assertions/AssertionTest';
import {info} from './app/components/info/Info';
import {survey1} from './app/components/survey1/Survey1';
import {survey2} from './app/components/survey2/Survey2';
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
  .module('app', ['ui.router', 'ngMaterial', 'youtube-embed'])
  .config(routesConfig)
  .service('userService', UserService)
  .component('app', main)
  .component('editor', editor)
  .component('visualTest', witkinTest)
  .component('witkinHelp', witkinHelp)
  .component('witkinHelpText', witkinHelpText)
  .component('witkinHelp2', witkinHelp2)
  .component('assertionTest', assertionTest)
  .component('info', info)
  .component('survey1', survey1)
  .component('survey2', survey2)
  .component('circlesTest', circlesTest)
  .component('results', results)
  .component('userComponent', user)
  .component('startPage', startPage)
  .component('resume', resume)
  .component('endTest', endTest);
