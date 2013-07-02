
var remoteApi = window.location.origin + '/api'
  , app;

// Create and configure Angular app
app = angular.module('champ', []).config(function ($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainCtrl'
  }).otherwise({
    redirectTo: '/'
  });
});

// Define a PouchDB service
app.factory('remote', function () {
  return new Pouch(remoteApi);
});

// Define the main controller
app.controller('MainCtrl', ['$scope', 'remote', function ($scope, remote) {

  var fid = function (mid) {
    return mid.split(':')[1];
  };

  var streamUrl = function (mid) {
    return remoteApi + '/' + fid(mid) + '/file.mp3';
  };

  remote.changes({
    include_docs: true,
    filter: 'champ/meta',
    complete: function (err, res) {
      if (err) return alert(JSON.stringify(err));
      $scope.$apply(function () {

        // Prepare the scope
        $scope.library = res.results.map(function (r) { return r.doc; });
        $scope.isPlaying = false;
        $scope.libIndex = 0;

        // Assign a default current track
        var meta = $scope.library[$scope.libIndex];
        $scope.currentTrack = new Howl({
          urls: [streamUrl(meta._id)],
          buffer: true
        });
        $scope.currentTrack.metadata = meta;

      });
    }
  });

  $scope.play = function (id) {
    id = id.split(':')[1];
    var url = 'http://localhost:5984/champ2/' + id + '/file.mp3';
    $scope.currentTrack = new Howl({
      urls: [url],
      buffer: true
    });
    $scope.toggle();
  };

  $scope.toggle = function () {
    $scope.isPlaying ? $scope.currentTrack.pause() : $scope.currentTrack.play();
    $scope.isPlaying = !$scope.isPlaying;
  };

  $scope.cache = function () {
    alert('cache!');
  };

  $scope.release = function () {
    alert('uncache!');
  };

}]);
