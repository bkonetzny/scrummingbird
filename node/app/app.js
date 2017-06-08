var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var Hashids = require('hashids');
var hashids = new Hashids('this is my salt');

// Custom modules:
var log = require('./lib/scrummingbird-logger');
var ScrummingbirdJira = require('./lib/scrummingbird-jira');

var staticRes = '/vagrant/web';
log.info('Using ' + staticRes + ' as static resource.');
app.use(express.static(staticRes));

server.listen(80);

var channelsData = {};

var socketHasRoom = function(socket){
  return (socket.data && socket.data.channelId);
};

var getChannelId = function(socket){
  return (socket.data && socket.data.channelId) ? socket.data.channelId : false;
};

var getChannelData = function(channelId){
  channelsData[channelId] = channelsData[channelId] || {
    channel: {},
    topics: [],
    users: []
  };

  return channelsData[channelId];
};

io.on('connection', function (socket) {
  socket.on('channel-create', function (data) {
    var eventId = 'channel-create';
    var channelId = hashids.encode(Date.now());

    socket.data = {};
    socket.data.channelId = channelId;

    var channelData = getChannelData(channelId);
    channelData.channel = data;

    socket.join(channelId, function(err){
      if (err) {
        log.error(err);
      }
      else {
        log.info({event: eventId, channelId: channelId, socket: socket.data}, 'Host created channel');

        io.to(channelId).emit('channel-created', channelId);
      }
    });
  });

  socket.on('host-channel-join', function (data) {
    var eventId = 'host-channel-join';
    var channelId = data.channelId;

    socket.data = {};
    socket.data.channelId = channelId;

    socket.join(channelId, function(err){
      if (err) {
        log.error(err);
      }
      else {
        var channelData = getChannelData(channelId);

        log.info({event: eventId, channelId: channelId, socket: socket.data}, 'Host joined channel');

        io.to(channelId).emit('channel-data', channelData);
      }
    });
  });

  socket.on('client-channel-join', function (data) {
    var eventId = 'client-channel-join';
    var channelId = data.channelId;

    socket.data = {};
    socket.data.channelId = channelId;
    socket.data.name = data.name;

    socket.join(channelId, function(err){
      if (err) {
        log.error(err);
      }
      else {
        log.info({event: eventId, channelId: channelId, data: data, socket: socket.data}, 'Client joined channel');

        if (data) {
          io.to(channelId).emit('client-joined', data);
        }
      }
    });
  });

  socket.on('client-card-select', function (card) {
    var eventId = 'client-card-select';
    var channelId = getChannelId(socket);

    if (!channelId) {
      log.error({event: eventId, socket: socket.data}, 'Failed to get room from socket.');
      return;
    }

    log.info({event: eventId, channelId: channelId, card: card, socket: socket.data}, 'Client card selected');

    io.to(channelId).emit('client-card-selected', {name: socket.data.name, value: card});
  });

  socket.on('host-store-topics', function (data) {
    var eventId = 'host-store-topics';
    var channelId = getChannelId(socket);

    if (!channelId) {
      log.error({event: eventId, socket: socket.data}, 'Failed to get room from socket.');
      return;
    }

    log.info({event: eventId, channelId: channelId, data: data, socket: socket.data}, 'Host stored topics');

    var channelData = getChannelData(channelId);
    channelData.topics = data;
  });

  socket.on('host-store-users', function (data) {
    var eventId = 'host-store-users';
    var channelId = getChannelId(socket);

    if (!channelId) {
      log.error({event: eventId, socket: socket.data}, 'Failed to get room from socket.');
      return;
    }

    log.info({event: eventId, channelId: channelId, data: data, socket: socket.data}, 'Host stored users');

    var channelData = getChannelData(channelId);
    channelData.users = data;
  });

  socket.on('host-topic-change', function (data) {
    var eventId = 'host-topic-change';
    var channelId = getChannelId(socket);

    if (!channelId) {
      log.error({event: eventId, socket: socket.data}, 'Failed to get room from socket.');
      return;
    }

    log.info({event: eventId, channelId: channelId, data: data, socket: socket.data}, 'Host changed topic');

    io.to(channelId).emit('host-topic-changed', data);
  });

  socket.on('host-card-select', function (data) {
    var eventId = 'host-card-select';
    var channelId = getChannelId(socket);

    if (!channelId) {
      log.error({event: eventId, socket: socket.data}, 'Failed to get room from socket.');
      return;
    }

    log.info({event: eventId, channelId: channelId, data: data, socket: socket.data}, 'Host card selected');

    io.to(channelId).emit('host-card-selected', data);
  });

  socket.on('disconnect', function () {
    var eventId = 'disconnect';
    var channelId = getChannelId(socket);

    if (!channelId) {
      log.warn({event: eventId, socket: socket}, 'Failed to get room from socket.');
      return;
    }

    log.info({event: eventId, channelId: channelId, socket: socket.data}, 'Client disconnect');

    if (socket.data.name) {
      io.to(channelId).emit('client-left', {name: socket.data.name});
    }
  });

  socket.on('jira-get-boards', function () {
    var eventId = 'jira-get-boards';
    var channelId = getChannelId(socket);

    if (!channelId) {
      log.error({event: eventId, socket: socket.data}, 'Failed to get room from socket.');
      return;
    }

    var channelData = getChannelData(channelId);

    var sbJira = new ScrummingbirdJira(channelData.channel.jira);

    log.info({event: eventId, channelId: channelId, socket: socket.data}, 'Jira connect');

    sbJira.getBoards(function(err, data){
      io.to(channelId).emit('remote-jira-boards-loaded', data);
    });
  });

  socket.on('jira-get-sprints', function (board) {
    var eventId = 'jira-get-sprints';
    var channelId = getChannelId(socket);

    if (!channelId) {
      log.error({event: eventId, socket: socket.data}, 'Failed to get room from socket.');
      return;
    }

    var channelData = getChannelData(channelId);

    var sbJira = new ScrummingbirdJira(channelData.channel.jira);

    log.info({event: eventId, channelId: channelId, board: board, socket: socket.data}, 'Jira connect');

    sbJira.getSprints({boardID: board.id}, function(err, data){
      io.to(channelId).emit('remote-jira-sprints-loaded', data);
    });
  });

  socket.on('jira-get-issues', function (sprint) {
    var eventId = 'jira-get-issues';
    var channelId = getChannelId(socket);

    if (!channelId) {
      log.error({event: eventId, socket: socket.data}, 'Failed to get room from socket.');
      return;
    }

    var channelData = getChannelData(channelId);

    var sbJira = new ScrummingbirdJira(channelData.channel.jira);

    log.info({event: eventId, channelId: channelId, sprint: sprint, socket: socket.data}, 'Jira connect');

    sbJira.getIssues({sprint: sprint.id}, function(err, data){
      io.to(channelId).emit('remote-jira-issues-loaded', data);
    });
  });
});
