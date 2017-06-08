var _ = require('underscore');
var JiraApi = require('jira').JiraApi;
var log = require('../scrummingbird-logger');

function ScrummingbirdJira(config) {
  this.config = {
    protocol: 'https',
    host: config.host,
    port: '443',
    user: config.username,
    password: config.password,
    apiversion: '2',
    verbose: false,
    strictSSL: true
  };

  this.api = new JiraApi(
    this.config.protocol,
    this.config.host,
    this.config.port,
    this.config.user,
    this.config.password,
    this.config.apiversion,
    this.config.verbose,
    this.config.strictSSL
  );
};

ScrummingbirdJira.prototype.getProjects = function(cb) {
  this.api.listProjects(function(err, data){
    if (err) {
      log.error(err);
      return cb(err);
    }

    var projects = _.map(data, function(project){
      return {
        key: project.key,
        name: project.name
      };
    });

    log.info({projects: projects}, 'Get projects');

    return cb(null, projects);
  });
};

ScrummingbirdJira.prototype.getBoards = function(cb) {
  var options = {
    rejectUnauthorized: this.api.strictSSL,
    uri: this.api.makeUri('/rapidviews/list', 'rest/greenhopper/', '1.0'),
    method: 'GET',
    json: true
  };

  this.api.doRequest(options, function(err, response) {
    if (err) {
      log.error(err);
      return cb(err);
    }

    if (response.statusCode === 404) {
      return cb('Invalid URL');
    }

    if (response.statusCode !== 200) {
      return cb(response.statusCode + ': Unable to connect to JIRA.');
    }

    var boards = _.map(response.body.views, function(board){
      return {
        id: board.id,
        name: board.name
      };
    });

    log.info({projects: boards}, 'Get projects');

    return cb(null, boards);
  });
};

ScrummingbirdJira.prototype.getSprints = function(options, cb) {
  var options = {
    rejectUnauthorized: this.api.strictSSL,
    uri: this.api.makeUri('/xboard/plan/backlog/data.json?rapidViewId=' + options.boardID, 'rest/greenhopper/', '1.0'),
    method: 'GET',
    json: true
  };

  this.api.doRequest(options, function(err, response) {
    if (err) {
      log.error(err);
      return cb(err);
    }

    if (response.statusCode === 404) {
      return cb('Invalid URL');
    }

    if (response.statusCode !== 200) {
      return cb(response.statusCode + ': Unable to connect to JIRA.');
    }

    var sprints = _.chain(response.body.sprints)
      .filter(function(sprint){
        return sprint.state === 'FUTURE';
      })
      .map(function(sprint){
        return {
          id: sprint.id,
          name: sprint.name
        };
      })
      .value();

    log.info({sprints: sprints}, 'Get sprints');

    return cb(null, sprints);
  });
};

ScrummingbirdJira.prototype.getStoryPointField = function(cb) {
  this.api.listFields(function(err, data){
    if (err) {
      log.error(err);
      return cb(err);
    }

    var field = _.findWhere(data, {name: 'Story Points'});

    log.info({field: field});

    return cb(null, field);
  });
};

ScrummingbirdJira.prototype.getIssues = function(options, cb) {
  log.info({method: 'getIssues', options: options}, 'Get issues');

  var that = this;
  var searchString = 'Sprint = ' + options.sprint + ' ORDER BY Rang ASC';

  this.getStoryPointField(function(err, field){
    if (err) {
      log.error(err);
      return cb(err);
    }

    that.api.searchJira(searchString, {fields: ['summary', field.id]}, function(err, data){
      if (err) {
        log.error(err);
        return cb(err);
      }

      var issues = _.map(data.issues, function(issue){
        return {
          key: issue.key,
          name: issue.fields.summary,
          storypoints: (!_.isUndefined(issue.fields[field.id])) ? issue.fields[field.id] : null,
          url: that.config.protocol + '://' + that.config.host + '/browse/' + issue.key
        };
      });

      log.info({issues: issues}, 'Get issues');

      return cb(null, issues);
    });
  });
};

module.exports = ScrummingbirdJira;
