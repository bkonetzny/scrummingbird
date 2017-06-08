App.controller('TopicController', [
  '$scope', '$log', 'TopicService', '$mdDialog', 'ChannelService',
  function($scope, $log, TopicService, $mdDialog, ChannelService) {

  $scope.data = {};
  $scope.data.topics = TopicService.getTopics();
  $scope.data.issueMode = ChannelService.channelData.issue_mode;
  $scope.data.jiraBoards = TopicService.watchJiraBoards();
  $scope.data.jiraSprints = TopicService.watchJiraSprints();

  $scope.$watch(function () { return TopicService.getTopics(); }, function (newVal, oldVal) {
    if (typeof newVal !== 'undefined') {
      $log.debug('TopicController:watch:getTopics', newVal);
      $scope.data.topics = newVal;
    }
  });

  $scope.$watch(function () { return TopicService.watchJiraBoards(); }, function (newVal, oldVal) {
    if (typeof newVal !== 'undefined') {
      $log.debug('TopicController:watch:watchJiraBoards', newVal);
      $scope.data.jiraBoards = newVal;
    }
  });

  $scope.$watch(function () { return TopicService.watchJiraSprints(); }, function (newVal, oldVal) {
    if (typeof newVal !== 'undefined') {
      $log.debug('TopicController:watch:watchJiraSprints', newVal);
      $scope.data.jiraSprints = newVal;
    }
  });

  $scope.showAddTopicForm = function($event) {
    $mdDialog.show({
      targetEvent: $event,
      template:
        '<md-dialog>' +
        '  <form name="topicForm" ng-submit="addTopic(topicForm.$valid, topicTitle)">' +
        '    <md-content>' +
        '      <md-input-container>' +
        '        <label>Topic title</label>' +
        '        <input name="topicTitle" ng-model="topicTitle" required>' +
        '        <ng-messages for="topicForm.topicTitle.$error" include="templates/form-errors.inc.html">' +
        '      </md-input-container>' +
        '    </md-content>' +
        '    <div class="md-actions">' +
        '      <md-button>Add</md-button>' +
        '    </div>' +
        '  </form>' +
        '</md-dialog>',
      controller: 'TopicController'
    });
  };

  $scope.addTopic = function(isValid, data) {
    if (!isValid) return;

    $mdDialog.hide();

    TopicService.addTopic({title: $scope.topicTitle});
    $scope.topicTitle = '';

    TopicService.setNextTopicActive();
  };

  $scope.setActive = function(topic) {
    $log.debug('TopicController:setActive', topic);

    TopicService.setTopicActive(topic);
  };

  $scope.getActive = function() {
    $log.debug('TopicController:getActive');

    return TopicService.getActiveTopic(false);
  };

  $scope.removeTopic = function(topic) {
    $log.debug('TopicController:removeTopic', topic);

    TopicService.removeTopic(topic);
  };

  $scope.totalStorypoints = function() {
    var storypoints = 0;
    $scope.data.topics.forEach(function(topic){
      storypoints = storypoints + topic.storypoints;
    });

    $log.debug('TopicController:totalStorypoints', storypoints);

    return storypoints;
  };

  $scope.loadJiraSprints = function(board) {
    $log.debug('TopicController:loadJiraSprints', board);

    TopicService.getJiraSprints(board);
  };

  $scope.loadJiraIssues = function(form) {
    if (!form.$valid) return;

    $mdDialog.hide();

    $log.debug('TopicController:loadJiraIssues', form.sprint.$viewValue);

    TopicService.getJiraIssues(form.sprint.$viewValue);
  };

  $scope.jiraSelectSprint = function() {
    TopicService.getJiraBoards();

    $mdDialog.show({
      template:
        '<md-dialog>' +
        '  <form name="jiraForm" ng-submit="loadJiraIssues(jiraForm)">' +
        '    <md-content>' +
        '      <md-input-container>' +
        '        <label>Board</label>' +
        '        <md-select name="board" ng-model="jiraProject" placeholder="Select Board" required>' +
        '          <md-option ng-value="board.name" ng-repeat="board in data.jiraBoards">{{board.name}}</md-option>' +
        '        </md-select>' +
        '        <ng-messages for="jiraForm.board.$error" include="templates/form-errors.inc.html">' +
        '      </md-input-container>' +
        '      <md-input-container>' +
        '        <label>Sprint</label>' +
        '        <md-select name="sprint" ng-model="jiraSprint" placeholder="Select Sprint" required>' +
        '          <md-option ng-value="sprint.name" ng-repeat="sprint in data.jiraSprints">{{sprint.name}}</md-option>' +
        '        </md-select>' +
        '        <ng-messages for="jiraForm.sprint.$error" include="templates/form-errors.inc.html">' +
        '      </md-input-container>' +
        '    </md-content>' +
        '    <div class="md-actions">' +
        '      <md-button>Load Issues</md-button>' +
        '    </div>' +
        '  </form>' +
        '</md-dialog>',
      controller: 'TopicController'
    });
  };
}]);
