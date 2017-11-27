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
		return Promise.reject("Guild not setup");

	const numToShow = 10;
	const startIdx = params[0] ? (params[0] - 1) * numToShow : 0;
	const endIdx = startIdx + numToShow + 1;

	let responseStr = guildData.feeds.map(f => f.toString()).slice(startIdx, endIdx).join("\n");
	if (guildData.feeds.length > endIdx)
		responseStr += `Use *view-feeds ${startIdx + 2}* to view more`;
	return Promise.resolve(responseStr);
}