App.service('DashboardService', [function() {
  this.data = {};

  this.data.showJoinCard = true;

  this.data.joinHash = window.location.hash.replace('/channel/', '/join/');
  this.data.joinQRcode = window.location.toString().replace('/channel/', '/join/');
}]);
