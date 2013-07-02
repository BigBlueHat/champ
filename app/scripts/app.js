
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
      urls: [remoteApi + '/' + meta._id.split(':')[1] + '/file.mp3'],
      buffer: true,
      onend: function () {
        if (++index < $scope.library.length) {
          $scope.play(index);
        } else {
          // This doesn't work... why?
          $scope.toggle();
          $scope.libIndex = 0;
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
