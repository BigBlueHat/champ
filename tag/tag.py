#!/usr/bin/env python

import os
import sys
import json

from binascii import b2a_base64 as encode
from mutagen.easyid3 import EasyID3
from mutagen.mp3 import MP3

"""
Intended to be run as a script, this file will expect a filepath to be
given as an argument to the program. It will then read the ID3 tags and 
dump the JSON body to stdout.
"""

def tag(track):
    """
    Tag an .mp3 file using Mutagen, returning a dictionary representing
    the document to be inserted into CouchDB.
    """
    if not track.endswith('.mp3'):
        return None
    # Resolve document properties
    doc = dict()
    id3 = MP3(track, ID3=EasyID3)
    for k, v in id3.iteritems():
        doc[k] = v[0]
    doc['_id'] = doc['musicbrainz_trackid']
    # Build the attachment
    f = open(track, 'rb')
    data = encode(f.read())
    doc['_attachments'] = dict()
    doc['_attachments']['file.mp3'] = dict()
    doc['_attachments']['file.mp3']['content_type'] = 'audio/mpeg'
    doc['_attachments']['file.mp3']['data'] = data
    f.close()
    return doc

if __name__ == '__main__':
    args = sys.argv[1:]
    track = os.path.realpath(' '.join(args))
    data = tag(track)
    sys.stdout.write(json.dumps(data))

