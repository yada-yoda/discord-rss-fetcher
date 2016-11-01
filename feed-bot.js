var console = require("console"); //for console logging
var Dns = require("dns"); //for connectivity checking
var Url = require("url"); //for url parsing
var Uri = require("urijs"); //for finding urls within message strings
var Discord = require("discord.io"); //for obvious reasons
var FeedRead = require("feed-read"); //for rss feed reading
var BotConfig = require("./botConfig.json"); //bot config file containing bot token
var Config = require("./config.json"); //config file containing other settings

//get a URL object from the feedUrl so we can examine it and check connectivity later
var url = Url.parse(Config.feedUrl);

//placeholder for our bot - we need to check for connectivity before assigning this though
var bot;
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
		logEvent("Cached URL: " + link);
	}
	//get rid of the first array element if we have reached our cache limit
	if (cachedLinks.length > (Config.numLinksToCache || 10))
		cachedLinks.shift();
}

//check if we can connect to discordapp.com to authenticate the bot
Dns.resolve("discordapp.com", function (err) {
	if (err) reportError("CONNECTION ERROR: Unable to locate discordapp.com to authenticate the bot (you are probably not connected to the internet). Details: " + (err.message || err));
	else {
		//if there was no error, go ahead and create and authenticate the bot
		bot = new Discord.Client({
			token: BotConfig.token,
			autorun: true
		});

		//when the bot is ready, set a polling interval for the rss feed
		bot.on("ready", function () {
			logEvent(new Date().toLocaleString() + " Registered bot " + bot.username + " - (" + bot.id + ")");

			//as we don't have any links cached, we need to check recent messages
			checkPreviousMessagesForLinks();

			logEvent("Setting up timer to check feed every " + Config.pollingInterval + " milliseconds");
			setInterval(checkFeedAndPost, Config.pollingInterval);
		});

		bot.on("message", function (user, userID, channelID, message) {
			//check if the message is a link, cache it if it is
			if (linkRegExp.test(message)) {
				logEvent("Detected user posted link: " + message);
				cacheLink(Uri.withinString(message, function (url) { return url; }));
			}
		});
	}
});

function checkFeedAndPost() {
	//check that we have an internet connection (well not exactly - check that we have a connection to the host of the feedUrl)
	Dns.resolve(url.host, function (err) {
		if (err) reportError("CONNECTION ERROR: Cannot resolve host (you are probably not connected to the internet). Details: " + (err.message || err));
		else FeedRead(Config.feedUrl, checkLinkAndPost);
	});
}

//checks if the link has been posted previously, posts if not
function checkLinkAndPost(err, articles) {
	if (err) reportError("FEED ERROR: Error reading RSS feed. Details: " + (err.message || err));
	else {
		//get the latest link and check if it has already been posted and cached
		var latestLink = articles[0].link.replace("https", "http");

		if (!cachedLinks.includes(latestLink)) {
			logEvent("Attempting to post new link: " + latestLink);
			bot.sendMessage({
				to: Config.channelID,
				message: latestLink
			});
			cacheLink(latestLink);
		}
		else if (latestFeedLink != latestLink)
			logEvent("Didn't post new feed link because already detected as posted " + latestLink);

		latestFeedLink = latestLink;
	}
}

//gets last 100 messages and extracts any links found (for use on startup)
function checkPreviousMessagesForLinks() {
	var limit = 100;
	logEvent("Attempting to check past " + limit + " messages for links");
	bot.getMessages({
		channelID: Config.channelID,
		limit: limit
	}, function (err, messages) {
		if (err) reportError("Error fetching discord messages. Details: " + (err.message || err));
		else {
			logEvent("Pulled last " + messages.length + " messages, scanning for links");
			var messageContents = messages.map((x) => { return x.content; }).reverse();
			for (var message in messageContents) {
				message = messageContents[message];
				if (linkRegExp.test(message))
					cacheLink(Uri.withinString(message, function (url) { return url; }));
			}
		}
	});
}

function logEvent(message) {
	console.log(new Date().toLocaleDateString() + " " + message);
}

//logs error to console with a timestamp
function reportError(message) {
	console.log(new Date().toLocaleString() + " ERROR: " + message);
}