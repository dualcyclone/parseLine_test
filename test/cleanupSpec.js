var chai = require('chai'),
    expect = chai.expect,
    sinon = require('sinon'),
	storage = require('node-persist'),
    cleanup = require('../lib/cleanup'),
	clock;

before(function () { 
	clock = sinon.useFakeTimers(0, 'Date'); 
});
after(function () { 
	clock.restore(); 
});

describe('cleanup()', function () {
	"use strict";
	
	var testDate;

	beforeEach(function() {
		testDate = Date.now();
		
		storage.initSync();
		storage.setItem('accessLog', {
			'80.238.9.179': [
				{
					"date": new Date(testDate - 280000),
					"username": "Dave.Branning"
				},
				{
					"date": new Date(testDate - 260000),
					"username": "Dave.Branning"
				},
				{
					"date": new Date(testDate - 240000),
					"username": "Dave.Branning"
				},
				{
					"date": new Date(testDate - 220000),
					"username": "Dave.Branning"
				},
				{
					"date": new Date(testDate - 200000),
					"username": "Dave.Branning"
				},
				{
					"date": new Date(testDate),
					"username": "Dave.Branning"
				}
			]
		});
	});

	describe('Will cleanup access log storage', function () {
		it('Should remove logs that are over 5 minutes old', function () {
			var expectedLog = storage.getItem('accessLog'),
				tempAccessLog;
			
			function runAccessLogAssertions() {
				expect(cleanup()).to.eql(expectedLog);
				tempAccessLog = storage.getItem('accessLog');
				expect(tempAccessLog).to.eql(expectedLog);
				expect(tempAccessLog['80.238.9.179'].length).to.equal(expectedLog['80.238.9.179'].length);	
			}
			
			// Move forward just enough to remove the first log item
			clock.tick(20001);
			
			// Remove the first item from the log array
			expectedLog['80.238.9.179'].shift();
			
			runAccessLogAssertions();
			
			// Move forward just enough to remove the first log item
			clock.tick(20001);
			
			// Remove the first item from the log array
			expectedLog['80.238.9.179'].shift();
			
			runAccessLogAssertions();
			
			// Move forward just enough to remove the first log item
			clock.tick(20001);
			
			// Remove the first item from the log array
			expectedLog['80.238.9.179'].shift();
			
			runAccessLogAssertions();
			
			// Move forward just enough to remove the first log item
			clock.tick(20001);
			
			// Remove the first item from the log array
			expectedLog['80.238.9.179'].shift();
			
			runAccessLogAssertions();
		});
	});
});