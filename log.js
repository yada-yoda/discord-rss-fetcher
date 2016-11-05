var console = require("console");

function log(message) {
    if (message)
        //attach a formatted date string to the beginning of everything we log
        console.log(new Date().toLocaleString() + " " + message);
}

module.exports = {
    info: function (message) {
        if (message)
            this.log("INFO: " + message);
    },
    event: function (message, sender) {
        //if we received a message, log it - include sender information if it was passed
        if (message) {
            log("EVENT: " + (sender ? sender + " has sent an event: " : "") + messsage);
        }
    },
    error: function (message, innerEx) {
        if (message) {
            //log the message, attach innerEx information if it was passed
            log("ERROR: " + message + (innerEx ? ". Inner exception details: " + (innerEx.message || innerEx) : ""));
        }
    }
}