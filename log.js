//external library imports
var Console = require("console"); //access to debug console
var FileWriter = require("simple-file-writer"); //file writer for logging

//my imports
var Config = require("./config.json"); //config file containing other settings

var logWriter = new FileWriter(Config.logFileName);
var latestLog = "";

function log(message) {
	if (message && message !== latestLog) {
		latestLog = message; //spam reduction

		//attach a formatted date string to the beginning of everything we log
		var dateMessage = new Date().toLocaleString() + " " + message;

		Console.log(dateMessage);
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