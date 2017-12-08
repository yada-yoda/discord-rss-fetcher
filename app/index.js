const Core = require("../discord-bot-core");
const GetUrls = require("get-urls");
const GuildData = require("./models/guild-data.js");
// @ts-ignore
const Config = require("./config.json");

const guildsIterator = (function* () {
	while (true) {
		if (client.guilds.size === 0)
			yield null;
		else
			for (let i = 0; i < client.guilds.size; i++)
				yield [...client.guilds.values()][i];
	}
})();

const token = require("../" + process.argv[2]).token,
	dataFile = process.argv[3];

const client = new Core.Client(token, dataFile, __dirname + "/commands", GuildData);

client.on("beforeLogin", () =>
	setInterval(doGuildIteration, Config.feedCheckInterval));

client.on("ready", () => {
	parseLinksInGuilds().then(doGuildIteration);
	require("./legacy-upgrader.js")(); //upgrade legacy json into new database format
});

client.on("message", message => {
	if (message.channel.type !== "text" || !message.member)
		return;

	client.guildDataModel.findOne({ guildID: message.guild.id })
		.then(guildData => {
			if (guildData) {
				guildData.feeds.forEach(feedData =>
					message.channel.id === feedData.channelID && feedData.cache(...GetUrls(message.content)));
				guildData.save();
			}
		});
});

client.bootstrap();

//INTERNAL FUNCTIONS//
function doGuildIteration() {
	const guild = guildsIterator.next().value;
	guild && client.guildDataModel.findOne({ guildID: guild.id })
		.then(guildData => guildData && guildData.checkFeeds(guild));
}

function parseLinksInGuilds() {
	const promises = [];
	client.guildDataModel.find().then(guildDatas =>
		guildDatas.forEach(guildData => {
			if (client.guilds.get(guildData.guildID))
				promises.push(guildData.cachePastPostedLinks(client.guilds.get(guildData.guildID)));
		}));

	return Promise.all(promises);
}