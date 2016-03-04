# mongodbext-shortid-plugin
[![Build Status](https://travis-ci.org/fleg/mongodbext-shortid-plugin.svg?branch=master)](https://travis-ci.org/fleg/mongodbext-shortid-plugin)
[![Coverage Status](https://coveralls.io/repos/fleg/mongodbext-shortid-plugin/badge.svg?branch=master&service=github)](https://coveralls.io/github/fleg/mongodbext-shortid-plugin?branch=master)

[mongodbext](https://github.com/2do2go/mongodbext) [shortid](https://github.com/dylang/shortid) plugin

### Plugin parameters
- `seed` - pass to `shortid.seed`
- `characters` - pass to `shortid.characters`
- `worker` - pass to `shortid.worker`
- `duplicateRetries` - set count of retries to generate unique `_id`, default value: `5`

### Example
```javascript
var MongoClient = require('mongodb').MongoClient,
    Collection = require('mongodbext').Collection,
    shortid = require('shortid'),
    expect = require('expect.js'),
    shortidPlugin = require('mongodbext-shortid-plugin');

MongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
    var collection = new Collection(db, 'shortidExample');

    collection.addPlugin(shortidPlugin);
    collection.insertOne({foo: 'bar'}, function(err, doc) {
        expect(shortid.isValid(doc._id)).to.be.ok();
    });
});
```
