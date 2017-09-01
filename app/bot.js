const GuildData = require("./models/guild-data.js");

module.exports = {
	onCommand(commandObj, commandsObj, params, guildData, message) {
		switch (commandObj.command) {
			case commandsObj.addFeed.command:
				return addFeed();
			case commandsObj.removeFeed.command:
				return removeFeed();
			case commandsObj.viewFeeds.command:
				return viewFeeds();
		}
	},
	onNonCommandMsg(message, guildData) {
		return;
	}
};

function addFeed() {
	//todo
}

function removeFeed() {
	//todo
}
function viewFeeds() {
	//todo
}