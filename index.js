'use strict';

var shortid = require('shortid');

var shortidArray = function(count) {
	return Array.apply(null, Array(count)).map(function() {
		return shortid.generate();
	});
};

var populateIds = function(objs, ids) {
	objs.forEach(function(obj, index) {
		obj._id = ids[index];
	});
};

module.exports = function(collection, params) {
	params = params || {};
	params.duplicateRetries = params.duplicateRetries || 5;

	if ('seed' in params) {
		shortid.seed(params.seed);
	}

	if ('characters' in params) {
		shortid.characters(params.characters);
	}

	if ('worker' in params) {
		shortid.worker(params.worker);
	}

	var addShortid = function(hookParams, callback) {
		var objs = hookParams.objs || [hookParams.obj],
			retries = 0;

		var ensureUniqIds = function(count, callback) {
			var ids = shortidArray(count);

			collection.count({
				_id: {$in: ids}
			}, function(err, duplicates) {
				if (err) return callback(err);

				if (duplicates > 0) {
					if (retries < params.duplicateRetries) {
						retries++;
						ensureUniqIds(count, callback);
					} else {
						callback(new Error('shortid duplicate'));
					}
				} else {
					callback(null, ids);
				}
			});
		};

		if (params.duplicateRetries) {
			ensureUniqIds(objs.length, function(err, ids) {
				if (err) return callback(err);

				populateIds(objs, ids);
				callback();
			});
		} else {
			populateIds(objs, shortidArray(objs.length));
			callback();
		}
	};

	collection.on('beforeInsertOne', addShortid);
	collection.on('beforeInsertMany', addShortid);
};
