const Core = require("../../discord-bot-core");
const FeedData = require("./feed-data.js");

module.exports = class GuildData extends Core.BaseGuildData {
	constructor() {
		super();

		this.feeds = [FeedData];
	}

	cachePastPostedLinks(guild) {
		return Promise.all(
			this.feeds.map(feed => guild.channels.get(feed.channelID) ? feed.updatePastPostedLinks(guild) : Promise.resolve())
		);
	}

	checkFeeds(guild) {
		return Promise.all(
			this.feeds.map(feed => 
				guild.channels.get(feed.channelID) ? feed.fetchLatest(guild) : Promise.resolve())
		);
	}
};