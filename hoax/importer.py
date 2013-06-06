
import os

from binascii import b2a_base64 as encode
from mutagen.easyid3 import EasyID3
from mutagen.mp3 import MP3

class Importer:

    """
    Main importing interface. Search a directory for music files,
    and import them to a CouchDB instance.
    """

    def __init__(self, db):
        self.db = db
        self.tracks = list()

    def _tag(self, track):
        """
        Tag a track for import. Constructs the CouchDB document with
        inline attachment for upload preparation.
        """
        doc = dict()
        # Resolve document properties
        id3 = MP3(track, ID3=EasyID3)
        for k, v in id3.iteritems():
            doc[k] = v[0]
        doc['_id'] = doc['musicbrainz_trackid']
        filename = '%s - %s.mp3' % (doc['artist'], doc['title'])
        doc['filename'] = filename
        # Build the attachment
        f = open(track, 'rb')
        data = encode(f.read())
        doc['_attachments'] = dict()
        doc['_attachments'][filename] = dict()
        doc['_attachments'][filename]['content_type'] = 'audio/mpeg'
        doc['_attachments'][filename]['data'] = data
        f.close()
        # Attach it to the import list
        self.tracks.append(doc)

    def scan(self, topdir):
        """
        Scan the root directory for any music files.
        """
        for root, dirs, files in os.walk(topdir):
            for name in files:
                if name.endswith('.mp3'):
                    track = os.path.join(root, name)
                    self._tag(track)

    def upload(self):
        """
        Upload the track list to the database.
        """
        # Cloudant limits json request bodies to 64mb.
        # Giant _bulk_docs queries aren't gonna work here...
        # Gotta figure out something better than this.
        for track in self.tracks:
            self.db.save_doc(track)

