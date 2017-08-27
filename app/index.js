//node imports
const FileSystem = require("fs");

//external lib imports
const JsonFile = require("jsonfile"); //for saving to/from JSON
const Url = require("url"); //for url parsing
const GetUrls = require("get-urls"); //for extracting urls from messages

//my imports
const DiscordUtil = require("discordjs-util");

//app component imports
const GuildData = require("./models/guild-data.js");
const FeedData = require("./models/feed-data.js");

//global vars
let writeFile = null;

module.exports = (client, config = null) => {
	config = config || require("./config.json"); //load config file
	const guildsData = FileSystem.existsSync(config.generic.saveFile) ? fromJSON(JsonFile.readFileSync(config.generic.saveFile)) : {}; //read data from file, or generate new one if file doesn't exist
	writeFile = () => JsonFile.writeFile(config.generic.saveFile, guildsData, err => { if (err) DiscordUtil.dateError("Error writing file", err); });
	setInterval(() => writeFile(), config.generic.saveIntervalSec * 1000); //set interval to save data to file

	parseLinksInGuilds(client.guilds, guildsData).then(() => writeFile(guildsData))
		.then(() => checkFeedsInGuilds(client.guilds, guildsData))
		.then(() => setInterval(() => checkFeedsInGuilds(client.guilds, guildsData), config.feedCheckIntervalSec * 1000)); //set up an interval to check all the feeds

	//set up an on message handler to detect when links are posted
	client.on("message", message => {
		if (message.author.id !== client.user.id) { //check the bot isn't triggering itself
			if (message.channel.type === "dm")
				HandleMessage.dm(client, config, message);
			else if (message.channel.type === "text" && message.member)
				HandleMessage.text(client, config, message, guildsData);
		}
	});
};

const HandleMessage = {
	dm: (client, config, message) => {
		message.reply(config.generic.defaultDMResponse);
	},
	text: (client, config, message, guildsData) => {
		//handle admins invoking commands
		if (message.content.startsWith(message.guild.me.toString()) //user is @mention-ing the bot
			&& message.member.permissions.has("ADMINISTRATOR")) //user has admin perms
		{
			const params = message.content.split(" "); //split the message at the spaces

			//check which command was invoked
			switch (params[1]) {
				case config.commands.admin.version:
					message.reply("v" + require("../package.json").version);
					break;
				case config.commands.admin.addFeed:
					addFeed(client, guildsData, message, config.maxCacheSize);
					break;
				case config.commands.admin.removeFeed:
					removeFeed(client, guildsData, message);
					break;
				case config.commands.admin.viewFeeds:
					viewFeeds(client, guildsData[message.guild.id], message);
					break;
			}
		}
		else if (guildsData[message.guild.id]) {
			guildsData[message.guild.id].feeds.forEach(feedData => {
				if (message.channel.name === feedData.channelName)
					feedData.cachedLinks.push(...GetUrls(message.content)); //spread the urlSet returned by GetUrls into the cache array
			});
		}
	}
};

function addFeed(client, guildsData, message, maxCacheSize) {
	const feedUrl = [...GetUrls(message.content)][0];
	const channel = message.mentions.channels.first();

	if (!feedUrl || !channel)
		return message.reply("Please provide both a channel and an RSS feed URL. You can optionally @mention a role also.");

	const role = message.mentions.roles.first();

	const feedData = new FeedData({
		url: feedUrl,
		channelName: channel.name,
		roleName: role ? role.name : null,
		maxCacheSize: maxCacheSize
	});

	//ask the user if they're happy with the details they set up, save if yes, don't if no
	DiscordUtil.ask(client, message.channel, message.member, "Are you happy with this?\n" + feedData.toString())
		.then(responseMessage => {

			//if they responded yes, save the feed and let them know, else tell them to start again
			if (responseMessage.content.toLowerCase() === "yes") {
				if (!guildsData[message.guild.id])
					guildsData[message.guild.id] = new GuildData({ id: message.guild.id, feeds: [] });

				guildsData[message.guild.id].feeds.push(feedData);
				writeFile(guildsData);
				responseMessage.reply("Your new feed has been saved!");
			}
			else
				responseMessage.reply("Your feed has not been saved, please add it again with the correct details");
		});
}

function removeFeed(client, guildsData, message) {
	const parameters = message.content.split(" ");
	if (parameters.length !== 3)
		message.reply(`Please use the command as such:\n\`\`\` @${client.user.username} remove-feed feedid\`\`\``);
	else {
		const guildData = guildsData[message.guild.id];
		const idx = guildData.feeds.findIndex(feed => feed.id === parameters[2]);
		if (!Number.isInteger(idx))
			message.reply("Can't find feed with id " + parameters[2]);
		else {
			guildData.feeds.splice(idx, 1);
			writeFile(guildsData);
			message.reply("Feed removed!");
		}
	}
}

function viewFeeds(client, guildData, message) {
	if (!guildData)
		return;

	message.reply(guildData.feeds.map(f => f.toString()).join("\n"));
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

function fromJSON(json) {
	const guildsData = Object.keys(json);
	guildsData.forEach(guildID => { json[guildID] = new GuildData(json[guildID]); });
	return json;
}