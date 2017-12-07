const Core = require("../discord-bot-core");
const GetUrls = require("get-urls");
const GuildData = require("./models/guild-data.js");
// @ts-ignore
const Config = require("./config.json");

const token = require("../" + process.argv[2]).token,
	dataFile = process.argv[3];

const client = new Core.Client(token, dataFile, __dirname + "/commands", GuildData);

client.on("beforeLogin", () => {
	setInterval(() => checkFeedsInGuilds(), Config.feedCheckIntervalSec * 1000);
});

client.on("ready", () => {
	parseLinksInGuilds()
		.then(() => checkFeedsInGuilds());
});

client.on("message", message => {
	if (message.channel.type !== "text" || !message.member)
		return;

	client.guildDataModel.findOne({ guildID: message.guild.id })
		.then(guildData => {
			if (guildData)
				guildData.feeds.forEach(feedData => {
					if (message.channel.id === feedData.channelID)
						feedData.cachedLinks.push(...GetUrls(message.content));
				});
		});

});

client.bootstrap();

//INTERNAL FUNCTIONS//
function checkFeedsInGuilds() {
	client.guildDataModel.find().then(guildDatas =>
		guildDatas.forEach(guildData =>
			guildData.checkFeeds(client.guilds.get(guildData.guildID))));
}

function parseLinksInGuilds() {
	const promises = [];
	client.guildDataModel.find().then(guildDatas =>
		guildDatas.forEach(guildData => promises.push(guildData.cachePastPostedLinks(client.guilds.get(guildData.guildID)))));

	return Promise.all(promises);
}