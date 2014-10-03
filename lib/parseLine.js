var storage = require('node-persist'),
	util = require('util'),
	cleanup = require('./cleanup');

// Method that will log suspicious activity for a given IP address
var parseLine = function(line) {
  	line = line.split(',');

	// Initialising the useful information required for this log entry, and any other localised variabled
  	var IP = line[0],
		success = (line[2] === 'SIGNIN_SUCCESS'),
		accessInfo = {
			date: new Date(+line[1]),
			username: line[3]
  		},
		accessLog = cleanup(accessInfo.date), // perform cleanup on all saved records, and return the clean access data
		shouldReturn = false;

	// Log entry if this attempt hasn't succeeded
	if (!success) {
		// if this IP hasn't been logged, initialise a log entry
		if (!accessLog[IP]) {
			accessLog[IP] = [];
		}
		
		// Immediately store the access information
		accessLog[IP].push(accessInfo);
			
		// Have there been 5 or more failed attempts from this IP address? Log it!
		if (accessLog[IP].length >= 5){
			// output an error using the IP which is recording suspicious activity
			util.error(IP); 
			shouldReturn = true;
		}
	}
	
	// Persist the access info for the next time
	storage.setItem('accessLog', accessLog);
	// If this IP appears suspicious, return this information, otherwise explicitly return null
	return shouldReturn ? IP : null;
};

module.exports = parseLine;