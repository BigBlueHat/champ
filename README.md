# Champ [![Build Status](https://secure.travis-ci.org/nick-thompson/champ.png?branch=master)](http://travis-ci.org/nick-thompson/champ)
(Couch + Amp =) Champ is a personal music streaming server with offline caching capabilities.

## Getting Started
Before you try building a Champ server with your music collection, you
will first want to make sure it's all properly tagged. Currently, Hoax
relies on the ability to find MusicBrainz properties on the metadata tags
attached to your songs. It is highly recommended that you download
[MusicBrainz' Picard](http://beta.musicbrainz.org/doc/MusicBrainz_Picard) and
follow the instructions to
[tag your files](http://beta.musicbrainz.org/doc/How_to_Tag_Files_With_Picard).

## Install
```
npm install -g champ
```

## Usage
```

   Usage: champ [options] {create, update} uri directory

   Commands:
     create               Create a new database instance and import all valid
                          tracks from the supplied directory.
     update               Update an existing database instance with music from
                          the supplied directory.

   Arguments:
     uri                  Database endpoint location.
     directory            Root directory of your music folder.

   Options:
     -h, --help           output usage information
     -q, --quiet          Supress output to the console.

```

### Create
Create a new Champ database with music from your collection.
```
champ create http://localhost:5984/mychamp ~/path/to/my/music/library
```

### Update (Not Yet Implemented)
Update an existing Champ database when your library has been updated.
```
champ update http://localhost:5984/mychamp ~/path/to/my/music/library
```

## Contributing
Want to help me make this bad boy awesome? Great! Here's the rundown:

* Champ pushes everything through CouchDB.
* The player itself is just a CouchApp.
* Champ uses PouchDB for interfacing with CouchDB from the client.
    * Allows for easy client-side caching.

In lieu of a formal styleguide, take care to maintain the existing coding style.

## License
Copyright (C) 2012 Nick Thompson

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.

