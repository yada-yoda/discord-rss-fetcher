const Core = require("../../discord-bot-core");

module.exports = new Core.Command({
	name: "remove-feed",
	description: "Remove an RSS feed by it's ID",
	syntax: "remove-feed <dir>",
	admin: true,
	invoke: invoke
});

function invoke({ message, params, guildData, client }) {
	const idx = guildData.feeds.findIndex(feed => feed.id === params[2]);
	if (!Number.isInteger(idx))
		return Promise.reject("Can't find feed with id " + params[2]);

	guildData.feeds.splice(idx, 1);
	return Promise.resolve("Feed removed!");
}