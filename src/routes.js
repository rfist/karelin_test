export default routesConfig;

/** @ngInject */
function routesConfig($stateProvider, $urlRouterProvider, $locationProvider) {
  $locationProvider.html5Mode(false).hashPrefix('!');
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('app', {
      url: '/',
      component: 'app'
    })
    .state('editor', {
      url: '/editor',
      component: 'editor'
    })
    .state('witkin-start', {
      url: '/visual_test:id',
      component: 'visualTest'
    })
    .state('witkin', {
      url: '/witkin-help',
      component: 'witkinHelp'
    })
    .state('witkin-before-start', {
      url: '/witkin-help2',
      component: 'witkinHelp2'
    })
    .state('assertions', {
      url: '/assertions',
      component: 'assertionTest'
    })
    .state('circles', {
      url: '/circles',
      component: 'circlesTest'
    })
    .state('end', {
      url: '/end',
      component: 'endTest'
    });
}
