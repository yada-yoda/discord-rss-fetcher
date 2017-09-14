const Config = require("./config.json");

module.exports = {
	bootstrap(component, guildDataModel, commands) {
		require("./bootstrapper.js").bootstrap(component, guildDataModel, commands);
	},
	util: require("./util.js"),
	details: {
		website: Config.website,
		discordInvite: Config.discordInvite
	}
};
