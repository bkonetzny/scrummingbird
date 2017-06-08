App.service('TopicService', [
  '$log', 'SocketService', '$mdToast',
  function($log, SocketService, $mdToast) {

  var self = this;

  // topic: {title: '', url: null, storypoints: 0, results: {}, active: true|false}
  var topics = [];

  this.addTopic = function(topic) {
    var topicData = topic;
    topicData.url = topicData.url || null;
    topicData.storypoints = (topicData.storypoints >= 0) ? topicData.storypoints : null;
    topicData.results = {};
    topicData.active = false;

    topics.push(topicData);

    this._storeTopics();
  };

  this._storeTopics = function() {
    $log.debug('TopicService:_storeTopics');

    var roomStoreTopics = [];
    topics.forEach(function(topic){
      delete topic['$$hashKey'];
      roomStoreTopics.push(topic);
    });

    SocketService.emit('host-store-topics', roomStoreTopics, function (err, data) {
      $log.debug(err, data);
    });
  };

  this.getTopics = function() {
    $log.debug('TopicService:getTopics', topics);

    return topics;
  };

  this.setNextTopicActive = function() {
    var setActive = false
      , activeTopic;

    topics.forEach(function(topic){
      if (setActive && !activeTopic) {
        topic.active = true;
        activeTopic = topic;
      }
      else if (topic.active) {
        setActive = true;
        topic.active = false;
      }
    });

    if (!activeTopic && topics.length) {
      topics[0].active = true;
      activeTopic = topics[0];
    }

    $log.debug('TopicService:setNextTopicActive', activeTopic);

    if (activeTopic) {
      SocketService.emit('host-topic-change', activeTopic.title, function (err, data) {
        console.log(err, data);
      });
    }
  };

  this.setTopicActive = function(active_topic) {
    topics.forEach(function(topic){
      if (topic === active_topic) {
        topic.active = true;
        activeTopic = topic;

        $mdToast.show($mdToast.simple().content('Active topic is now ' + activeTopic.title + '.'));
      }
      else if (topic.active) {
        topic.active = false;
      }
    });

    $log.debug('TopicService:setTopicActive', activeTopic);

    SocketService.emit('host-topic-change', activeTopic.title, function (err, data) {
      console.log(err, data);
    });
  };

  this.removeTopic = function(remove_topic) {
    topics = _.reject(topics, function(topic){
      return (topic === remove_topic);
    });

    this._storeTopics();

    $log.debug('TopicService:removeTopic', remove_topic);
  };

  this.getActiveTopic = function(addMissing) {
    addMissing = addMissing || false;
    var activeTopic = null;

    topics.forEach(function(topic){
      if (topic.active) {
        activeTopic = topic;
      }
    });

    if (!activeTopic && addMissing) {
      var activeTopic = {
        title: 'New topic #' + (topics.length + 1)
      };
      this.addTopic(activeTopic);
    }

    $log.debug('TopicService:getActiveTopic', activeTopic);

    return activeTopic;
  };

  this.setTopicResults = function(results) {
    $log.debug('TopicService:setTopicResults', results);

    var topic = this.getActiveTopic(true);
    topic.storypoints = results.value;

    this._storeTopics();

    $mdToast.show($mdToast.simple().content('Topic ' + topic.title + ' set to ' + topic.storypoints + ' storypoints.'));

    this.setNextTopicActive();
  };

  this.getJiraBoards = function() {
    $log.debug('TopicService:getJiraBoards');

    SocketService.emit('jira-get-boards', function (err, data) {
      console.log(err, data);
    });
  };

  this.watchJiraBoards = function() {
    $log.debug('TopicService:watchJiraBoards', jiraBoards);

    return jiraBoards;
  };

  this.getJiraSprints = function(board) {
    $log.debug('TopicService:getJiraSprints', board);

    SocketService.emit('jira-get-sprints', board, function (err, data) {
      console.log(err, data);
    });
  };

  this.getJiraIssues = function(sprint) {
    $log.debug('TopicService:getJiraIssues', sprint);

    SocketService.emit('jira-get-issues', sprint, function (err, data) {
      console.log(err, data);
    });
  };

  this.watchJiraSprints = function() {
    $log.debug('TopicService:watchJiraSprints', jiraSprints);

    return jiraSprints;
  };

  SocketService.on('channel-data', function(data) {
    $log.debug('TopicService:channel-data:', data);

    if (data && data.topics) {
      topics = data.topics;
      self.setNextTopicActive();
    }
  });

  var jiraBoards;

  SocketService.on('remote-jira-boards-loaded', function(data) {
    $log.debug('TopicService:remote-jira-boards-loaded:', data);

    jiraBoards = data;
  });

  var jiraSprints;

  SocketService.on('remote-jira-sprints-loaded', function(data) {
    $log.debug('TopicService:remote-jira-sprints-loaded:', data);

    jiraSprints = data;
  });

  SocketService.on('remote-jira-issues-loaded', function(data) {
    $log.debug('TopicService:remote-jira-issues-loaded:', data);

    data.forEach(function(topic){
      self.addTopic({
        title: topic.key + ': ' + topic.name,
        storypoints: topic.storypoints,
        url: topic.url
      });
    });

    self.setNextTopicActive();
  });
}]);
