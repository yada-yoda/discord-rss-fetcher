const DiscordUtil = require("../../discord-bot-core").util;
const Core = require("../../discord-bot-core");
const FeedData = require("./feed-data.js");

module.exports = class GuildData extends Core.BaseGuildData {
	constructor({ id, feeds = [] }) {
		super(id);
		this.feeds = feeds.map(feed => new FeedData(feed));
	}

	cachePastPostedLinks(guild) {
		const promises = [];

		this.feeds.forEach(feed => {
			if (guild.channels.get(feed.channelID))
				promises.push(
					feed.updatePastPostedLinks(guild)
						.catch(err => DiscordUtil.dateError(`Error reading history in channel ${feed.channelID}: ${err.message || err}`)));
		});

		return Promise.all(promises);
	}

	checkFeeds(guild) {
		this.feeds.forEach(feed => {
			if (guild.channels.get(feed.channelID))
				feed.fetchLatest(guild);
		});
	}
};