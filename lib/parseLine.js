var storage = require('node-persist'),
	util = require('util'),
	cleanup = require('./cleanup'),
	logEntryRegex = /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3},\d*,(SIGNIN_FAILURE|SIGNIN_SUCCESS),.*/;

// Method that will log suspicious activity for a given IP address
var parseLine = function(line) {
	var IP, success, accessInfo, accessLog, shouldReturn = false;
	
	// Ignore any entry that doesn't fulfill the understood basic log entry format
	if (logEntryRegex.test(line)) {
	
  		line = line.split(',');

		// Initialising the useful information required for this log entry, and any other localised variabled
  		IP = line[0];
		
		// if its not 'SUCCESS', I will simply assume its a failure
		success = (line[2] === 'SIGNIN_SUCCESS'); 
		accessInfo = {
			date: new Date(+line[1]),
			username: line[3]
  		};
 		
		// perform cleanup on all saved records, and return the clean access data
		accessLog = cleanup(accessInfo.date);
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
	}
	
	// If this IP appears suspicious, return this information, otherwise explicitly return null (Avoiding inconsistent return statements)
	return shouldReturn ? IP : null;
};

module.exports = parseLine;