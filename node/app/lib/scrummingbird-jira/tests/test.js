var assert = require('assert');
var ScrummingbirdJira = require('../../scrummingbird-jira');

describe('scrummingbird-jira', function (){
  var sbJira;

  before(function(done){
    sbJira = new ScrummingbirdJira({
      host: '',
      username: '',
      password: ''
    });

    done();
  });

  it('getProjects', function (done){
    sbJira.getProjects(function(err, data) {
      console.log(data);
      assert.ok(!err);
      done();
    });
  });

  it('getBoards', function (done){
    sbJira.getBoards(function(err, data) {
      console.log(data);
      assert.ok(!err);
      done();
    });
  });

  it('getSprints', function (done){
    sbJira.getSprints({boardID: 12}, function(err, data) {
      console.log(data);
      assert.ok(!err);
      done();
    });
  });

  it('getIssues', function (done){
    sbJira.getIssues({project: 'AR', sprint: 120}, function(err, data) {
      console.log(data);
      assert.ok(!err);
      done();
    });
  });

  it('listFields', function (done){
    sbJira.getStoryPointField(function(err, data) {
      console.log(data);
      assert.ok(!err);
      done();
    });
  });
});
