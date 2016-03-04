'use strict';

var expect = require('expect.js'),
	Steppy = require('twostep').Steppy,
	helpers = require('./helpers');

var entity = {foo: 'bar'};

describe('mongodbext-shortid-plugin test', function() {

	before(function(done) {
		Steppy(
			function() {
				helpers.dbConnect(this.slot());
			},
			done
		);
	});

	describe('add plugin', function() {
		it('add without params', function() {
			helpers.getCollection();
		});

		it('add with seed parameter', function() {
			helpers.getCollection({seed: 123});
		});

		it('add with characters parameter', function() {
			helpers.getCollection({
				characters: '0123456789' +
					'abcdefghijklmnopqrstuvwxyz' +
					'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
					'.~'
			});
		});

		it('add with worker parameter', function() {
			helpers.getCollection({worker: 1});
		});
	});

	describe('insert without retries', function() {
		var collection;

		before(function() {
			collection = helpers.getCollection({duplicateRetries: 0});
		});

		it('insert one', function(done) {
			helpers.insertOne(collection, done);
		});

		it('insert many', function(done) {
			helpers.insertMany(collection, done);
		});
	});

	describe('insert with retries', function() {
		var collection;

		before(function() {
			collection = helpers.getCollection();
		});

		it('insert one', function(done) {
			helpers.insertOne(collection, done);
		});

		it('insert many', function(done) {
			helpers.insertMany(collection, done);
		});
	});

	describe('insert with retries, with duplicates', function() {
		var collection,
			errorReg = /shortid duplicate/;

		before(function() {
			collection = helpers.getCollection();
			collection.count = function(_, callback) {
				callback(null, 1);
			};
		});

		it('insert one', function(done) {
			helpers.insertOne(collection, errorReg, done);
		});

		it('insert many', function(done) {
			helpers.insertMany(collection, errorReg, done);
		});
	});

	describe('insert with retries, with count error', function() {
		var collection,
			message = 'count error',
			errorReg = RegExp(message);

		before(function() {
			collection = helpers.getCollection();
			collection.count = function(_, callback) {
				callback(new Error(message));
			};
		});

		it('insert one', function(done) {
			helpers.insertOne(collection, errorReg, done);
		});

		it('insert many', function(done) {
			helpers.insertMany(collection, errorReg, done);
		});
	});
});
