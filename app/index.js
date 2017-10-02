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
	doUpgradeJSON();

	parseLinksInGuilds()
		.then(() => checkFeedsInGuilds());

	client.on("message", message => {
		if (message.channel.type !== "text" || !message.member)
			return;

		const guildData = client.guildsData[message.guild.id];
		if (guildData)
			guildData.feeds.forEach(feedData => {
				if (message.channel.name === feedData.channelName)
					feedData.cachedLinks.push(...GetUrls(message.content));
			});
	});
});

client.bootstrap();

//INTERNAL FUNCTIONS//
function checkFeedsInGuilds() {
	client.guilds.forEach(guild => {
		const guildData = client.guildsData[guild.id];
		if (guildData)
			guildData.checkFeeds(guild);
	});
}

function parseLinksInGuilds() {
	const promises = [];
	for (let guildId of client.guilds.keys()) {
		const guildData = client.guildsData[guildId];
		if (guildData)
			promises.push(guildData.cachePastPostedLinks(client.guilds.get(guildId)));
	}
	return Promise.all(promises);
}

function doUpgradeJSON() {
	Object.keys(client.guildsData).forEach(id => {
		const guild = client.guilds.get(id);
		if (!guild)
			return;

		client.guildsData[id].feeds.forEach(feed => {
			if (feed.roleName) {
				feed.roleID = client.guilds.get(id).roles.find(x => x.name.toLowerCase() === feed.roleName.toLowerCase()).id;
				delete feed.roleName;
			}

			if (feed.channelName) {
				feed.channelID = client.guilds.get(id).channels.find(x => x.name.toLowerCase() === feed.channelName.toLowerCase()).id;
				delete feed.channelName;
			}
		});
	});
}