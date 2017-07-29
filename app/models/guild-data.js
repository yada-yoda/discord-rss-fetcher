const FeedData = require("./feed-data.js");
const Util = require("discordjs-util");

module.exports = class GuildData {
	constructor({ id, feeds }) {
		this.id = id;
		this.feeds = feeds.filter(feed => new FeedData(feed));
	}

	cachePastPostedLinks() {
		let i = 0;
		const recurse = () => {
			this.feeds[i++].cachePastPostedLinks(this)
				.catch(Util.dateError)
				.then(recurse);
			if (i > this.feeds.length)
				return Promise.resolve();
		};

	}
};