# Hoax
A personal music streaming server with offline caching capabilities.

## Overview
Hoax is a small Python tool for building your own streaming server powered by
music in your library. When you build a new Hoax instance, you'll be able to
play all your music from a browser, and you may choose to cache any songs
for offline playback at some later time.

## Install
Just pop this bad boy in your terminal ;).
```
curl https://raw.github.com/nick-thompson/hoax/master/install.sh | sh
```

## Usage
```
usage: dispatch.py [-h] {new,upgrade,update} ...

positional arguments:
  {new,upgrade,update}
    new                 Create a new database instance and import all valid
                        tracks from the supplied directory.
    update              Update an existing database instance with music from
                        the supplied directory.
    upgrade             Check for and install any updates to Hoax itself.

optional arguments:
  -h, --help            show this help message and exit
```

### New
Create a new Hoax database with music from your library.
```
hoax new ~/path/to/my/music/library http://localhost:5984
```

### Update
Update an existing Hoax database when your library has been updated.
```
hoax update ~/path/to/my/music/library http://localhost:5984
```

### Upgrade
Check for and install updates to Hoax.
```
hoax upgrade
```

## Contributing
Help me make this thing sweet!

Stack:
* Python for the command line stuff
* CouchDB for hosting (hoax is just a couchapp)
* AngularJS for single page app goodness
* PouchDB for client side caching

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

