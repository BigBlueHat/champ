
var api = window.location.origin + '/api'
  , streamApi = window.location.origin + '/stream/';

var db = new Pouch(api);

angular.module('champ', []).config(function ($routeProvider) {
  $routeProvider.when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainCtrl'
  }).otherwise({
    redirectTo: '/'
  });
});

angular.module('champ').controller('MainCtrl', function ($scope) {

  db.changes({
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
});
