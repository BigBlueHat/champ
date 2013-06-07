
var base = window.location.origin
  , name = window.location.pathname.split('/')[1]
  , db = Pouch(base + '/' + name);

function LibraryController($scope) {

  db.changes({
    include_docs: true,
    filter: 'hoax/meta',
    complete: function (err, response) {
      console.log(response);
      $scope.$apply(function () {
        $scope.tracks = response.results.map(function (row) {
          row.doc.attachment = '/'
            + name
            + '/' 
            + row.doc.musicbrainz_trackid
            + '/file.mp3';
          return row.doc;
        });
        console.log($scope.tracks);
      });
    }
  });

}

