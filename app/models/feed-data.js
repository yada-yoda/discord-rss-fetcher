module.exports = class FeedData {
	constructor({ link, channelName, roleName, cachedLinks }) {
		this.link = link;
		this.channelName = channelName;
		this.roleName = roleName;
		this.cachedLinks = cachedLinks | [];
	}

	/**
	 * Returns a promise providing all the links posted in the last 100 messages
	 * @param {Discord.Guild} guild The guild this feed belongs to
	 * @returns {Promise<string[]>} Links posted in last 100 messages
	 */
	updatePastPostedLinks(guild) {
		const channel = guild.channels.find(ch => ch.type === "text" && ch.name === this.channelName);

		return new Promise((resolve, reject) => {
			channel.fetchMessages({ limit: 100 })
				.then(messages => {
					messages.forEach(m => Array.prototype.push.apply(this.cachedLinks, getUrls(m))); //push all the links in each message into our links array
					resolve(this);
				})
				.catch(reject);
		});
	}
};

function getUrls(str) {
	return str.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
}