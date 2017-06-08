App.controller('ClientController', [
  '$scope', '$log', '$sce', '$mdDialog', 'ChannelService', 'SocketService',
  function($scope, $log, $sce, $mdDialog, ChannelService, SocketService) {

  $scope.data = {};
  $scope.data.userName = '';
  $scope.data.activeIssue = {
    name: ''
  };
  $scope.data.currentVote = null;

  $scope.data.items = [
    {index: 1, value: -1, label: $sce.trustAsHtml('&infin;')},
    {index: 2, value: 0, label: $sce.trustAsHtml('0')},
    {index: 3, value: .5, label: $sce.trustAsHtml('&frac12;')},
    {index: 4, value: 1, label: $sce.trustAsHtml('1')},
    {index: 5, value: 2, label: $sce.trustAsHtml('2')},
    {index: 6, value: 3, label: $sce.trustAsHtml('3')},
    {index: 7, value: 5, label: $sce.trustAsHtml('5')},
    {index: 8, value: 8, label: $sce.trustAsHtml('8')},
    {index: 9, value: 13, label: $sce.trustAsHtml('13')},
    {index: 10, value: 20, label: $sce.trustAsHtml('20')},
    {index: 11, value: 40, label: $sce.trustAsHtml('40')},
    {index: 12, value: 100, label: $sce.trustAsHtml('100')}
  ];

  $scope.voteTopic = function(item){
    $log.debug('ClientController:voteTopic', item);

    $scope.data.currentVote = item;

    SocketService.emit('client-card-select', item.value, function (err, data) {
      $log.debug(err, data);
    });
  };

  $scope.unvoteTopic = function(){
    $log.debug('ClientController:unvoteTopic');

    $scope.data.currentVote = null;

    SocketService.emit('client-card-select', null, function (err, data) {
      $log.debug(err, data);
    });
  };

  $scope.joinChannel = function(isValid, data) {
    if (!isValid) return;

    $log.debug('ClientController:joinChannel', $scope.data.userName);

    $mdDialog.hide();

    var channelInfo = ChannelService.getChannelFromUrl();
    channelInfo.name = $scope.data.userName;

    ChannelService.joinChannel(channelInfo);
  };

  $scope.changeJoinMail = function($event) {
    var emailParts = $event.target.value.split('@', 2);

    if (emailParts.length > 1) {
      var domains = ['gmail.com', 'gmx.de', 'web.de', 'yahoo.com'];

      $log.debug('ClientController:changeJoinMail', $event.target.value);

      var list = document.getElementById('maildomains');

      list.innerHTML = '';
      domains.forEach(function (domain) {
        var option;
        var value = emailParts[0] + '@' + domain;
        if (value.substr(0, $event.target.value.length) === $event.target.value) {
          var option = document.createElement('option');
          option.value = value;
          list.appendChild(option);
        }
      });
    }
  };

  SocketService.on('host-topic-changed', function(data) {
    $log.debug('ClientController:host-topic-changed:', data);

    $scope.data.activeIssue.name = data;
    $scope.data.currentVote = null;
  });
}]);
