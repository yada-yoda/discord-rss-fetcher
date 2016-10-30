var console = require("console");
var Dns = require("dns");
var Url = require("url");
var Discord = require("discord.io");
var FeedRead = require("feed-read");
var BotConfig = require("./botConfig.json");
var Config = require("./config.json");

//get a URL object from the feedUrl so we can examine it and check connectivity later
var url = Url.parse(Config.feedUrl);

//placeholder for our bot - we need to check for connectivity before assigning this though
var bot;

//check if we can connect to discordapp.com to authenticate the bot
Dns.resolve("discordapp.com", function (err) {
	if (err) console.log("CONNECTION ERROR: Unable to locate discordapp.com to authenticate the bot (you are probably not connected to the internet). Details: " + (err.message || err));
	else {
		//if there was no error, go ahead and create and authenticate the bot
		bot = new Discord.Client({
			token: BotConfig.token,
			autorun: true
		});

		//when the bot is ready, set a polling interval for the rss feed
		bot.on("ready", function () {
			console.log(bot.username + " - (" + bot.id + ")");

			setInterval(checkFeedAndPost, Config.pollingInterval);
		});

		//easy way to check if the bot is active - replies "pong" when you type "ping" in discord
		bot.on("message", function (user, userID, channelID, message) {
			if (message === "ping") {
				bot.sendMessage({
					to: channelID,
					message: "pong"
				});
			}
		});
	}
});

function checkFeedAndPost() {
	//check that we have an internet connection (well not exactly - check that we have a connection to the host of the feedUrl)
	Dns.resolve(url.host, function (err) {
		if (err) console.log("CONNECTION ERROR: Cannot resolve host (you are probably not connected to the internet). Details: " + (err.message || err));
		else {
			//check the feed asynchronously, check the latest link when done
			FeedRead(Config.feedUrl, function (err, articles) {
				try {
					checkLinkAndPost(err, articles);
				}
				catch (ex) {
					//checkFeedAndPost is async due to being called by setInterval so the console log has to be here
					console.log("FEED ERROR: " + (ex.message || ex));
				}
			});
		}
	});
}

//checks if the link has been posted previously, posts if not
function checkLinkAndPost(err, articles) {
	if (err) throw "Error reading RSS feed: " + (err.message || err);

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
}