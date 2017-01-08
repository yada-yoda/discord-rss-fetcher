var console = require("console");
var FileWriter = require("simple-file-writer");

var logWriter = new FileWriter("./log");

var latestLog = "";

function log(message) {
	if (message && message != latestLog) {
		latestLog = message; //spam reduction

		//attach a formatted date string to the beginning of everything we log
		var dateMessage = new Date().toLocaleString() + " " + message;

		console.log(dateMessage);
		logWriter.write(dateMessage + "\n");
	}
}

module.exports = {
	info: function (message) {
		if (message)
			log("[INFO] " + message);
	},
	event: function (message, sender) {
		//if we received a message, log it - include sender information if it was passed
		if (message) {
			log("[EVENT] " + (sender ? sender + " has sent an event: " : "") + message);
		}
	},
	error: function (message, innerEx) {
		if (message) {
			//log the message, attach innerEx information if it was passed
			log("[ERROR] " + message + (innerEx ? ". Inner exception details: " + (innerEx.message || innerEx) : ""));
		}
	}
};