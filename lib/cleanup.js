var storage = require('node-persist'),
	executionTime;

// Simple filter to ensure any record saved has occurred within a 5 minute window previous of the execution time
var accessLogFilter = function(accessItem){
	return (+accessItem.date) > (+executionTime - 300000);
};

// Method to clean the access log to ensure the information is kept lean within 5 minutes of the execution time
var cleanup = function(date) {
	var accessLog = storage.getItem('accessLog');
	
	// Save the new execution time
	executionTime = Date.now();
	
	// Filter all of the records stored in the access log (to ensure old records are always pruned)
	for (var i in accessLog) {
		accessLog[i] = accessLog[i].filter(accessLogFilter);

		// If the filter has removed all of the logs for the given IP, delete the IP log itself
		if (accessLog[i].length === 0) {
			delete accessLog[i];
		}
	}
	
	return accessLog;
};

module.exports = cleanup;