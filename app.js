var storage = require('node-persist'),
	Tail = require('tail').Tail,
	parseLine = require('./lib/parseLine');

// Watch the access.log file
var tail = new Tail("access.log");

// Initialise server storage for processing access log information
storage.initSync(); // Could initialise this to persist data to a file
storage.setItem('accessLog', {});

// For every new line appended to the file, push it through to parseLine
tail.on("line", parseLine);