const DiscordUtil = require("../../discord-bot-core").util;
// @ts-ignore
const Config = require("../config.json");
const Dns = require("dns"); //for host resolution checking
const Url = require("url"); //for url parsing
const FeedRead = require("feed-read"); //for extracing new links from RSS feeds
const GetUrls = require("get-urls"); //for extracting urls from messages
const ShortID = require("shortid"); //to provide ids for each feed, allowing guilds to remove them

module.exports = class FeedData {
	constructor({ id = null, url, channelID, roleID, cachedLinks = null, maxCacheSize, roleName = undefined, channelName = undefined }) {
		this.id = id || ShortID.generate();
		this.url = url;
		this.channelID = channelID;
		this.roleID = roleID;
		this.cachedLinks = cachedLinks || [];
		this.maxCacheSize = maxCacheSize || 10;

		//these two are actually deprecated, but need to be here for compatibility with old data files to be upgraded
		this.roleName = roleName;
		this.channelName = channelName;

		this.cachedLinks.push = (...elements) => {
			Array.prototype.push.apply(
				this.cachedLinks,
				elements
					.map(el => normaliseUrl(el))
					.filter(el => !this.cachedLinks.includes(el))
			);

			//seeing as new links come in at the end of the array, we need to remove the old links from the beginning
			this.cachedLinks.splice(0, this.cachedLinks.length - this.maxCacheSize);
		};
	}

	/**@param guild*/
	updatePastPostedLinks(guild) {
		const channel = guild.channels.get(this.channelID);

		if (!channel)
			return Promise.reject("Channel not found!");

		return new Promise((resolve, reject) => {
			channel.fetchMessages({ limit: 100 })
				.then(messages => {
					/* we want to push the links in oldest first, but discord.js returns messages newest first, so we need to reverse them
					 * discord.js returns a map, and maps don't have .reverse methods, hence needing to spread the elements into an array first */
					[...messages.values()].reverse().forEach(m => this.cachedLinks.push(...GetUrls(m.content)));
					resolve();
				})
				.catch(reject);
		});
	}

	/**@param guild */
	fetchLatest(guild) {
		Dns.resolve(Url.parse(this.url).host || "", err => {
			if (err)
				DiscordUtil.dateError("Connection Error: Can't resolve host", err.message || err);
			else
				this._doFetchRSS(guild);
		});
	}

	toString() {
		const blacklist = ["cachedLinks", "maxCacheSize"];
		return `\`\`\`JavaScript\n ${JSON.stringify(this, (k, v) => !blacklist.find(x => x === k) ? v : undefined, "\t")} \`\`\``;
	}

	_doFetchRSS(guild) {
		FeedRead(this.url, (err, articles) => {
			//filter out "Body is not RSS or ATOM" errors because these seem to happen rather frequently
			if (err) {
				if (err.message !== "Body is not RSS or ATOM")
					DiscordUtil.dateError("Error reading RSS feed: " + (err.message || err));
				return;
			}

			if (articles.length > 0) {

				const latest = normaliseUrl(articles[0].link);

				if (!this.cachedLinks.includes(latest)) {
					this.cachedLinks.push(latest);

					const channel = guild.channels.get(this.channelID),
						role = guild.roles.get(this.roleID);

					channel.send((role || "") + formatPost(articles[0]))
						.catch(err => DiscordUtil.dateError(`Error posting in ${channel.id}: ${err.message || err}`));
				}
			}
		});
	}
};

function formatPost(article) {
	let message = "";
	if (article.title)
		message += `\n**${article.title}**`;
	if (article.content)
		message += article.content.length > Config.charLimit ? "\nArticle content too long for a single Discord message!" : `\n${article.content}`;
	if (article.link)
		message += `\n\n${normaliseUrl(article.link)}`;
	return message;
}

function normaliseUrl(url) {
	url = url.replace("https://", "http://"); //hacky way to treat http and https the same

	const parsedUrl = Url.parse(url);
	if (parsedUrl.host.includes("youtube.com")) {
		const videoIDParam = (parsedUrl.query || "").split("&").find(x => x.startsWith("v="));
		if (videoIDParam) {
			const videoID = videoIDParam.substring(videoIDParam.indexOf("=") + 1, videoIDParam.length);
			url = "http://youtu.be/" + videoID;
		}
	}

	return url;
}