const Core = require("../discord-bot-core");
const GetUrls = require("get-urls");
const GuildData = require("./models/guild-data.js");
// @ts-ignore
const Config = require("./config.json");

const token = require("../" + process.argv[2]).token,
	dataFile = process.argv[3];

const client = new Core.Client(token, dataFile, __dirname + "/commands", GuildData);

client.on("beforeLogin", () => {
	setInterval(() => checkFeedsInGuilds(client.guilds, client.guildsData), Config.feedCheckIntervalSec * 1000);
});

client.on("ready", (coreClient) => {
	parseLinksInGuilds(coreClient.actual.guilds, coreClient.guildsData)
		.then(() => checkFeedsInGuilds(coreClient.actual.guilds, coreClient.guildsData));
});

client.on("message", message => {
	const guildData = client.guildsData[message.guild.id];
	guildData.feeds.forEach(feedData => {
		if (message.channel.name === feedData.channelName)
			feedData.cachedLinks.push(...GetUrls(message.content));
	});
});

client.bootstrap();

//INTERNAL FUNCTIONS//
function checkFeedsInGuilds(guilds, guildsData) {
	Object.keys(guildsData).forEach(key => guildsData[key].checkFeeds(guilds));
}

function parseLinksInGuilds(guilds, guildsData) {
	const promises = [];
	for (let guildId of guilds.keys()) {
		const guildData = guildsData[guildId];
		if (guildData)
			promises.push(guildData.cachePastPostedLinks(guilds.get(guildId)));
	}
	return Promise.all(promises);
}