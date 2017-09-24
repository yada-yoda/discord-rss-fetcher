const Core = require("../../discord-bot-core");
const GetUrls = require("get-urls");
const FeedData = require("../models/feed-data.js");
const GuildData = require("../models/guild-data.js");
// @ts-ignore
const Config = require("../config.json");

module.exports = new Core.Command({
	name: "add-feed",
	description: "Add an RSS feed to be posted in a channel, with an optional role to tag",
	syntax: "add-feed <url> <#channel> [@role]",
	admin: true,
	invoke: invoke
});

function invoke({ message, params, guildData, client }) {
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

	//ask the user if they're happy with the details they set up, save if yes, don't if no
	Core.util.ask(client, message.channel, message.member, "Are you happy with this (yes/no)?\n" + feedData.toString())
		.then(responseMessage => {

			//if they responded yes, save the feed and let them know, else tell them to start again
			if (responseMessage.content.toLowerCase() === "yes") {
				if (!guildData)
					guildData = new GuildData({ id: message.guild.id, feeds: [] });

				guildData.feeds.push(feedData);
				guildData.cachePastPostedLinks(message.guild)
					.then(() => message.reply("Your new feed has been saved!"));
			}
			else
				message.reply("Your feed has not been saved, please add it again with the correct details");
		});
}