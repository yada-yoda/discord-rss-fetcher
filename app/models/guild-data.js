const Core = require("../../discord-bot-core");
const FeedData = require("./feed-data.js");

module.exports = class GuildData extends Core.BaseGuildData {
	constructor() {
		super();

		this.feeds = [];

		this.schema({
			feeds: [FeedData]
		});
	}

	cachePastPostedLinks(guild) {
		return Promise.all(
			this.feeds
				.filter(feed => feedIsActive(feed, guild))
				.map(feed => feed.updatePastPostedLinks(guild))
		);
	}

	checkFeeds(guild) {
		return Promise.all(
			this.feeds
				.filter(feed => feedIsActive(feed, guild))
				.map(feed => feed.fetchLatest(guild))
		);
	}
};

function feedIsActive(feed, guild) {
	return guild.channels.get(feed.channelID);
}