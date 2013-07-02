
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
        $scope.library = res.results.map(function (r) { return r.doc; });
        $scope.isPlaying = false;
        $scope.libIndex = 0;
      });
    }
  });

  $scope.play = function (index) {
    var meta = $scope.library[index];
    $scope.isPlaying ? $scope.toggle() : null;
    $scope.libIndex = index;
    $scope.currentTrack = new Howl({
      urls: [streamUrl(meta._id)],
      buffer: true,
      onend: function () {
        if (++index < $scope.library.length) {
          $scope.play(index);
        }
      }
    });
    $scope.currentTrack.metadata = meta;
    $scope.toggle();
  };

  $scope.toggle = function () {
    if (!$scope.currentTrack) return $scope.play(0);
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
