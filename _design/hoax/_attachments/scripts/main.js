
var base = window.location.origin
  , name = window.location.pathname.split('/')[1]
  , db = Pouch(base + '/' + name);

function LibraryController($scope) {

  $scope.tracks = [{ artist: 'me' }, { artist: 'you' }];

  db.allDocs({ include_docs: true }, function (err, response) {
    console.log(response);
    $scope.$apply(function () {
      $scope.tracks = response.rows.map(function (row) {
        return row.doc;
      });
      console.log($scope.tracks);
    });
  });

}

