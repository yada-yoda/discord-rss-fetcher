const Core = require("../../core");
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
                .map(feed => feed.updatePastPostedLinks(guild).catch(err => null))
        );
    }

    checkFeeds(guild) {
        return Promise.all(
            this.feeds
                .filter(feed => feedIsActive(feed, guild))
                .map(feed => feed.fetchLatest(guild).catch(err => null))
        );
    }
};

function feedIsActive(feed, guild) {
    return guild.channels.get(feed.channelID);
}