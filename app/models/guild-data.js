const Feed = require("./feed.js");

module.exports = class GuildData {
	constructor({id, feeds}) {
		this.id = id;
		this.feeds = feeds.filter(feed => new Feed(feed));
	}
};