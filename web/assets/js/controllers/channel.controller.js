App.controller('ChannelController', ['$scope', 'ChannelService', function($scope, ChannelService) {
  $scope.data = {};
  $scope.data.channel = ChannelService.channelData;

  $scope.createChannel = function(isValid, data) {
    if (!isValid) return;

    ChannelService.createChannel(data.channel);
  };
}]);
