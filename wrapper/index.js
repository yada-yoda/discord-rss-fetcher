//node imports
const Console = require("console");

//external module imports
var Discord = require("discord.io");

var BotModules = [require("../index.js")];

var bot;

var EventHandlers = {
	onReady: () => {
		Console.info("Registered bot " + bot.username + " with id " + bot.id);

		for (let i = 0, len = BotModules.length; i < len; i++) {
			let botModule = BotModules[i];
			if (botModule.onReady) botModule.onReady(bot);
		}
	},
	onDisconnect: (err, code) => {
		Console.error("Bot was disconnected!", err, code);

		for (let i = 0, len = BotModules.length; i < len; i++) {
			let botModule = BotModules[i];
			if (botModule.onDisconnect) botModule.onDisconnect();
		}

		bot.connect();
	},
	onMessage: (user, userID, channelID, message) => {
		for (let i = 0, iLen = BotModules.length; i < iLen; i++) {
			let botModule = BotModules[i];

			if (botModule.commands) {
				for (let j = 0, jLen = botModule.commands.length; j < jLen; j++) {
					let messageTrigger = botModule.commands[j];

					if ((!messageTrigger.channelIDs && !messageTrigger.userIDs) //if we have neither channel nor user restraint, pass
						|| (messageTrigger.channelIDs && messageTrigger.channelIDs.includes(channelID)) //otherwise, if we have a channel constraint, pass if we're allowed to respond in this channel
						|| (messageTrigger.userIDs && messageTrigger.userIDs.includes(userID))) //otherwise, if we have a user constraint, pass if we're allowed to respond to this user
						switch (messageTrigger.type) {
							case "startsWith":
								if (message.startsWith(messageTrigger.command))
									messageTrigger.action(bot, user, userID, channelID, message);
								break;
							default:
								if (message === messageTrigger.command)
									messageTrigger.action(bot, user, userID, channelID, message);
						}
				}
			}

			if (botModule.onMessage) botModule.onMessage(bot, user, userID, channelID, message);
		}
	}
};

(() => {
	bot = new Discord.Client({
		token: require("./token.json").token,
		autorun: true
	});

	bot.on("ready", EventHandlers.onReady);
	bot.on("disconnect", EventHandlers.onDisconnect);
	bot.on("message", EventHandlers.onMessage);
})();