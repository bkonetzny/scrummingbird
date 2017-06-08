App.service('ChannelService', [
  '$log', 'SocketService', '$mdDialog', '$location',
  function($log, SocketService, $mdDialog, $location) {

  var self = this;

  this.channelData = {
    name: '',
    issue_mode: 'manual',
    jira: {
      host: '',
      username: '',
      password: ''
    }
  };

  this.getChannelFromUrl = function() {
    var channelInfo = {
      channelId: null,
      mode: null
    };

    var windowHash = window.location.hash;
    var channelIdentifierHost = '#/channel/';

    if (windowHash.indexOf(channelIdentifierHost) !== -1) {
      channelInfo.channelId = windowHash.replace(channelIdentifierHost, '');
      channelInfo.mode = 'host';
    }

    var channelIdentifierClient = '#/join/';

    if (windowHash.indexOf(channelIdentifierClient) !== -1) {
      channelInfo.channelId = windowHash.replace(channelIdentifierClient, '');
      channelInfo.mode = 'client';
    }

    $log.debug('ChannelService:channelInfo:', channelInfo);

    return channelInfo;
  };

  this.joinChannel = function(channelInfo) {
    $log.debug('ChannelService:joinChannel:', channelInfo);

    SocketService.emit(channelInfo.mode + '-channel-join', channelInfo, function (err, data) {
      $log.debug(err, data);
    });
  };

  this.autoJoinChannel = function() {
    var channelInfo = this.getChannelFromUrl();

    $log.debug('ChannelService:autoJoinChannel:', channelInfo);

    if (channelInfo.channelId && channelInfo.mode) {
      if (channelInfo.mode === 'client') {
        $mdDialog.show({
          template:
            '<md-dialog>' +
            '  <form name="joinForm" ng-submit="joinChannel(joinForm.$valid, data)">' +
            '    <md-content>' +
            '      <md-input-container>' +
            '        <label>E-Mail</label>' +
            '        <input name="email" ng-model="data.userName" ng-keypress="changeJoinMail($event)" type="email" list="maildomains" required>' +
            '        <datalist id="maildomains"></datalist>' +
            '        <ng-messages for="joinForm.email.$error" include="templates/form-errors.inc.html">' +
            '      </md-input-container>' +
            '    </md-content>' +
            '    <div class="md-actions">' +
            '      <md-button>Join</md-button>' +
            '    </div>' +
            '  </form>' +
            '</md-dialog>',
          controller: 'ClientController',
          clickOutsideToClose: false,
          escapeToClose: false
        });
      }
      else {
        this.joinChannel(channelInfo);
      }
    }
  };

  this.createChannel = function(channel) {
    $log.debug('ChannelService:createChannel:', channel);

    SocketService.emit('channel-create', channel, function (err, data) {
      $log.debug(err, data);
    });
  };

  SocketService.on('channel-created', function(channelId) {
    $log.debug('ChannelService:channel-created:', channelId);

    $location.path('/channel/' + channelId);
  });

  SocketService.on('channel-data', function(data) {
    $log.debug('ChannelService:channel-data:', data);

    if (data && data.channel) {
      if (!data.channel.name) {
        $location.path('');
        return;
      }

      self.channelData.name = data.channel.name;
//      self.channelData = data.channel;
//      $log.debug('ChannelService:channel-data-now:', self.channelData);
    }
  });
}]);
