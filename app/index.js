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
const SAVE_FILE = "./guilds.json";

module.exports = (client) => {
	const config = require("./config.json");

	const guildsData = FileSystem.existsSync(SAVE_FILE) ? fromJSON(JsonFile.readFileSync(SAVE_FILE)) : {};
	setInterval(() => writeFile(guildsData), config.saveIntervalSec * 1000);

	parseLinksInGuilds(client.guilds, guildsData).then(() => writeFile(guildsData))
		.then(() => checkFeedsInGuilds(client.guilds, guildsData))
		.then(() => setInterval(() => checkFeedsInGuilds(client.guilds, guildsData), config.feedCheckIntervalSec * 1000)); //set up an interval to check all the feeds

	//set up an on message handler to detect when links are posted
	client.on("message", message => {
		if (message.author.id !== client.user.id) { //check the bot isn't triggering itself
			if (message.channel.type === "dm")
				HandleMessage.DM(client, config, message);
			else if (message.channel.type === "text" && message.member)
				HandleMessage.Text(client, config, message, guildsData);
		}
	});
};

const HandleMessage = {
	DM: (client, config, message) => {
		message.reply("This bot does not have any handling for direct messages. To learn more or get help please visit http://benji7425.github.io, or join my Discord server here: https://discord.gg/SSkbwSJ");
	},
	Text: (client, config, message, guildsData) => {
		//handle admins invoking commands
		if (message.content.startsWith(message.guild.me.toString()) //user is @mention-ing the bot
			&& message.member.permissions.has("ADMINISTRATOR")) //user has admin perms
		{
			const params = message.content.split(" "); //split the message at the spaces
			switch (params[1]) {
				//add handling for different commands here
				case config.commands.version:
					message.reply("v" + require("../package.json").version);
					break;
				case config.commands.addFeed:
					addFeed(client, guildsData, message);
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

function addFeed(client, guildsData, message) {
	const parameters = message.content.split(" "); //expect !addfeed <url> <channelName> <roleName>

	const feedUrl = [...GetUrls(message.content)][0];
	const channel = message.mentions.channels.first();

	if (!feedUrl || !channel)
		return message.reply("Please provide both a channel and an RSS feed URL. You can optionally @mention a role also.");

	const role = message.mentions.roles.first();

	const feedData = new FeedData({
		url: feedUrl,
		channelName: channel.name,
		roleName: role ? role.name : null
	});

	//ask the user if they're happy with the details they set up, save if yes, don't if no
	DiscordUtil.ask(client, message.channel, message.member, "Are you happy with this?\n ```JavaScript\n" + JSON.stringify(feedData, null, "\n") + "```")
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

function writeFile(guildsData) {
	JsonFile.writeFile(SAVE_FILE, guildsData, err => { if (err) DiscordUtil.dateError("Error writing file", err); });
}

function fromJSON(json) {
	const guildsData = Object.keys(json);
	guildsData.forEach(guildID => { json[guildID] = new GuildData(json[guildID]); });
	return json;
}