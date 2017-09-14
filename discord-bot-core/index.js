const Config = require("./config.json");

module.exports = {
	bootstrap: require("./bootstrapper.js"),
	util: require("./util.js"),
	details: {
		website: Config.website,
		discordInvite: Config.discordInvite
	}
};
