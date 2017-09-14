const GetUrls = require("get-urls"); //for extracting urls from messages
const Core = require("../discord-bot-core");
const GuildData = require("./models/guild-data.js");
const FeedData = require("./models/feed-data.js");
const Config = require("./config.json");

function onReady(client, guildsData) {
	return new Promise((resolve, reject) => {
		parseLinksInGuilds(client.guilds, guildsData)
			.then(() => checkFeedsInGuilds(client.guilds, guildsData))
			.then(() => setInterval(() => checkFeedsInGuilds(client.guilds, guildsData), Config.feedCheckIntervalSec * 1000))
			.then(resolve)
			.catch(reject);
	});
}

function onTextMessage(message, guildData) {
	guildData.feeds.forEach(feedData => {
		if (message.channel.name === feedData.channelName)
			feedData.cachedLinks.push(...GetUrls(message.content)); //spread the urlSet returned by GetUrls into the cache array
	});
}

function addFeed({ guildData, message, client }) {
	const feedUrl = [...GetUrls(message.content)][0];
	const channel = message.mentions.channels.first();

	if (!feedUrl || !channel)
		return Promise.reject("Please provide both a channel and an RSS feed URL. You can optionally @mention a role also.");

	const role = message.mentions.roles.first();

	const feedData = new FeedData({
		url: feedUrl,
		channelName: channel.name,
		roleName: role ? role.name : null,
		maxCacheSize: Config.maxCacheSize
	});

	return new Promise((resolve, reject) => {
		//ask the user if they're happy with the details they set up, save if yes, don't if no
		Core.util.ask(client, message.channel, message.member, "Are you happy with this (yes/no)?\n" + feedData.toString())
			.then(responseMessage => {

				//if they responded yes, save the feed and let them know, else tell them to start again
				if (responseMessage.content.toLowerCase() === "yes") {
					if (!guildData)
						guildData = new GuildData({ id: message.guild.id, feeds: [] });

					guildData.feeds.push(feedData);
					resolve("Your new feed has been saved!");
				}
				else
					reject("Your feed has not been saved, please add it again with the correct details");
			});
	});
}

function removeFeed({ params, guildData, botName }) {
	const idx = guildData.feeds.findIndex(feed => feed.id === params[2]);
	if (!Number.isInteger(idx))
		return Promise.reject("Can't find feed with id " + params[2]);

	guildData.feeds.splice(idx, 1);
	return Promise.resolve("Feed removed!");
}

function viewFeeds(guildData) {
	if (!guildData)
		return Promise.reject("Guild not setup");

	return Promise.resolve(guildData.feeds.map(f => f.toString()).join("\n"));
}

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

module.exports = {
	onReady,
	onTextMessage,
	addFeed,
	removeFeed,
	viewFeeds
};

Core.bootstrap(require("../" + process.argv[2]), module.exports, GuildData, require("./commands.json"));