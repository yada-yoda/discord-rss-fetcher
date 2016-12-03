var Dns = require("dns"); //for connectivity checking
var Url = require("url"); //for url parsing
var Uri = require("urijs"); //for finding urls within message strings
var Discord = require("discord.io"); //for obvious reasons
var FeedRead = require("feed-read"); //for rss feed reading
var BotConfig = require("./bot-config.json"); //bot config file containing bot token
var Config = require("./config.json"); //config file containing other settings
var Log = require("./log.js"); //some very simple logging functions I made

var isTimer = false;

var Bot = {
	bot: null,
	startup: function () {
		//check if we can connect to discordapp.com to authenticate the bot
		Dns.resolve("discordapp.com", function (err) {
			if (err) Log.error("CONNECTION ERROR: Unable to locate discordapp.com to authenticate the bot (you are probably not connected to the internet).", err);
			else {
				//if there was no error, go ahead and create and authenticate the bot
				this.bot = new Discord.Client({
					token: BotConfig.token,
					autorun: true
				});

				//set up the bot's event handlers
				this.bot.on("ready", this.onReady);
				this.bot.on("disconnect", this.onDisconnect);
				this.bot.on("message", this.onMessage);
			}
		});
	},
	onReady: function () {
		Log.info("Registered bot " + this.bot.username + " - (" + this.bot.id + ")");

		//as we don't have any links cached, we need to check recent messages
		this.checkPastMessagesForLinks();

		Log.info("Setting up timer to check feed every " + Config.pollingInterval + " milliseconds");

		if (!isTimer) {
			setInterval(Feed.checkAndPost, Config.pollingInterval);
			isTimer = true;
		}
	},
	onDisconnect: function (err, code) {
		//do a bunch of logging
		Log.event("Bot was disconnected! " + code ? code : "No disconnect code provided", "Discord.io");
		if (err) Log.error("Bot disconnected!", err);
		Log.info("Trying to reconnect bot");

		//then actually attempt to reconnect
		this.bot.connect();
	},
	onMessage: function (user, userID, channelID, message) {
		//check if the message contains a link, in the right channel, and not the latest link from the rss feed
		if (channelID === Config.channelID && Links.regExp.test(message) && (message !== Links.latestFromFeed)) {
			Log.event("Detected posted link in this message: " + message, "Discord.io");
			//detect the url inside the string, and cache it
			Uri.withinString(message, function (url) {
				Links.cache(url);
				return url;
			});
		}
	},
	//gets last 100 messages and extracts any links found (for use on startup)
	checkPastMessagesForLinks: function () {
		var limit = 100;
		Log.info("Attempting to check past " + limit + " messages for links");

		//get the last however many messsages from our discord channel
		Bot.bot.getMessages({
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
					if (Links.regExp.test(message))
						//detect the url inside the string, and cache it
						Uri.withinString(message, function (url) {
							Links.cache(url);
							return url;
						});
				}
			}
		});
	}
};

var YouTube = {
	url: {
		share: "http://youtu.be/",
		full: "http://www.youtube.com/watch?v=",
		convertShareToFull: function (shareUrl) {
			return shareUrl.replace(this.share, this.full);
		},
		convertFullToShare: function (fullUrl) {
			var shareUrl = fullUrl.replace(this.share, this.full);

			if (shareUrl.includes("&"))
				shareUrl = shareUrl.slice(0, fullUrl.indexOf("&"));

			return shareUrl;
		}
	},
};

var Links = {
	regExp: new RegExp(["http", "https", "www"].join("|")),
	cached: [],
	latestFromFeed: "",
	cache: function (link) {
		//cheaty way to get around http and https not matching
		link = link.replace("https://", "http://");
		//store the new link if not stored already
		if (!this.cached.includes(link)) {
			this.cached.push(link);
			Log.info("Cached URL: " + link);
		}
		//get rid of the first array element if we have reached our cache limit
		if (this.cached.length > (Config.numLinksToCache || 10))
			this.cached.shift();
	},
	checkCache: function (link) {
		if (Config.youtubeMode && link.includes(link)) {
			return this.cached.includes(YouTube.convertFullToShare(link));
		}
		return this.cached.includes(link);
	},
	validateAndPost: function (err, articles) {
		if (err) Log.error("FEED ERROR: Error reading RSS feed.", err);
		else {
			//get the latest link and check if it has already been posted and cached
			var latestLink = articles[0].link.replace("https", "http");

			//check whether the latest link out the feed exists in our cache
			if (!this.checkCache(latestLink)) {
				if (Config.youtubeMode && latestLink.includes(YouTube.fullUrl))
					latestLink = YouTube.convertFullToShare(latestLink);
				Log.info("Attempting to post new link: " + latestLink);

				//send a messsage containing the new feed link to our discord channel
				Bot.bot.sendMessage({
					to: Config.channelID,
					message: latestLink
				}, function (err, message) {
					if (err) {
						Log.error("ERROR: Failed to send message: " + message.substring(0, 15) + "...", err);
						//if there is an error posting the message, check if it is because the bot isn't connected
						if (Bot.bot.connected)
							Log.info("Connectivity seems fine - I have no idea why the message didn't post");
						else {
							Log.error("Bot appears to be disconnected! Attempting to reconnect...", err);

							//attempt to reconnect
							Bot.bot.connect();
						}
					}
				});

				//finally make sure the link is cached, so it doesn't get posted again
				this.cache(latestLink);
			}
			else if (this.latestFromFeed != latestLink)
				//alternatively, if we have a new link from the feed, but its been posted already, just alert the console
				Log.info("Didn't post new feed link because already detected as posted " + latestLink);

			//ensure our latest feed link variable is up to date, so we can track when the feed updates
			this.latestFromFeed = latestLink;
		}
	}
};

var Feed = {
	urlObj: Url.parse(Config.feedUrl),
	checkAndPost: function () {
		//check that we have an internet connection (well not exactly - check that we have a connection to the host of the feedUrl)
		Dns.resolve(this.urlObj.host, function (err) {
			if (err) Log.error("CONNECTION ERROR: Cannot resolve host (you are probably not connected to the internet)", err);
			else FeedRead(Config.feedUrl, Links.checkAndPost);
		});
	}
};