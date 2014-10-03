var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
	storage = require('node-persist'),
    parseLine = require('../lib/parseLine'),
	clock;

before(function () { 
	clock = sinon.useFakeTimers(); 
});
after(function () { 
	clock.restore(); 
});

describe('parseLine()', function () {
	"use strict";

	beforeEach(function() {
		storage.initSync();
		storage.setItem('accessLog', {});
	});

	describe('Will filter access log input', function () {
		it('Should ignore successful login attempts', function () {
			expect(storage.getItem('accessLog')).to.eql({});
			expect(parseLine('80.238.9.179,' + Date.now() + ',SIGNIN_SUCCESS,Dave.Branning')).to.equal(null);
			expect(storage.getItem('accessLog')).to.eql({});
		});
		
		it('Should log unsuccessful login attempts', function () {
			var testDate = new Date();
			
			expect(storage.getItem('accessLog')).to.eql({});
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(storage.getItem('accessLog')).to.eql({
				"80.238.9.179": [
					{ "date" : testDate, "username" : "Dave.Branning" }
				]
			});
		});
		
		it('Will return the suspicious IP address after at least 5 access requests from the same IP', function () {
			var testDate = new Date();
			
			expect(storage.getItem('accessLog')).to.eql({});
			
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal('80.238.9.179');
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal('80.238.9.179');
			expect(storage.getItem('accessLog')).to.eql({
				"80.238.9.179": [
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" }
				]
			});
			
			expect(parseLine('80.238.9.180,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.180,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.180,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.180,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.180,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal('80.238.9.180');
			expect(parseLine('80.238.9.180,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal('80.238.9.180');
			expect(storage.getItem('accessLog')).to.eql({
				"80.238.9.179": [
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" }
				],
				"80.238.9.180": [
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" }
				]
			});
		});
		
		it('Will clear out logs that are older than 5 minutes ago', function() {
			var testDate = new Date();
			
			expect(storage.getItem('accessLog')).to.eql({});
			
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			
			expect(storage.getItem('accessLog')).to.eql({
				"80.238.9.179": [
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" },
					{ "date" : testDate, "username" : "Dave.Branning" }
				]
			});
			
			// Move forward just over 5 minutes
			clock.tick(300001);
			
			expect(parseLine('80.238.9.179,' + (+testDate) + ',SIGNIN_FAILURE,Dave.Branning')).to.equal(null);
			
			expect(storage.getItem('accessLog')).to.eql({
				"80.238.9.179": [
					{ "date" : testDate, "username" : "Dave.Branning" }
				]
			});
		});
	});
});