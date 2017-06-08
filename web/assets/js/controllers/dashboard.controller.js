App.controller('DashboardController', ['$scope', '$log', 'DashboardService', '$mdSidenav', function($scope, $log, DashboardService, $mdSidenav) {
  $scope.data = DashboardService.data;

  $scope.toggleMenu = function() {
    $log.debug('DashboardController.toggleMenu');
    $mdSidenav('menu').toggle();
  };
}]);
