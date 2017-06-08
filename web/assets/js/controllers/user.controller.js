App.controller('UserController', ['$scope', '$log', 'UserService', 'TopicService', function($scope, $log, UserService, TopicService) {
  $scope.data = {};
  $scope.data.users = UserService.getUsers();
  $scope.data.cards = UserService.getCards();

  $scope.$watch(function () { return UserService.getUsers(); }, function (newVal, oldVal) {
    if (typeof newVal !== 'undefined') {
      $log.debug('UserController:watch:getUsers', newVal);
      $scope.data.users = newVal;
    }
  });

  $scope.$watch(function () { return UserService.getCards(); }, function (newVal, oldVal) {
    if (typeof newVal !== 'undefined') {
      $log.debug('UserController:watch:getCards', newVal);
      $scope.data.cards = newVal;
    }
  });

  $scope.forceRenderCards = false;

  $scope.isPending = function(user) {
    if (_.isNull(user.card)) {
      return true;
    }
    else {
      return false;
    }
  };

  $scope.isReady = function(user) {
    if (_.isNull(user.card)) {
      return false;
    }
    else {
      return true;
    }
  };

  $scope.setForceRenderCards = function() {
    $log.debug('UserController:setForceRenderCards');

    $scope.forceRenderCards = true;
    UserService.calculateCards();
  };

  $scope.allUsersReady = function() {
    $log.debug('UserController:allUsersReady', $scope.data.users);

    if (!$scope.data.users.length) {
      return false;
    }

    if ($scope.forceRenderCards) {
      return true;
    }

    var pendingUsers = _.filter($scope.data.users, function(user){
      return _.isNull(user.card);
    });

    if (!pendingUsers.length) {
      return true;
    }

    return false;
  };

  $scope.hasVotes = function() {
    var usersReady = _.filter($scope.data.users, function(user){
      if (!_.isNull(user.card)) {
        return true;
      }
    });

    return !!(usersReady.length);
  };

  $scope.waitingForText = function() {
    var usersPending = _.filter($scope.data.users, function(user){
      if (_.isNull(user.card)) {
        return true;
      }
    });

    var text = usersPending.length + ' users';
    if (usersPending.length === 1) {
      text = usersPending[0].name_save;
    }

    return text;
  };

  $scope.selectCard = function(card) {
    $log.debug('UserController:selectCard', card);

    TopicService.setTopicResults(card);
  };
}]);
