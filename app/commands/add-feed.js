const Core = require("../../discord-bot-core");
const GetUrls = require("get-urls");
const FeedRead = require("feed-read");
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
	const feedUrl = [...GetUrls(message.content)][0],
		channel = message.mentions.channels.first();

	if (!feedUrl || !channel)
		return Promise.reject("Please provide both a channel and an RSS feed URL. You can optionally @mention a role also.");

	const role = message.mentions.roles.first(),
		feedData = new FeedData({
			url: feedUrl,
			channelID: channel.id,
			roleID: role ? role.id : null,
			maxCacheSize: Config.maxCacheSize
		});

	return new Promise((resolve, reject) => {
		FeedRead(feedUrl, (err, articles) => {
			if (err)
				return reject(`Unable to add the feed due to the following error:\n${err.message}`);

			Core.util.ask(client, message.channel, message.member, "Are you happy with this (yes/no)?\n" + feedData.toString())
				.then(responseMessage => {
					if (responseMessage.content.toLowerCase() === "yes") {
						guildData.feeds.push(feedData);
						guildData.cachePastPostedLinks(message.guild)
							.then(() => resolve("Your new feed has been saved!"));
					}
					else
						reject("Your feed has not been saved, please add it again with the correct details");
				});
		});
	});
}