const DiscordUtil = require("../../discord-bot-core").util;
const Camo = require("camo");
const Config = require("../config.json");
const Dns = require("dns"); //for host resolution checking
const Url = require("url"); //for url parsing
const { promisify } = require("util");
const FeedReadPromise = promisify(require("feed-read")); //for extracing new links from RSS feeds
const DnsResolvePromise = promisify(Dns.resolve);
const GetUrls = require("get-urls"); //for extracting urls from messages

module.exports = class FeedData extends Camo.EmbeddedDocument {
	constructor() {
		super();

		this.feedID = String;
		this.url = String;
		this.channelID = String;
		this.roleID = String;
		this.cachedLinks = [String];
		this.maxCacheSize = Number;
	}

	cache(...elements) {
		Array.prototype.push.apply(
			this.cachedLinks,
			elements
				.map(el => normaliseUrl(el))
				.filter(el => !this.cachedLinks.includes(el))
		);

		//seeing as new links come in at the end of the array, we need to remove the old links from the beginning
		this.cachedLinks.splice(0, this.cachedLinks.length - this.maxCacheSize);
	}

	updatePastPostedLinks(guild) {
		const channel = guild.channels.get(this.channelID);

		if (!channel)
			return Promise.reject("Channel not found!");

		return new Promise((resolve, reject) => {
			channel.fetchMessages({ limit: 100 })
				.then(messages => {
					/* we want to push the links in oldest first, but discord.js returns messages newest first, so we need to reverse them
					 * discord.js returns a map, and maps don't have .reverse methods, hence needing to spread the elements into an array first */
					[...messages.values()].reverse().forEach(m => this.cache(...GetUrls(m.content)));
					resolve();
				})
				.catch(reject);
		});
	}

	fetchLatest(guild) {
		const dnsPromise = DnsResolvePromise(Url.parse(this.url).host).then(() => this._doFetchRSS(guild));

		dnsPromise.catch(err => DiscordUtil.dateError("Connection error: Can't resolve host", err.message || err));

		return dnsPromise;
	}

	toString() {
		const blacklist = ["cachedLinks", "maxCacheSize"];
		return `\`\`\`JavaScript\n ${JSON.stringify(this, (k, v) => !blacklist.find(x => x === k) ? v : undefined, "\t")} \`\`\``;
	}

	_doFetchRSS(guild) {
		const feedPromise = FeedReadPromise(this.url).then(articles => this._processLatestArticle(guild, articles));

		feedPromise.catch(err => DiscordUtil.dateDebugError([`Error reading feed ${this.url}`, err]));

		return feedPromise;
	}

	_processLatestArticle(guild, articles) {
		if (articles.length === 0 || !articles[0].link)
			return;
	
		const latest = normaliseUrl(articles[0].link);
	
		if (this.cachedLinks.includes(latest))
			return;
	
		this.cache(latest);
	
		const channel = guild.channels.get(this.channelID),
			role = guild.roles.get(this.roleID);
	
		channel.send((role || "") + formatPost(articles[0]))
			.catch(err => DiscordUtil.dateDebugError(`Error posting in ${channel.id}: ${err.message || err}`));
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
	if (parsedUrl.host && parsedUrl.host.includes("youtube.com")) {
		const videoIDParam = (parsedUrl.query || "").split("&").find(x => x.startsWith("v="));
		if (videoIDParam) {
			const videoID = videoIDParam.substring(videoIDParam.indexOf("=") + 1, videoIDParam.length);
			url = "http://youtu.be/" + videoID;
		}
	}

	return url;
}