const GuildData = require("./models/guild-data.js");

module.exports = {
	onReady(client, guildsData, config) {
		return new Promise((resolve, reject) => {
			parseLinksInGuilds(client.guilds, guildsData)
				.then(() => checkFeedsInGuilds(client.guilds, guildsData))
				.then(() => setInterval(() => checkFeedsInGuilds(client.guilds, guildsData), config.feedCheckIntervalSec * 1000)); //set up an interval to check all the feeds
		});
	},
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