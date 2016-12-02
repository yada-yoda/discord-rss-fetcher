var Dns = require("dns"); //for connectivity checking
var Url = require("url"); //for url parsing
var Uri = require("urijs"); //for finding urls within message strings
var Discord = require("discord.io"); //for obvious reasons
var FeedRead = require("feed-read"); //for rss feed reading
var BotConfig = require("./bot-config.json"); //bot config file containing bot token
var Config = require("./config.json"); //config file containing other settings
var Log = require("./log.js"); //some very simple logging functions I made

//get a URL object from the feedUrl so we can examine it and check connectivity later
var url = Url.parse(Config.feedUrl);

//placeholder for our bot - we need to check for connectivity before assigning this though
var bot;
var timer = false;
var latestFeedLink = "";
var linkRegExp = new RegExp(["http", "https", "www"].join("|"));
var cachedLinks = [];

//caches a link so we can check again later
function cacheLink(link) {
	//cheaty way to get around http and https not matching
	link = link.replace("https://", "http://");
	//store the new link if not stored already
	if (!cachedLinks.includes(link)) {
		cachedLinks.push(link);
		Log.info("Cached URL: " + link);
	}
	//get rid of the first array element if we have reached our cache limit
	if (cachedLinks.length > (Config.numLinksToCache || 10))
		cachedLinks.shift();
}

//check if we can connect to discordapp.com to authenticate the bot
Dns.resolve("discordapp.com", function (err) {
	if (err) Log.error("CONNECTION ERROR: Unable to locate discordapp.com to authenticate the bot (you are probably not connected to the internet).", err);
	else {
		//if there was no error, go ahead and create and authenticate the bot
		bot = new Discord.Client({
			token: BotConfig.token,
			autorun: true
		});

		//when the bot is ready, set a polling interval for the rss feed
		bot.on("ready", function () {
			Log.info("Registered bot " + bot.username + " - (" + bot.id + ")");

			//as we don't have any links cached, we need to check recent messages
			checkPreviousMessagesForLinks();

			Log.info("Setting up timer to check feed every " + Config.pollingInterval + " milliseconds");

			if (!timer) {
				setInterval(checkFeedAndPost, Config.pollingInterval);
				timer = true;
			}
		});

		bot.on("disconnect", function (err, code) {
			//do a bunch of logging
			Log.event("Bot was disconnected! " + code ? code : "No disconnect code provided", "Discord.io");
			if (err) Log.error("Bot disconnected!", err);
			Log.info("Trying to reconnect bot");

			//then actually attempt to reconnect
			bot.connect();
		});

		bot.on("message", function (user, userID, channelID, message) {
			//check if the message contains a link, in the right channel, and not the latest link from the rss feed
			if (channelID === Config.channelID && linkRegExp.test(message) && (message !== latestFeedLink)) {
				Log.event("Detected posted link in this message: " + message, "Discord.io");
				//detect the url inside the string, and cache it
				Uri.withinString(message, function (url) {
					cacheLink(url);
					return url;
				});
			}
		});
	}
});

function checkFeedAndPost() {
	//check that we have an internet connection (well not exactly - check that we have a connection to the host of the feedUrl)
	Dns.resolve(url.host, function (err) {
		if (err) Log.error("CONNECTION ERROR: Cannot resolve host (you are probably not connected to the internet)", err);
		else FeedRead(Config.feedUrl, checkLinkAndPost);
	});
}

//checks if the link has been posted previously, posts if not
function checkLinkAndPost(err, articles) {
	if (err) Log.error("FEED ERROR: Error reading RSS feed.", err);
	else {
		//get the latest link and check if it has already been posted and cached
		var latestLink = articles[0].link.replace("https", "http");

		//check whether the latest link out the feed exists in our cache
		if (!cachedLinks.includes(latestLink)) {
			Log.info("Attempting to post new link: " + latestLink);

			//send a messsage containing the new feed link to our discord channel
			bot.sendMessage({
				to: Config.channelID,
				message: latestLink
			}, function (err, message) {
				if (err) {
					Log.error("ERROR: Failed to send message: " + message.substring(0, 15) + "...", err);
					//if there is an error posting the message, check if it is because the bot isn't connected
					if (bot.connected)
						Log.info("Connectivity seems fine - I have no idea why the message didn't post");
					else {
						Log.error("Bot appears to be disconnected! Attempting to reconnect...", err);

						//attempt to reconnect
						bot.connect();
					}
				}
			});

			//finally make sure the link is cached, so it doesn't get posted again
			cacheLink(latestLink);
		}
		else if (latestFeedLink != latestLink)
			//alternatively, if we have a new link from the feed, but its been posted already, just alert the console
			Log.info("Didn't post new feed link because already detected as posted " + latestLink);

		//ensure our latest feed link variable is up to date, so we can track when the feed updates
		latestFeedLink = latestLink;
	}
}

//gets last 100 messages and extracts any links found (for use on startup)
function checkPreviousMessagesForLinks() {
	var limit = 100;
	Log.info("Attempting to check past " + limit + " messages for links");

	//get the last however many messsages from our discord channel
	bot.getMessages({
		channelID: Config.channelID,
		limit: limit
	}, function (err, messages) {
		if (err) Log.error("Error fetching discord messages.", err);
		else {
			Log.info("Pulled last " + messages.length + " messages, scanning for links");

			//extract an array of strings from the array of message objects
			var messageContents = messages.map((x) => { return x.content; }).reverse();

			for (var messageIdx in messageContents) {
				var message = messageContents[messageIdx];

				//test if the message contains a url
				if (linkRegExp.test(message))
					//detect the url inside the string, and cache it
					Uri.withinString(message, function (url) {
						cacheLink(url);
						return url;
					});
			}
		}
	});
}