'use strict';

var Client = require('mongodb').MongoClient,
	Collection = require('mongodbext').Collection,
	Steppy = require('twostep').Steppy,
	shortid = require('shortid'),
	expect = require('expect.js'),
	shortidPlugin = require('../index');

var mongodbUrl = 'mongodb://localhost:27017/mongodbext_shortid_plugin_test',
	collectionName = 'test',
	dbConnected = false,
	db;

exports.dbConnect = function(callback) {
	Steppy(
		function() {
			if (!dbConnected) {
				Client.connect(mongodbUrl, this.slot());
			} else {
				this.pass(null);
			}
		},
		function(err, _db) {
			if (!dbConnected) {
				db = _db;
				dbConnected = true;
			}

			this.pass(db);
			exports.cleanDb(this.slot());
		},
		callback
	);
};

exports.cleanDb = function(callback) {
	if (db) {
		db.collection(collectionName).deleteMany({}, callback);
	} else {
		callback();
	}
};


exports.getCollection = function(shortidPluginParams) {
	var collection = new Collection(db, collectionName);
	collection.addPlugin(shortidPlugin, shortidPluginParams);
	return collection;
};

exports.getEntity = function() {
	return {foo: 'bar'};
};

var checkError = function(err, expectedError) {
	expect(err).to.be.an(Error);
	expect(err.message).to.be.a('string');
	expect(err.message).match(expectedError);
};

exports.insertOne = function(collection, expectedError, done) {
	if (typeof expectedError === 'function') {
		done = expectedError;
		expectedError = null;
	}

	Steppy(
		function() {
			collection.insertOne(exports.getEntity(), this.slot());
		},
		function(err, doc) {
			if (expectedError) {
				checkError(err, expectedError);
			} else {
				expect(err).not.ok();
				expect(shortid.isValid(doc._id));
			}
			done();
		}
	);
};

exports.insertMany = function(collection, expectedError, done) {
	if (typeof expectedError === 'function') {
		done = expectedError;
		expectedError = null;
	}

	Steppy(
		function() {
			collection.insertMany([
				exports.getEntity(),
				exports.getEntity(),
				exports.getEntity()
			], this.slot());
		},
		function(err, docs) {
			if (expectedError) {
				checkError(err, expectedError);
			} else {
				expect(err).not.ok();
				docs.forEach(function(doc) {
					expect(shortid.isValid(doc._id)).to.be.ok();
				});
			}
			done();
		}
	);
};
