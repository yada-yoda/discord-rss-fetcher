const DiscordUtil = require("../../discord-bot-core").util;
const FeedData = require("./feed-data.js");

module.exports = class GuildData {
	constructor({ id, feeds }) {
		this.id = id;
		this.feeds = (feeds || []).map(feed => new FeedData(feed));
	}

	cachePastPostedLinks(guild) {
		const promises = [];

		this.feeds.forEach(feed => {
			promises.push(feed.updatePastPostedLinks(guild).catch(err => DiscordUtil.dateError(`Error reading history in ${err.path}`)));
		});

		return Promise.all(promises);
	}

	checkFeeds(guilds) {
		this.feeds.forEach(feed => feed.check(guilds.get(this.id)));
	}
};