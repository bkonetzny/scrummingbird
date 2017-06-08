var App = angular.module('scrummingbirdApp', ['ngRoute', 'ngMaterial', 'ngMdIcons', 'ngMessages', 'ja.qr', 'ui.gravatar'])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('pink')
      .accentPalette('cyan');
  })
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'templates/home.html',
        pageTitle: 'Create'
      })
      .when('/channel/:channel', {
        templateUrl: 'templates/dashboard.html',
        pageTitle: 'Host'
      })
      .when('/join/:channel', {
        templateUrl: 'templates/client.html',
        pageTitle: 'Join'
      });
  });

App.run(['$rootScope', 'ChannelService', function ($rootScope, ChannelService) {
  ChannelService.autoJoinChannel();

  $rootScope.$on("$routeChangeSuccess", function(event, currentRoute, previousRoute) {
    $rootScope.pageTitle = currentRoute.pageTitle;
  });
}]);
