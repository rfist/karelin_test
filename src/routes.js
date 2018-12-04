export default routesConfig;

/** @ngInject */
function routesConfig($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(false).hashPrefix('!');
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('app', {
      url: '/',
      component: 'startPage'
    })
    .state('start', {
      url: '/start',
      component: 'startPage'
    })
    .state('editor', {
      url: '/editor',
      component: 'editor'
    })
    .state('witkin-start', {
      url: '/visual_test:id',
      views: {
        user: 'userComponent',
        app: 'visualTest'
      }
    })
    .state('witkin', {
      url: '/witkin-help',
      views: {
        user: 'userComponent',
        app: 'witkinHelp'
      }
    })
    .state('witkin-text', {
      url: '/witkin-help-text',
      views: {
        user: 'userComponent',
        app: 'witkinHelpText'
      }
    })
    .state('witkin-before-start', {
      url: '/witkin-help2',
      views: {
        user: 'userComponent',
        app: 'witkinHelp2'
      }
    })
    .state('assertions', {
      url: '/assertions',
      views: {
        user: 'userComponent',
        app: 'assertionTest'
      }
    })
    .state('survey1', {
      url: '/survey1',
      views: {
        user: 'userComponent',
        app: 'survey1'
      }
    })
    .state('survey2', {
      url: '/survey2',
      views: {
        user: 'userComponent',
        app: 'survey2'
      }
    })
    .state('circles', {
      url: '/circles',
      views: {
        user: 'userComponent',
        app: 'circlesTest'
      }
    })
    .state('restore', {
      url: '/restore',
      views: {
        user: 'userComponent',
        app: 'resume'
      }
    })
    .state('results', {
      url: '/890720cb2de3d205e39b2dfaeee4add6',
      component: 'results'
    })
    .state('end', {
      url: '/end',
      component: 'endTest'
    })
    .state('example', {
      url: '/example:id',
      component: 'visualTest'
    });
}
