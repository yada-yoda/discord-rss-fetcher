var console = require("console");
var Discord = require("discord.io");
var FeedRead = require("feed-read");
var BotConfig = require("./botConfig.json");
var Config = require("./config.json");

var bot = new Discord.Client({
	token: BotConfig.token,
	autorun: true
});

bot.on("ready", function () {
	console.log(bot.username + " - (" + bot.id + ")");

	setInterval(checkFeedAndPost, Config.pollingInterval);
});

bot.on("message", function (user, userID, channelID, message) {
	if (message === "ping") {
		bot.sendMessage({
			to: channelID,
			message: "pong"
		});
	}
});

function checkFeedAndPost() {
	//check the feed, with a callback
	FeedRead(Config.feedUrl, function (err, articles) {
		if (err) throw err;

		var latestLink = articles[0].link;

		//get the latest 100 messages (100 is the limit)
		bot.getMessages({
			channelID: Config.channelID,
			limit: 100
		}, function (err, messages) {
			if (err) throw err;

			//get an array of strings from the array of message objects
			var messageContents = messages.map((message) => { return message.content; });

			//if the messageContents array doesn't include the latest link, post it
			if (!messageContents.includes(latestLink))
				bot.sendMessage({
					to: Config.channelID,
					message: latestLink
				});
		});
	});
}