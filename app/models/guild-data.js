const FeedData = require("./feed-data.js");
const Util = require("discordjs-util");

module.exports = class GuildData {
	constructor({ id, feeds }) {
		this.id = id;
		this.feeds = feeds.map(feed => new FeedData(feed));
	}

	cachePastPostedLinks() {
		const promises = [];

		this.feeds.forEach(feed => {
			promises.push(feed.cachePastPostedLinks(this).catch(Util.dateError));
		});

		return Promise.all(promises);
	}

	checkFeeds(guilds) {
		this.feeds.forEach(feed => feed.check(guilds.get(this.id)));
	}
};