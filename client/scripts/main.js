
var base = window.location.origin
  , name = window.location.pathname.split('/')[1]
  , db = Pouch(base + '/' + name);

function LibraryController($scope) {

  db.changes({
    include_docs: true,
    filter: 'hoax/meta',
    complete: function (err, response) {

      // Organize the response into a library heirarchy
      var library = {};
      response.results.forEach(function (track) {
        track = track.doc;

        var artist = track.artist
          , album = track.album;

        library[artist] = library[artist] || {};
        library[artist][album] = library[artist][album] || [];
        library[artist][album].push(track);

        track.attachment = '/'
          + name
          + '/' 
          + track.musicbrainz_trackid
          + '/file.mp3';
      });

      // Bind it to the dom
      $scope.$apply(function () {
        $scope.library = library;
      });
    }
  });

}

