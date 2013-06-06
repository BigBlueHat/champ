
/*
 * Hoax
 * https://github.com/nick-thompson/hoax
 *
 * Copyright (c) 2013 Nick Thompson
 * MIT License.
 */

function createNew (uri, directory) {
  console.log(uri, directory);
}

function updateExisting (uri, directory) {
  console.log(uri, directory);
}

module.exports = {
  'new': createNew,
  'update': updateExisting
};

