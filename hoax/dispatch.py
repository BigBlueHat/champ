
import os
import git
import re
import json

from importer import Importer
from urlparse import urlparse
from couchdbkit import Server, FileSystemDocsLoader
from argh import *

HOAX_DIR = os.path.abspath(os.path.join(
    os.path.dirname(os.path.realpath(__file__)), os.pardir))

def validate(directory, uri):
    """
    Validate the input arguments. Returns a tuple (error, server, dbname).
    """
    regex = re.compile(
        r'^(?:http|ftp)s?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+'
        r'(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    if not regex.match(uri):
        return (CommandError('Invalid uri specified.'), None, None)
    if not os.path.exists(directory) or not os.path.isdir(directory):
        return (CommandError('Invalid directory specified.'), None, None)
    parts = urlparse(uri)
    base = '%s://%s' % (parts.scheme, parts.netloc)
    server = Server(uri=base)
    info = server.info()
    if 'couchdb' not in info:
        return (CommandError('CouchDB endpoint not found.'), None, None)
    return (None, server, parts.path.strip('/'))

@arg('directory', help='Root directory of your music folder.')
@arg('uri', help='Database endpoint location.')
def new(directory, uri):
    """
    Create a new database instance and import all valid tracks from 
    the supplied directory.
    """
    error, server, dbname = validate(directory, uri)
    if error:
        raise error
    # Create a new database
    db = server.get_or_create_db(dbname)
    # Upload valid tracks
    im = Importer(db)
    im.scan(directory)
    im.upload()
    # Install CouchApp resources
    app_dir = '%s/_design/' % (HOAX_DIR,)
    loader = FileSystemDocsLoader(app_dir)
    loader.sync(db)
    # Finished
    return 'New Hoax instance complete!'

@arg('directory', help='Root directory of your music folder.')
@arg('uri', help='Database endpoint location.')
def update(directory, uri):
    """
    Update an existing database instance with music from the supplied directory.
    """
    pass

def upgrade():
    """
    Check for and install any updates to Hoax itself.
    """
    git.cmd.Git(HOAX_DIR).pull()
    return 'Successfully installed Hoax updates.'

if __name__ == '__main__':
    dispatch_commands([new, update, upgrade])

