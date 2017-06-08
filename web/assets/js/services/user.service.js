App.service('UserService', ['$log', 'SocketService', '$mdToast', function($log, SocketService, $mdToast) {
  var self = this;

  // user: {name: '', name_save: '', card: null, color: ''}
  var users = [];

  // card
  var cards = [];

  var _getColorForString = function(text) {
    var colorValue = (parseInt(parseInt(text, 36).toExponential().slice(2,-5), 10) & 0xFFFFFF).toString(16).toUpperCase();
    return '#' + ('000000' + colorValue).slice(-6);
  };

  this.updateUser = function(name, data) {
    $log.debug('UserService:updateUser:', name, data);

    var user = _.filter(users, function(user){
      if (user.name === name) {
        user = _.extend(user, data);
        return true;
      }
    });

    if (!user.length) {
      user = {
        name: name,
        name_save: name.split('@')[0],
        name_short: name.substr(0, 4),
        color: _getColorForString(name),
        card: null
      };

      user = _.extend(user, data);

      users.push(user);

      $mdToast.show($mdToast.simple().content('User ' + user.name_short + ' (' + user.name_save + ') joined this room.'));
    }
    else {
      user = user[0];
    }

    this._storeUsers();

    return user;
  };

  this.getUsers = function() {
    $log.debug('UserService:getUsers', users);

    return users;
  };

  this._storeUsers = function() {
    $log.debug('UserService:_storeUsers');

    var roomStoreUsers = [];
    users.forEach(function(user){
      delete user['$$hashKey'];
      roomStoreUsers.push(user);
    });

    SocketService.emit('host-store-users', roomStoreUsers, function (err, data) {
      $log.debug(err, data);
    });
  };

  this.calculateCards = function() {
    $log.debug('UserService:calculateCards');

    var allowedCardValues = [-1, 0, .5, 1, 2, 3, 5, 8, 13, 20, 40, 100];
    var cardValues = _.intersection(allowedCardValues, _.pluck(users, 'card'));
    cardValues = _.uniq(cardValues).sort(function(a, b){return a-b});

    cardValues = _.map(cardValues, function(value){
      return {
        value: value,
        classes: '',
        users: _.where(users, {card: value})
      };
    });

    // Determine maximum consent.
    var maxVotesCard = null;
    _.each(cardValues, function(card){
      if (!maxVotesCard || card.users.length >= maxVotesCard.users.length) {
        maxVotesCard = card;
      }
    });

    cards.length = 0; // Clear the existing array. assigning [] would cause the watch() to fail.
    _.each(cardValues, function(card){
      if (card.value === maxVotesCard.value) {
        card.classes = 'max-votes';
      }

      cards.push(card);
    });
  };

  this.getCards = function() {
    $log.debug('UserService:getCards', cards);

    return cards;
  };

  SocketService.on('client-left', function (data) {
    $log.debug('UserService:client-left:', data);

    users = _.reject(users, function(user){
      var match = (user.name === data.name);

      if (match) {
        $mdToast.show($mdToast.simple().content('User ' + user.name_short + ' (' + user.name_save + ') left this room.'));
      }

      return match;
    });

    self._storeUsers();
  });

  SocketService.on('channel-data', function(data) {
    $log.debug('UserService:channel-data:', data);

    if (data && data.users) {
      users = data.users;
    }
  });

  SocketService.on('client-joined', function(data) {
    $log.debug('UserService:client-joined:', data);

    self.updateUser(data.name);
  });

  SocketService.on('client-card-selected', function (data) {
    $log.debug('UserService:client-card-selected:', data);

    self.updateUser(data.name, {card: data.value});
    self.calculateCards();
  });
}]);
