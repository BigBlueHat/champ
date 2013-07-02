
var remoteApi = window.location.origin + '/api'
  , remoteStreamApi = window.location.origin + '/stream/'
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
    complete: function (err, response) {
      if (err) return alert(JSON.stringify(err));
      var library = response.results.map(function (result) {
        return result.doc;
      });

      $scope.$apply(function () {
        $scope.library = library;
        $scope.isPlaying = false;
        $scope.libIndex = 0;
        var id = $scope.library[$scope.libIndex]['_id'].split(':')[1];
        var url = 'http://localhost:5984/champ2/' + id + '/file.mp3';
        $scope.currentTrack = new Howl({
          urls: ['http://localhost:5984/champ2/' + id + '/file.mp3'],
          buffer: true
        });
      });

    }
  });

  $scope.isPlaying = false;

  $scope.play = function (id) {
    id = id.split(':')[1];
    var url = 'http://localhost:5984/champ2/' + id + '/file.mp3';
    $scope.isPlaying = true;
    $scope.currentTrack = new Howl({
      urls: [url],
      buffer: true
    });
    $scope.resume();
  };

  $scope.pause = function () {
    $scope.isPlaying = false;
    $scope.currentTrack.pause();
  };

  $scope.resume = function () {
    $scope.isPlaying = true;
    $scope.currentTrack.play();
  };

  $scope.toggle = function () {
    $scope.isPlaying ? $scope.pause() : $scope.resume();
  };

  $scope.cache = function () {
    alert('cache!');
  };

  $scope.release = function () {
    alert('uncache!');
  };
}]);
