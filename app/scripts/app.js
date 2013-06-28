
'use strict';

var db = new Pouch('http://localhost:5984/champ2');

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
      $scope.$apply(function () {
        $scope.library = response.results.map(function (result) {
          return result.doc;
        });
      });
    }
  });
});
