const Core = require("../../discord-bot-core");

module.exports = new Core.Command({
	name: "view-feeds",
	description: "View a list of configured feeds and their associated details",
	syntax: "view-feed",
	admin: true,
	invoke: invoke
});

function invoke({ message, params, guildData, client }) {
	if (!guildData)
		message.reply("Guild not setup");

	message.reply(guildData.feeds.map(f => f.toString()).join("\n"));
}